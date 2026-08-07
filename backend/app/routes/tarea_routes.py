from flask import Blueprint, request, jsonify
from app.models.tarea import Tarea
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

@tarea_bp.route('/<int:id>', methods=['DELETE'])
def delete_tarea(id):
    tarea = Tarea.query.get(id)
    if tarea:
        db.session.delete(tarea)
        db.session.commit()
        return jsonify({"message": "Tarea eliminada"}), 200
    return jsonify({"error": "Tarea no encontrada"}), 404