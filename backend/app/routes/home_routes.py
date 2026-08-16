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
# PROYECTOS (equipos colaborativos)
# =========================================================
@home_bp.route('/proyectos/', methods=['GET'])
@jwt_required()
def get_proyectos():
    """Equipos (proyectos colaborativos) a los que pertenece el usuario actual."""
    usuario_id = int(get_jwt_identity())
    equipos_ids = _equipos_del_usuario(usuario_id)
    equipos = Equipo.query.filter(Equipo.EQU_Id.in_(equipos_ids)).all() if equipos_ids else []

    resultado = []
    for equipo in equipos:
        data = equipo.to_dict()
        data["pendingTasks"] = Tarea.query.filter_by(
            EQU_Id=equipo.EQU_Id, TAR_Completada=False, TAR_Eliminada=False
        ).count()
        resultado.append(data)

    return jsonify(resultado), 200


@home_bp.route('/proyectos/<int:id>', methods=['GET'])
@jwt_required()
def get_proyecto_detalle(id):
    """Detalle completo para la ventana flotante: equipo, tu rol, miembros y tareas asociadas."""
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404
    if id not in _equipos_del_usuario(usuario_id):
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    data = equipo.to_dict(incluir_detalle=True, usuario_actual_id=usuario_id)

    tareas = Tarea.query.filter_by(EQU_Id=id, TAR_Eliminada=False).order_by(Tarea.TAR_FechaLimite.asc()).all()
    data["tasks"] = [t.to_dict() for t in tareas]

    return jsonify(data), 200


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
    for prioridad, color, tier in NIVELES_PRIORIDAD:
        candidatas = Tarea.query.filter_by(
            USU_Id=usuario_id, TAR_Prioridad=prioridad,
            TAR_Completada=False, TAR_Eliminada=False
        ).all()

        con_fecha = [(t, _parse_deadline(t)) for t in candidatas]
        con_fecha = [(t, f) for t, f in con_fecha if f is not None and f >= ahora]

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

    if segundos_restantes >= VENTANA_URGENCIA_SEGUNDOS:
        return jsonify({"task": None}), 200

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

    altas = sorted([t for t in base if t.TAR_Prioridad == 'Alta'], key=_deadline_key)
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
        Tarea.TAR_Prioridad.in_(['Alta', 'Media'])
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
