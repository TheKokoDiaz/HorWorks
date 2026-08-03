# backend/app/routes/auth_routes.py
from flask import Blueprint, request, jsonify, session
from app.models.usuario import Usuario

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Faltan datos de correo o contraseña"}), 400

    # Busca en la tabla HOR_Usuario donde USU_Correo coincida
    usuario = Usuario.query.filter_by(email=email).first()

    # --- CHISMOSO PARA LA TERMINAL (CON FLUSH) ---
    print("==========================================", flush=True)
    print(f"[LOGIN DEBUG] Correo: '{email}' | Password: '{password}'", flush=True)
    print(f"[LOGIN DEBUG] ¿Usuario encontrado en MySQL?: {usuario}", flush=True)
    if usuario:
        print(f"[LOGIN DEBUG] Password en BD: '{usuario.password}'", flush=True)
    print("==========================================", flush=True)
    # ---------------------------------------------

    # Valida si el usuario existe y si la contraseña coincide con '1234'
    if usuario and usuario.check_password(password):
        session['usuario_id'] = usuario.id
        session['usuario_email'] = usuario.email
        
        return jsonify({
            "mensaje": "Inicio de sesión exitoso",
            "usuario": usuario.to_dict()
        }), 200
    else:
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401