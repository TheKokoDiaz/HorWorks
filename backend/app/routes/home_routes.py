"""
home_routes.py — Todas las rutas del backend unificadas en un solo Blueprint.

Registrar UNA sola vez en app/__init__.py:

    from app.routes.home_routes import home_bp
    app.register_blueprint(home_bp, url_prefix='/api')

Todas las rutas requieren JWT (@jwt_required()) — el cliente debe mandar
"Authorization: Bearer <access_token>" obtenido en POST /api/login.
La identidad del usuario ya NO es una constante fija: sale del token
(get_jwt_identity()) en cada request.

    /api/tareas/                              GET, POST
    /api/tareas/<id>                          PUT, DELETE
    /api/tareas/<id>/evidencias               POST
    /api/tareas/<id>/evidencias/<evidencia_id> DELETE
    /api/proyectos/                           GET
    /api/proyectos/<id>                       GET
    /api/dashboard/banner                     GET
    /api/dashboard/destacadas                 GET
    /api/dashboard/estadisticas               GET
    /api/actividad/                           GET
"""

from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from sqlalchemy import func, or_
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.home import Usuario, Equipo, Grupo, Tarea, Evidencia, Actividad
from app.services import google_calendar_service as gcal
from app.services import gemini_service

home_bp = Blueprint('home_bp', __name__)


# =========================================================
# CONTROL DE ACCESO
# =========================================================
def _equipos_del_usuario(usuario_id):
    """IDs de los equipos a los que pertenece el usuario."""
    return [g.EQU_Id for g in Grupo.query.filter_by(USU_Id=usuario_id).all()]


def _puede_acceder_tarea(tarea, usuario_id, equipos_ids=None):
    """
    Dueño de la tarea, o miembro del equipo al que está asignada (si aplica).
    equipos_ids se puede precalcular y pasar para no repetir la query.
    """
    if tarea.USU_Id == usuario_id:
        return True
    if tarea.EQU_Id is not None:
        if equipos_ids is None:
            equipos_ids = _equipos_del_usuario(usuario_id)
        return tarea.EQU_Id in equipos_ids
    return False


# =========================================================
# TAREAS
# =========================================================
@home_bp.route('/tareas/', methods=['GET'])
@jwt_required()
def get_tareas():
    """Tareas propias + tareas de los equipos donde el usuario es miembro."""
    usuario_id = int(get_jwt_identity())
    equipos_ids = _equipos_del_usuario(usuario_id)

    filtro = Tarea.USU_Id == usuario_id
    if equipos_ids:
        filtro = or_(filtro, Tarea.EQU_Id.in_(equipos_ids))

    tareas = Tarea.query.filter(filtro).all()
    return jsonify([tarea.to_dict() for tarea in tareas]), 200


@home_bp.route('/tareas/', methods=['POST'])
@jwt_required()
def create_tarea():
    usuario_id = int(get_jwt_identity())
    data = request.json

    # Si se manda equipo_id, el usuario debe pertenecer a ese equipo
    equipo_id = data.get('equipo_id')
    if equipo_id is not None and equipo_id not in _equipos_del_usuario(usuario_id):
        return jsonify({"error": "No perteneces a ese equipo"}), 403

    nueva_tarea = Tarea(
        TAR_Nombre=data.get('title', 'Nueva Tarea'),
        TAR_Icono=data.get('icon', 'folder'),
        TAR_Descripcion=data.get('description', ''),
        TAR_Prioridad=data.get('priority', 'Media'),
        TAR_TiempoEstimado=data.get('estimatedTime', '1h'),
        TAR_FechaLimite=data.get('deadlineDate', ''),
        TAR_HoraLimite=data.get('deadlineTime', ''),
        TAR_Completada=False,
        TAR_Bookmarked=data.get('bookmarked', False),
        USU_Id=usuario_id,
        EQU_Id=equipo_id
    )
    db.session.add(nueva_tarea)
    db.session.commit()

    # Best-effort: si el usuario tiene Google Calendar conectado y la tarea
    # trae fecha límite, se crea el evento correspondiente.
    usuario = Usuario.query.get(usuario_id)
    gcal.sync_tarea(usuario, nueva_tarea)
    db.session.commit()

    return jsonify(nueva_tarea.to_dict()), 201


