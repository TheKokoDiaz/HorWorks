# backend/app/routes/google_routes.py
"""
Rutas del flujo de conexión con Google Calendar.

    GET  /api/google/auth-url   (JWT) -> { "url": "..." }  el frontend hace window.location.href = url
    GET  /api/google/callback   (sin JWT, la llama Google directo) -> redirige de vuelta al frontend
    GET  /api/google/status     (JWT) -> { "connected": bool, "email": "..." }
    POST /api/google/disconnect (JWT) -> revoca y limpia la conexión
"""
import os
from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.usuario import Usuario
from app.services import google_calendar_service as gcal

google_bp = Blueprint('google_bp', __name__)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')


@google_bp.route('/google/auth-url', methods=['GET'])
@jwt_required()
def google_auth_url():
    usuario_id = int(get_jwt_identity())
    try:
        url = gcal.get_authorization_url(usuario_id)
    except gcal.GoogleCalendarNoConfigurado as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"url": url}), 200


@google_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """
    A esta ruta la llama Google (redirect del navegador), no el frontend con
    fetch — por eso no lleva @jwt_required(): la identidad del usuario viaja
    en el `state` firmado, no en un header Authorization.
    """
    error = request.args.get('error')
    if error:
        return redirect(f"{FRONTEND_URL}/calendario?google=error&motivo={error}")

    code = request.args.get('code')
    state = request.args.get('state')
    if not code or not state:
        return redirect(f"{FRONTEND_URL}/calendario?google=error&motivo=faltan_parametros")

    try:
        gcal.handle_callback(code, state)
    except ValueError as e:
        return redirect(f"{FRONTEND_URL}/calendario?google=error&motivo={e}")
    except gcal.GoogleCalendarNoConfigurado as e:
        return redirect(f"{FRONTEND_URL}/calendario?google=error&motivo={e}")
    except Exception:
        return redirect(f"{FRONTEND_URL}/calendario?google=error&motivo=desconocido")

    return redirect(f"{FRONTEND_URL}/calendario?google=connected")


@google_bp.route('/google/status', methods=['GET'])
@jwt_required()
def google_status():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "connected": bool(usuario.google_refresh_token),
        "email": usuario.google_email
    }), 200


@google_bp.route('/google/disconnect', methods=['POST'])
@jwt_required()
def google_disconnect():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    gcal.disconnect(usuario)
    return jsonify({"connected": False}), 200
