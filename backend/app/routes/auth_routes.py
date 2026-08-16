# backend/app/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.usuario import Usuario
from app.services.auth_service import autenticar_usuario, generar_tokens

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api')


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Faltan datos de correo o contraseña"}), 400

    usuario = autenticar_usuario(email, password)

    if not usuario:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    tokens = generar_tokens(usuario)

    return jsonify({
        "mensaje": "Inicio de sesión exitoso",
        "usuario": usuario.to_dict(),
        **tokens  # access_token, refresh_token
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Se llama con el refresh_token en el header Authorization cuando el
    access_token expiró, para conseguir uno nuevo sin pedir login de nuevo.
    """
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    tokens = generar_tokens(usuario)
    return jsonify(tokens), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Devuelve el usuario dueño del access_token actual. Útil para que el
    frontend valide la sesión al recargar la página (F5)."""
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(int(usuario_id))
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(usuario.to_dict()), 200
