# backend/app/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
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


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Alta de un nuevo usuario. Reutiliza el mismo shape de respuesta que
    /login (usuario + access_token + refresh_token) para poder loguear
    automáticamente justo después de registrarse.
    """
    data = request.get_json() or {}
    nombre = (data.get('nombre') or '').strip()
    username = (data.get('usuario') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not nombre or not username or not email or not password:
        return jsonify({"error": "Nombre, usuario, correo y contraseña son obligatorios"}), 400
    if len(password) < 4:
        return jsonify({"error": "La contraseña debe tener al menos 4 caracteres"}), 400
    if len(username) > 30:
        return jsonify({"error": "El usuario no puede tener más de 30 caracteres"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "Ya existe una cuenta con ese correo"}), 409
    if Usuario.query.filter_by(usuario=username).first():
        return jsonify({"error": "Ese nombre de usuario ya está en uso"}), 409

    nuevo_usuario = Usuario(
        nombre=nombre,
        usuario=username,
        email=email,
        password=password,  # NOTA: igual que el resto de la app, sin hash todavía (ver auth_service.py)
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    tokens = generar_tokens(nuevo_usuario)
    return jsonify({
        "mensaje": "Cuenta creada correctamente",
        "usuario": nuevo_usuario.to_dict(),
        **tokens
    }), 201


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