@home_bp.route('/tareas/<int:id>', methods=['PUT'])
@jwt_required()
def update_tarea(id):
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403

    data = request.json

    # --- Detectar de antemano qué tipo de acción es, para poder registrar actividad real ---
    campos_enviados = set(data.keys())
    es_solo_posponer = campos_enviados.issubset({'deadlineDate', 'deadlineTime'}) and \
        ('deadlineDate' in data or 'deadlineTime' in data)

    if es_solo_posponer and tarea.TAR_FechaLimite:
        try:
            limite_anterior = datetime.strptime(
                f"{tarea.TAR_FechaLimite}T{tarea.TAR_HoraLimite or '23:59'}", "%Y-%m-%dT%H:%M"
            )
            segundos_restantes = max(0, int((limite_anterior - datetime.now()).total_seconds()))
        except (ValueError, TypeError):
            segundos_restantes = None
        Actividad.registrar(
            usuario_id, 'pospuesta', tarea.TAR_Nombre,
            tarea_id=tarea.TAR_Id, segundos_antes_limite=segundos_restantes
        )

    if 'completed' in data and bool(data['completed']) != bool(tarea.TAR_Completada):
        if data['completed']:
            Actividad.registrar(usuario_id, 'completada', tarea.TAR_Nombre, tarea_id=tarea.TAR_Id)
        else:
            Actividad.registrar(usuario_id, 'reabierta', tarea.TAR_Nombre, tarea_id=tarea.TAR_Id)

    # Campos de texto y fechas
    if 'title' in data: tarea.TAR_Nombre = data['title']
    if 'icon' in data: tarea.TAR_Icono = data['icon']
    if 'description' in data: tarea.TAR_Descripcion = data['description']
    if 'priority' in data: tarea.TAR_Prioridad = data['priority']
    if 'estimatedTime' in data: tarea.TAR_TiempoEstimado = data['estimatedTime']
    if 'deadlineDate' in data: tarea.TAR_FechaLimite = data['deadlineDate']
    if 'deadlineTime' in data: tarea.TAR_HoraLimite = data['deadlineTime']
    if 'evidence' in data: tarea.TAR_Evidencia = data['evidence']

    # Booleanos
    if 'completed' in data: tarea.TAR_Completada = data['completed']
    if 'bookmarked' in data: tarea.TAR_Bookmarked = data['bookmarked']
    if 'deleted' in data: tarea.TAR_Eliminada = data['deleted']

    try:
        db.session.commit()
        # Best-effort: crea, actualiza o borra el evento de Google Calendar
        # según cómo haya quedado la tarea (fecha límite, eliminada, etc.)
        usuario = Usuario.query.get(usuario_id)
        gcal.sync_tarea(usuario, tarea)
        db.session.commit()
        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@home_bp.route('/tareas/<int:id>/desafio', methods=['POST'])
@jwt_required()
def generar_desafio_tarea(id):
    """
    Genera un reto (con Gemini, o un fallback local si Gemini falla o no
    está configurado) que el usuario debe resolver antes de poder posponer
    esta tarea. Regresa {"token": ..., "pregunta": ...} — la respuesta
    correcta NUNCA se manda al frontend, se valida del lado del servidor
    en POST /tareas/<id>/posponer.
    """
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403
    if not tarea.TAR_FechaLimite:
        return jsonify({"error": "No se puede posponer una tarea sin fecha límite"}), 400

    desafio = gemini_service.generar_desafio(usuario_id, tarea)
    return jsonify(desafio), 200


