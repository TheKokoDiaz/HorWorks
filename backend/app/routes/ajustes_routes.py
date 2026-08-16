# backend/app/routes/ajustes_routes.py
"""
    GET /api/ajustes/   -> preferencias del usuario logueado (las crea con
                            default si por algún motivo no existían)
    PUT /api/ajustes/   -> actualiza una o varias preferencias

    GET /api/perfil/    -> alias de /api/me pensado para la tarjeta "Editar
                            Usuario" de Ajustes (mismo shape que Usuario.to_dict())
    PUT /api/perfil/    -> editar nombre/foto del usuario logueado
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.ajustes import Ajustes
from app.models.usuario import Usuario

ajustes_bp = Blueprint('ajustes_bp', __name__)

TEMAS_VALIDOS = {'azul', 'verde', 'morado', 'naranja'}
IDIOMAS_VALIDOS = {'es-MX', 'en-US'}


@ajustes_bp.route('/ajustes/', methods=['GET'])
@jwt_required()
def get_ajustes():
    usuario_id = int(get_jwt_identity())
    ajustes = Ajustes.obtener_o_crear(usuario_id)
    return jsonify(ajustes.to_dict()), 200


@ajustes_bp.route('/ajustes/', methods=['PUT'])
@jwt_required()
def update_ajustes():
    usuario_id = int(get_jwt_identity())
    ajustes = Ajustes.obtener_o_crear(usuario_id)
    data = request.json or {}

    if 'theme' in data:
        if data['theme'] not in TEMAS_VALIDOS:
            return jsonify({"error": f"Tema inválido. Usa uno de: {', '.join(TEMAS_VALIDOS)}"}), 400
        ajustes.AJU_Tema = data['theme']

    if 'language' in data:
        if data['language'] not in IDIOMAS_VALIDOS:
            return jsonify({"error": f"Idioma inválido. Usa uno de: {', '.join(IDIOMAS_VALIDOS)}"}), 400
        ajustes.AJU_Idioma = data['language']

    if 'timezone' in data: ajustes.AJU_ZonaHoraria = data['timezone']

    if 'hourFormat' in data:
        if data['hourFormat'] not in (12, 24):
            return jsonify({"error": "hourFormat debe ser 12 o 24"}), 400
        ajustes.AJU_FormatoHora = data['hourFormat']

    if 'notifyPersistent' in data: ajustes.AJU_NotiPersistente = bool(data['notifyPersistent'])
    if 'notifySound' in data: ajustes.AJU_NotiSonido = bool(data['notifySound'])
    if 'notifyDeviation' in data: ajustes.AJU_NotiDesvio = bool(data['notifyDeviation'])
    if 'notifyEmail' in data: ajustes.AJU_NotiCorreo = bool(data['notifyEmail'])

    try:
        db.session.commit()
        return jsonify(ajustes.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@ajustes_bp.route('/perfil/', methods=['GET'])
@jwt_required()
def get_perfil():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(usuario.to_dict()), 200


@ajustes_bp.route('/perfil/', methods=['PUT'])
@jwt_required()
def update_perfil():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.json or {}
    if 'nombre' in data:
        nombre = (data['nombre'] or '').strip()
        if not nombre:
            return jsonify({"error": "El nombre no puede estar vacío"}), 400
        usuario.nombre = nombre
    if 'foto' in data:
        usuario.foto = data['foto']

    if 'newPassword' in data:
        actual = data.get('currentPassword') or ''
        nueva = (data.get('newPassword') or '').strip()
        if not usuario.check_password(actual):
            return jsonify({"error": "La contraseña actual no es correcta"}), 400
        if len(nueva) < 4:
            return jsonify({"error": "La nueva contraseña debe tener al menos 4 caracteres"}), 400
        usuario.password = nueva

    try:
        db.session.commit()
        return jsonify(usuario.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
