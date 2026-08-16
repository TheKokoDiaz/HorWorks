from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.home import Grupo
from app.models.roadmap import RoadmapItem, ESTADOS_VALIDOS
from app.services import google_calendar_service

roadmap_bp = Blueprint('roadmap_bp', __name__)


def _pertenece_al_equipo(usuario_id, equipo_id):
    return Grupo.query.filter_by(USU_Id=usuario_id, EQU_Id=equipo_id).first() is not None


def _parsear_fecha(valor):
    """'2026-08-15' -> date(2026, 8, 15). Lanza ValueError si el formato no es válido."""
    return datetime.strptime(valor, "%Y-%m-%d").date()


@roadmap_bp.route('/roadmap/<int:equipo_id>', methods=['GET'])
@jwt_required()
def get_roadmap(equipo_id):
    usuario_id = int(get_jwt_identity())
    if not _pertenece_al_equipo(usuario_id, equipo_id):
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    items = RoadmapItem.query.filter_by(EQU_Id=equipo_id).all()
    return jsonify([i.to_dict() for i in items]), 200


@roadmap_bp.route('/roadmap/<int:equipo_id>', methods=['POST'])
@jwt_required()
def create_roadmap_item(equipo_id):
    usuario_id = int(get_jwt_identity())
    if not _pertenece_al_equipo(usuario_id, equipo_id):
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    data = request.json or {}
    estado = data.get('status', 'sin_iniciar')
    if estado not in ESTADOS_VALIDOS:
        return jsonify({"error": f"Estado inválido. Usa uno de: {ESTADOS_VALIDOS}"}), 400

    if 'name' not in data or 'startDate' not in data or 'endDate' not in data:
        return jsonify({"error": "Faltan campos: name, startDate y endDate son obligatorios"}), 400

    try:
        fecha_inicio = _parsear_fecha(data['startDate'])
        fecha_fin = _parsear_fecha(data['endDate'])
    except (ValueError, TypeError):
        return jsonify({"error": "startDate/endDate deben tener formato YYYY-MM-DD"}), 400

    item = RoadmapItem(
        EQU_Id=equipo_id,
        TAR_Id=data.get('tareaId'),
        RMI_Nombre=data['name'],
        RMI_Seccion=data.get('section', 'General'),
        RMI_Estado=estado,
        RMI_FechaInicio=fecha_inicio,
        RMI_FechaFin=fecha_fin,
        RMI_EsHito=data.get('isMilestone', False),
        RMI_Etiqueta=data.get('label')
    )
    db.session.add(item)
    db.session.commit()

    # Si el usuario ya conectó Google Calendar, el hito/fase aparece también ahí
    google_calendar_service.sincronizar_roadmap_item(usuario_id, item)

    return jsonify(item.to_dict()), 201


@roadmap_bp.route('/roadmap/item/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_roadmap_item(item_id):
    usuario_id = int(get_jwt_identity())
    item = RoadmapItem.query.get(item_id)
    if not item:
        return jsonify({"error": "No encontrado"}), 404
    if not _pertenece_al_equipo(usuario_id, item.EQU_Id):
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    data = request.json or {}
    if 'status' in data and data['status'] not in ESTADOS_VALIDOS:
        return jsonify({"error": f"Estado inválido. Usa uno de: {ESTADOS_VALIDOS}"}), 400

    if 'name' in data: item.RMI_Nombre = data['name']
    if 'section' in data: item.RMI_Seccion = data['section']
    if 'status' in data: item.RMI_Estado = data['status']
    if 'startDate' in data:
        try:
            item.RMI_FechaInicio = _parsear_fecha(data['startDate'])
        except (ValueError, TypeError):
            return jsonify({"error": "startDate debe tener formato YYYY-MM-DD"}), 400
    if 'endDate' in data:
        try:
            item.RMI_FechaFin = _parsear_fecha(data['endDate'])
        except (ValueError, TypeError):
            return jsonify({"error": "endDate debe tener formato YYYY-MM-DD"}), 400
    if 'isMilestone' in data: item.RMI_EsHito = data['isMilestone']
    if 'label' in data: item.RMI_Etiqueta = data['label']

    db.session.commit()
    google_calendar_service.sincronizar_roadmap_item(usuario_id, item)

    return jsonify(item.to_dict()), 200


@roadmap_bp.route('/roadmap/item/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_roadmap_item(item_id):
    usuario_id = int(get_jwt_identity())
    item = RoadmapItem.query.get(item_id)
    if not item:
        return jsonify({"error": "No encontrado"}), 404
    if not _pertenece_al_equipo(usuario_id, item.EQU_Id):
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    google_calendar_service.eliminar_evento_roadmap(usuario_id, item)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Eliminado"}), 200
