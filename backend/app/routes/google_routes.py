# backend/app/routes/google_routes.py
"""
Rutas del flujo de conexión con Google Calendar.

Único archivo de rutas para esta integración (antes había dos duplicados:
google_routes.py y calendar_routes.py, con nombres de función distintos que
no coincidían con los que sí existen en app/services/google_calendar_service.py.
Ese desfase era la causa de que el backend fallara al usar Calendar).

    GET  /api/google/auth-url   (JWT) -> { "url": "..." }  el frontend hace window.location.href = url
    GET  /api/google/callback   (sin JWT, la llama Google directo) -> redirige de vuelta al frontend
    GET  /api/google/status     (JWT) -> { "connected": bool, "email": "..." }
    POST /api/google/disconnect (JWT) -> revoca y limpia la conexión

Nota sobre "Falta el token de autenticación": todas las rutas de aquí menos
/google/callback están protegidas con @jwt_required(). Si las abres directo
desde el navegador (o con curl/Postman sin header Authorization) es normal
y esperado que respondan 401 con ese mensaje: el frontend (src/api/client.js,
función authFetch) sí manda el header "Authorization: Bearer <access_token>"
automáticamente en cada llamada, así que mientras hagas login primero y uses
la app desde el frontend no deberías verlo.
"""
import os
from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services import google_calendar_service as gcal

google_bp = Blueprint('google_bp', __name__)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')


@google_bp.route('/google/auth-url', methods=['GET'])
@jwt_required()
def google_auth_url():
    if not gcal.credenciales_configuradas():
        return jsonify({
            "error": "Google Calendar no está configurado en el servidor "
                     "(faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en el .env)"
        }), 503

    usuario_id = int(get_jwt_identity())
    try:
        url = gcal.get_authorization_url(usuario_id)
    except gcal.GoogleCalendarNoConfigurado as e:
        return jsonify({"error": str(e)}), 503
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
    data = gcal.obtener_estado(usuario_id)
    data["configurado"] = gcal.credenciales_configuradas()
    return jsonify(data), 200


@google_bp.route('/google/disconnect', methods=['POST'])
@jwt_required()
def google_disconnect():
    usuario_id = int(get_jwt_identity())
    gcal.disconnect(usuario_id)
    return jsonify({"connected": False}), 200
