from flask import Blueprint, request, jsonify
from app.models.tarea import Tarea, Evidencia
from app import db 

tarea_bp = Blueprint('tarea_bp', __name__)

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
        USU_Id=1 
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