@home_bp.route('/tareas/<int:id>/posponer', methods=['POST'])
@jwt_required()
def posponer_tarea(id):
    """
    Aplica el nuevo plazo SOLO si la respuesta al desafío generado en
    POST /tareas/<id>/desafio es correcta.
    Body esperado: {"token": "...", "respuesta": "...", "addMinutes": 30}
    """
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403
    if not tarea.TAR_FechaLimite:
        return jsonify({"error": "No se puede posponer una tarea sin fecha límite"}), 400

    data = request.json or {}
    token = data.get('token')
    respuesta_usuario = data.get('respuesta')
    add_minutes = data.get('addMinutes')

    if not token or respuesta_usuario is None or not add_minutes:
        return jsonify({"error": "Faltan datos: token, respuesta y addMinutes son requeridos"}), 400

    ok, motivo = gemini_service.validar_respuesta(usuario_id, id, token, respuesta_usuario)
    if not ok:
        return jsonify({"error": motivo}), 400

    # --- misma lógica de "posponer" que ya vivía en el PUT genérico ---
    limite_anterior = _parse_deadline(tarea)
    segundos_restantes = max(0, int((limite_anterior - datetime.now()).total_seconds())) if limite_anterior else None
    Actividad.registrar(
        usuario_id, 'pospuesta', tarea.TAR_Nombre,
        tarea_id=tarea.TAR_Id, segundos_antes_limite=segundos_restantes
    )

    base = limite_anterior or datetime.now()
    nuevo_limite = base + timedelta(minutes=int(add_minutes))
    tarea.TAR_FechaLimite = nuevo_limite.strftime('%Y-%m-%d')
    tarea.TAR_HoraLimite = nuevo_limite.strftime('%H:%M')

    try:
        db.session.commit()
        usuario = Usuario.query.get(usuario_id)
        gcal.sync_tarea(usuario, tarea)
        db.session.commit()
        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@home_bp.route('/tareas/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tarea(id):
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403

    # Best-effort: si había un evento de Google Calendar asociado, se borra
    # antes de destruir la tarea (después ya no tendríamos el eventId).
    usuario = Usuario.query.get(usuario_id)
    gcal.delete_tarea_sync(usuario, tarea)

    db.session.delete(tarea)
    db.session.commit()
    return jsonify({"message": "Tarea eliminada"}), 200


@home_bp.route('/tareas/<int:id>/evidencias', methods=['POST'])
@jwt_required()
def add_evidencias(id):
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403

    data = request.json or {}
    archivos = data.get('files', [])
    if not archivos:
        return jsonify({"error": "No se enviaron archivos"}), 400

    for f in archivos:
        db.session.add(Evidencia(
            TAR_Id=id,
            EVI_Nombre=f.get('name', 'archivo'),
            EVI_Tipo=f.get('type', ''),
            EVI_Data=f.get('data', '')
        ))
        Actividad.registrar(usuario_id, 'evidencia', f.get('name', 'archivo'), tarea_id=id)

    try:
        db.session.commit()
        return jsonify(tarea.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@home_bp.route('/tareas/<int:id>/evidencias/<int:evidencia_id>', methods=['DELETE'])
@jwt_required()
def delete_evidencia(id, evidencia_id):
    usuario_id = int(get_jwt_identity())
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404
    if not _puede_acceder_tarea(tarea, usuario_id):
        return jsonify({"error": "No tienes permiso sobre esta tarea"}), 403

    evidencia = Evidencia.query.filter_by(EVI_Id=evidencia_id, TAR_Id=id).first()
    if not evidencia:
        return jsonify({"error": "Evidencia no encontrada"}), 404

    db.session.delete(evidencia)
    db.session.commit()

    return jsonify(tarea.to_dict()), 200


# =========================================================
# =========================================================
# NOTA: las rutas /proyectos/ y /proyectos/<id> (GET) vivían antes aquí.
# Se movieron a app/routes/equipo_routes.py junto con el resto de "equipos"
# (crear/editar/eliminar/invitar/miembros) para no tener el mismo endpoint
# registrado en dos blueprints a la vez (eso rompía cuál lógica corría
# realmente). No las regreses aquí.
# =========================================================


# =========================================================
# DASHBOARD (banner, tareas destacadas, estadísticas)
# =========================================================
VENTANA_URGENCIA_SEGUNDOS = 24 * 60 * 60  # solo se considera "urgente" si faltan menos de 24h

# Orden de escalado de prioridad y su color/insignia asociados
NIVELES_PRIORIDAD = [
    ('Alta', 'red', 'alta'),
    ('Media', 'orange', 'media'),
    ('Baja', 'yellow', 'baja'),
]


def _parse_deadline(tarea):
    if not tarea.TAR_FechaLimite:
        return None
    try:
        return datetime.strptime(f"{tarea.TAR_FechaLimite}T{tarea.TAR_HoraLimite or '23:59'}", "%Y-%m-%dT%H:%M")
    except ValueError:
        return None


def _deadline_key(tarea):
    """Para ordenar: sin fecha límite se manda al final."""
    return _parse_deadline(tarea) or datetime.max


def _buscar_tarea_urgente(usuario_id):
    """
    Recorre Alta -> Media -> Baja y se queda con la primera prioridad que SÍ tenga
    tareas pendientes con fecha límite futura. De esa prioridad toma la de fecha más próxima.
    """
    ahora = datetime.now()
    limite_urgencia = ahora + timedelta(seconds=VENTANA_URGENCIA_SEGUNDOS)
    for prioridad, color, tier in NIVELES_PRIORIDAD:
        candidatas = Tarea.query.filter(
            Tarea.USU_Id == usuario_id,
            func.lower(Tarea.TAR_Prioridad) == prioridad.lower(),
            Tarea.TAR_Completada == False,
            Tarea.TAR_Eliminada == False
        ).all()

        con_fecha = [(t, _parse_deadline(t)) for t in candidatas]
        # Solo cuentan las que están dentro de la ventana de urgencia (<24h);
        # así no se "atora" en una tarea de esta prioridad con fecha lejana
        # mientras hay tareas de menor prioridad realmente por vencer.
        con_fecha = [(t, f) for t, f in con_fecha if f is not None and ahora <= f <= limite_urgencia]

        if con_fecha:
            con_fecha.sort(key=lambda par: par[1])
            tarea, deadline = con_fecha[0]
            return tarea, deadline, color, tier

    return None, None, None, None


@home_bp.route('/dashboard/banner', methods=['GET'])
@jwt_required()
def get_banner():
    """Tarea que debe mostrarse en el banner de prioridad de la página de inicio."""
    usuario_id = int(get_jwt_identity())
    tarea, deadline, color, tier = _buscar_tarea_urgente(usuario_id)

    if not tarea:
        return jsonify({"task": None}), 200

    segundos_restantes = int((deadline - datetime.now()).total_seconds())

    data = tarea.to_dict()
    data.update({
        "color": color,
        "priorityTier": tier,
        "secondsRemaining": max(0, segundos_restantes),
        "deadline": deadline.isoformat()
    })
    return jsonify({"task": data}), 200


@home_bp.route('/dashboard/destacadas', methods=['GET'])
@jwt_required()
def get_destacadas():
    """
    Primeras 5 tareas importantes (prioridad Alta). Si no hay 5, se completa
    con las próximas más cercanas en fecha (de cualquier prioridad).
    """
    usuario_id = int(get_jwt_identity())
    base = Tarea.query.filter_by(
        USU_Id=usuario_id, TAR_Completada=False, TAR_Eliminada=False
    ).all()

    altas = sorted([t for t in base if (t.TAR_Prioridad or '').lower() == 'alta'], key=_deadline_key)
    resultado = altas[:5]

    if len(resultado) < 5:
        ids_usados = {t.TAR_Id for t in resultado}
        resto = sorted([t for t in base if t.TAR_Id not in ids_usados], key=_deadline_key)
        resultado += resto[:5 - len(resultado)]

    return jsonify([t.to_dict() for t in resultado]), 200


@home_bp.route('/dashboard/estadisticas', methods=['GET'])
@jwt_required()
def get_estadisticas():
    """Estadísticas de hoy, calculadas a partir de la actividad y las tareas reales."""
    usuario_id = int(get_jwt_identity())
    hoy = date.today()

    actividades_hoy = Actividad.query.filter(
        Actividad.USU_Id == usuario_id,
        func.date(Actividad.ACT_Fecha) == hoy
    ).all()

    pospuestas_hoy = [a for a in actividades_hoy if a.ACT_Tipo == 'pospuesta']
    impulsos_detectados = len(pospuestas_hoy)

    valores = [a.ACT_SegundosAntesLimite for a in pospuestas_hoy if a.ACT_SegundosAntesLimite is not None]
    if valores:
        promedio_segundos = sum(valores) / len(valores)
        if promedio_segundos < 60:
            tiempo_promedio = f"{int(promedio_segundos)}s"
        elif promedio_segundos < 3600:
            tiempo_promedio = f"{int(promedio_segundos // 60)}min"
        else:
            tiempo_promedio = f"{promedio_segundos / 3600:.1f}h"
    else:
        tiempo_promedio = "N/A"

    ahora = datetime.now()
    pendientes = Tarea.query.filter(
        Tarea.USU_Id == usuario_id,
        Tarea.TAR_Completada == False,
        Tarea.TAR_Eliminada == False,
        func.lower(Tarea.TAR_Prioridad).in_(['alta', 'media'])
    ).all()
    tareas_ignoradas = sum(1 for t in pendientes if (_parse_deadline(t) or datetime.max) < ahora)

    filas = db.session.query(func.date(Actividad.ACT_Fecha)).filter(
        Actividad.USU_Id == usuario_id, Actividad.ACT_Tipo == 'completada'
    ).distinct().all()
    fechas_completadas = sorted({f[0] for f in filas}, reverse=True)

    racha = 0
    cursor = hoy
    for fecha in fechas_completadas:
        if fecha == cursor:
            racha += 1
            cursor -= timedelta(days=1)
        elif fecha < cursor:
            break

    return jsonify({
        "impulsosDetectados": impulsos_detectados,
        "tiempoPromedioAntesDePosponer": tiempo_promedio,
        "tareasIgnoradas": tareas_ignoradas,
        "rachaCumplimiento": racha
    }), 200


# =========================================================
# ACTIVIDAD (feed en tiempo real + historial filtrable)
# =========================================================
CATEGORIAS_VALIDAS = {'completadas', 'pospuestas', 'evidencias', 'alertas', 'reabiertas'}
CATEGORIA_A_TIPO = {
    'completadas': 'completada',
    'pospuestas': 'pospuesta',
    'evidencias': 'evidencia',
    'alertas': 'alerta',
    'reabiertas': 'reabierta',
}


@home_bp.route('/actividad/', methods=['GET'])
@jwt_required()
def get_actividad():
    """
    GET /api/actividad/                 -> últimas 4 (widget de 'Actividad en tiempo real')
    GET /api/actividad/?limit=50        -> más registros (para el modal de historial completo)
    GET /api/actividad/?categoria=completadas
    """
    usuario_id = int(get_jwt_identity())
    categoria = request.args.get('categoria', 'todos')
    limit = request.args.get('limit', default=4, type=int)

    query = Actividad.query.filter_by(USU_Id=usuario_id)

    if categoria != 'todos' and categoria in CATEGORIAS_VALIDAS:
        query = query.filter_by(ACT_Tipo=CATEGORIA_A_TIPO[categoria])

    actividades = query.order_by(Actividad.ACT_Fecha.desc()).limit(limit).all()
    return jsonify([a.to_dict() for a in actividades]), 200


# =========================================================
# ROADMAP (vista de línea de tiempo por equipo/mes, para roadmap.jsx)
# =========================================================
def _estado_roadmap(tarea):
    """Traduce completed/eliminada/fecha a uno de los estados que pinta el roadmap."""
    if tarea.TAR_Eliminada:
        return 'cancelado'
    if tarea.TAR_Completada:
        return 'completado'
    deadline = _parse_deadline(tarea)
    if deadline and deadline < datetime.now():
        return 'retraso'
    return 'pendiente'


def _tarea_a_item_roadmap(tarea):
    fecha = None
    mes = None
    if tarea.TAR_FechaLimite:
        try:
            fecha = datetime.strptime(tarea.TAR_FechaLimite, "%Y-%m-%d").date()
            mes = fecha.month
        except ValueError:
            pass

    return {
        "id": tarea.TAR_Id,
        "title": tarea.TAR_Nombre,
        "priority": tarea.TAR_Prioridad,
        "icon": tarea.TAR_Icono or "folder",
        "deadlineDate": tarea.TAR_FechaLimite,
        "deadlineTime": tarea.TAR_HoraLimite,
        "month": mes,               # 1-12, o None si no tiene fecha límite
        "day": fecha.day if fecha else None,
        "status": _estado_roadmap(tarea),
        "syncedWithGoogle": bool(tarea.TAR_GoogleEventId),
    }


@home_bp.route('/roadmap/', methods=['GET'])
@jwt_required()
def get_roadmap():
    """
    Datos para pintar roadmap.jsx: una fila "Mis tareas" (tareas personales
    del usuario, sin equipo) + una fila por cada equipo al que pertenece,
    con sus tareas del año pedido (por default, el año actual).

    GET /api/roadmap/?year=2026
    """
    usuario_id = int(get_jwt_identity())
    year = request.args.get('year', default=datetime.now().year, type=int)

    prefijo_fecha = f"{year}-"

    tareas_personales = Tarea.query.filter(
        Tarea.USU_Id == usuario_id,
        Tarea.EQU_Id.is_(None),
        Tarea.TAR_Eliminada.is_(False),
        Tarea.TAR_FechaLimite.like(f"{prefijo_fecha}%")
    ).all()

    filas = [{
        "id": "personal",
        "label": "Mis tareas",
        "tasks": [_tarea_a_item_roadmap(t) for t in tareas_personales]
    }]

    equipos_ids = _equipos_del_usuario(usuario_id)
    if equipos_ids:
        equipos = Equipo.query.filter(Equipo.EQU_Id.in_(equipos_ids)).all()
        for equipo in equipos:
            tareas_equipo = Tarea.query.filter(
                Tarea.EQU_Id == equipo.EQU_Id,
                Tarea.TAR_Eliminada.is_(False),
                Tarea.TAR_FechaLimite.like(f"{prefijo_fecha}%")
            ).all()
            filas.append({
                "id": f"equipo-{equipo.EQU_Id}",
                "label": equipo.EQU_Nombre,
                "tasks": [_tarea_a_item_roadmap(t) for t in tareas_equipo]
            })

    return jsonify({"year": year, "rows": filas}), 200
