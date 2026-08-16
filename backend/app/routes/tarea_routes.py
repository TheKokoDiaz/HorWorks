from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models.tarea import Tarea, Evidencia
from app.models.home import Actividad
from app import db 

tarea_bp = Blueprint('tarea_bp', __name__)

# NOTA: aunque ya existe login real (auth_routes.py / session), esta ruta
# todavía no lee la sesión. Cuando quieras, esto se cambia por
# session.get('usuario_id', 1) para usar el usuario realmente logueado.
USUARIO_ACTUAL_ID = 1

@tarea_bp.route('/', methods=['GET'])
def get_tareas():
    tareas = Tarea.query.all()
    return jsonify([tarea.to_dict() for tarea in tareas]), 200

@tarea_bp.route('/', methods=['POST'])
def create_tarea():
    data = request.json
    
    # ✅ CORREGIDO: Usamos TAR_Nombre y TAR_Completada sin comillas a la izquierda
    nueva_tarea = Tarea(
        TAR_Nombre=data.get('title', 'Nueva Tarea'),       # <-- Antes decía TAR_Titulo
        TAR_Icono=data.get('icon', 'folder'),
        TAR_Descripcion=data.get('description', ''),
        TAR_Prioridad=data.get('priority', 'Media'),
        TAR_TiempoEstimado=data.get('estimatedTime', '1h'),
        TAR_FechaLimite=data.get('deadlineDate', ''),
        TAR_HoraLimite=data.get('deadlineTime', ''),    
        TAR_Completada=False,                              # <-- Antes decía TAR_Estado
        TAR_Bookmarked=data.get('bookmarked', False),
        USU_Id=USUARIO_ACTUAL_ID
    )
    db.session.add(nueva_tarea)
    db.session.commit()
    return jsonify(nueva_tarea.to_dict()), 201

@tarea_bp.route('/<int:id>', methods=['PUT'])
def update_tarea(id):
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404

    data = request.json

    # --- Detectar de antemano qué tipo de acción es, para poder registrar actividad real ---
    campos_enviados = set(data.keys())
    es_solo_posponer = campos_enviados.issubset({'deadlineDate', 'deadlineTime'}) and \
        ('deadlineDate' in data or 'deadlineTime' in data)

    if es_solo_posponer and tarea.TAR_FechaLimite:
        # Cuánto faltaba para la fecha límite ANTERIOR, justo en el momento de posponer
        try:
            limite_anterior = datetime.strptime(
                f"{tarea.TAR_FechaLimite}T{tarea.TAR_HoraLimite or '23:59'}", "%Y-%m-%dT%H:%M"
            )
            segundos_restantes = max(0, int((limite_anterior - datetime.now()).total_seconds()))
        except (ValueError, TypeError):
            segundos_restantes = None
        Actividad.registrar(
            USUARIO_ACTUAL_ID, 'pospuesta', tarea.TAR_Nombre,
            tarea_id=tarea.TAR_Id, segundos_antes_limite=segundos_restantes
        )

    if 'completed' in data and bool(data['completed']) != bool(tarea.TAR_Completada):
        if data['completed']:
            Actividad.registrar(USUARIO_ACTUAL_ID, 'completada', tarea.TAR_Nombre, tarea_id=tarea.TAR_Id)
        else:
            Actividad.registrar(USUARIO_ACTUAL_ID, 'reabierta', tarea.TAR_Nombre, tarea_id=tarea.TAR_Id)

    # Campos de texto y fechas
    if 'title' in data: tarea.TAR_Nombre = data['title']
    if 'icon' in data: tarea.TAR_Icono = data['icon']
    if 'description' in data: tarea.TAR_Descripcion = data['description']
    if 'priority' in data: tarea.TAR_Prioridad = data['priority']
    if 'estimatedTime' in data: tarea.TAR_TiempoEstimado = data['estimatedTime']
    if 'deadlineDate' in data: tarea.TAR_FechaLimite = data['deadlineDate']
    if 'deadlineTime' in data: tarea.TAR_HoraLimite = data['deadlineTime']
    if 'evidence' in data: tarea.TAR_Evidencia = data['evidence']

    # 👇 AQUÍ ESTÁ LA MAGIA QUE FALTABA PARA LOS BOOLEANOS 👇
    if 'completed' in data: tarea.TAR_Completada = data['completed']
    if 'bookmarked' in data: tarea.TAR_Bookmarked = data['bookmarked']
    if 'deleted' in data: tarea.TAR_Eliminada = data['deleted']

    try:
        db.session.commit()
        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@tarea_bp.route('/<int:id>', methods=['DELETE'])
def delete_tarea(id):
    tarea = Tarea.query.get(id)
    if tarea:
        db.session.delete(tarea)
        db.session.commit()
        return jsonify({"message": "Tarea eliminada"}), 200
    return jsonify({"error": "Tarea no encontrada"}), 404


# ---- EVIDENCIAS (varias por tarea, con datos para previsualizar) ----

@tarea_bp.route('/<int:id>/evidencias', methods=['POST'])
def add_evidencias(id):
    tarea = Tarea.query.get(id)
    if not tarea:
        return jsonify({"error": "Tarea no encontrada"}), 404

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
        Actividad.registrar(
            USUARIO_ACTUAL_ID, 'evidencia', f.get('name', 'archivo'), tarea_id=id
        )

    try:
        db.session.commit()
        return jsonify(tarea.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@tarea_bp.route('/<int:id>/evidencias/<int:evidencia_id>', methods=['DELETE'])
def delete_evidencia(id, evidencia_id):
    evidencia = Evidencia.query.filter_by(EVI_Id=evidencia_id, TAR_Id=id).first()
    if not evidencia:
        return jsonify({"error": "Evidencia no encontrada"}), 404

    db.session.delete(evidencia)
    db.session.commit()

    tarea = Tarea.query.get(id)
    return jsonify(tarea.to_dict()), 200