"""
app/services/google_calendar_service.py — Integración con Google Calendar API.

Flujo de OAuth (tipo "Authorization Code" para apps web, con refresh_token
de larga duración):

    1. Frontend pide GET /api/google/auth-url (protegido con JWT).
    2. Backend arma una URL de consentimiento de Google que incluye un
       "state" firmado con el id del usuario (así no necesitamos guardar
       nada en sesión/servidor entre el paso 1 y el 3).
    3. El navegador va a esa URL, el usuario autoriza con
       personita2468@gmail.com (o el correo que sea), Google redirige a
       GET /api/google/callback?code=...&state=...
    4. Backend valida el state, intercambia el code por tokens, guarda el
       refresh_token en HOR_Usuario y regresa al frontend.

A partir de ahí, cada vez que se crea/edita/borra una tarea con fecha
límite, se sincroniza (best-effort) como evento en el calendario "primary"
del usuario. Si el usuario no ha conectado Google Calendar, todo esto es
un no-op silencioso: la app sigue funcionando igual sin la integración.
"""

import os
from datetime import datetime, timedelta

from flask import current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app import db

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
]

STATE_MAX_AGE_SEGUNDOS = 10 * 60  # 10 minutos para completar el consentimiento en Google
DEFAULT_TIMEZONE = os.getenv("GOOGLE_CALENDAR_TIMEZONE", "America/Mexico_City")


class GoogleCalendarNoConfigurado(Exception):
    """Se lanza si faltan las variables de entorno GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET."""
    pass


def _client_config():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5000/api/google/callback")

    if not client_id or not client_secret:
        raise GoogleCalendarNoConfigurado(
            "Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en las variables de entorno del backend."
        )

    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }, redirect_uri


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="google-oauth-state")


# =========================================================
# PASO 1-3: URL de consentimiento y callback
# =========================================================
def get_authorization_url(usuario_id):
    """Arma la URL a la que hay que mandar al navegador para pedir permiso."""
    client_config, redirect_uri = _client_config()
    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=redirect_uri)

    state = _serializer().dumps({"uid": usuario_id})

    auth_url, _ = flow.authorization_url(
        access_type="offline",       # necesario para que regrese refresh_token
        include_granted_scopes="true",
        prompt="consent",            # fuerza a regresar refresh_token incluso si ya se había autorizado antes
        state=state,
    )
    return auth_url


def handle_callback(code, state):
    """
    Intercambia el `code` por tokens y guarda el refresh_token del usuario
    identificado en `state`. Regresa el id de usuario (int) en éxito.
    Lanza ValueError si el state es inválido/expiró.
    """
    try:
        payload = _serializer().loads(state, max_age=STATE_MAX_AGE_SEGUNDOS)
    except (BadSignature, SignatureExpired):
        raise ValueError("El enlace de autorización de Google es inválido o expiró. Intenta de nuevo.")

    usuario_id = payload["uid"]

    client_config, redirect_uri = _client_config()
    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=redirect_uri)
    flow.fetch_token(code=code)
    creds = flow.credentials

    # El correo de Google conectado no siempre es el mismo que el de HorWorks
    # (ej. el usuario puede loguearse en HorWorks con un correo y conectar un
    # Gmail distinto), así que lo guardamos aparte para mostrarlo en Ajustes.
    email_google = None
    try:
        oauth2_service = build("oauth2", "v2", credentials=creds, cache_discovery=False)
        email_google = oauth2_service.userinfo().get().execute().get("email")
    except HttpError:
        pass

    from app.models.usuario import Usuario
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise ValueError("Usuario no encontrado.")

    # Si Google no regresa refresh_token (pasa si el usuario ya había dado
    # consentimiento antes y no se forzó "prompt=consent"), conservamos el
    # que ya teníamos guardado en vez de sobreescribirlo con None.
    if creds.refresh_token:
        usuario.google_refresh_token = creds.refresh_token
    usuario.google_email = email_google
    db.session.commit()

    return usuario_id


def disconnect(usuario):
    """Revoca el token (best-effort) y limpia la conexión guardada."""
    import requests

    if usuario.google_refresh_token:
        try:
            requests.post(
                "https://oauth2.googleapis.com/revoke",
                params={"token": usuario.google_refresh_token},
                headers={"content-type": "application/x-www-form-urlencoded"},
                timeout=5,
            )
        except requests.RequestException:
            pass  # revocar es cortesía; si falla, igual limpiamos la conexión localmente

    usuario.google_refresh_token = None
    usuario.google_email = None
    db.session.commit()


# =========================================================
# CREDENCIALES / SERVICIO DE CALENDAR PARA UN USUARIO YA CONECTADO
# =========================================================
def _credentials_for(usuario):
    if not usuario.google_refresh_token:
        return None

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    return Credentials(
        token=None,  # se genera al vuelo con el refresh_token
        refresh_token=usuario.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )


def _calendar_service(usuario):
    creds = _credentials_for(usuario)
    if not creds:
        return None
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


# =========================================================
# SINCRONIZACIÓN TAREA <-> EVENTO
# =========================================================
def _parse_estimated_minutes(texto):
    """
    TAR_TiempoEstimado es texto libre capturado en el frontend (ej. '1 h 30 min',
    '2 horas', '45 min'). Sacamos los minutos que podamos reconocer; si no se
    puede parsear nada, usamos 60 min por default para el bloque del evento.
    """
    if not texto:
        return 60
    import re
    horas = re.search(r'(\d+)\s*h', texto, re.IGNORECASE)
    minutos = re.search(r'(\d+)\s*m', texto, re.IGNORECASE)
    total = 0
    if horas:
        total += int(horas.group(1)) * 60
    if minutos:
        total += int(minutos.group(1))
    return total if total > 0 else 60


def _event_body(tarea):
    hora_limite = tarea.TAR_HoraLimite or "23:59"
    fin = datetime.strptime(f"{tarea.TAR_FechaLimite}T{hora_limite}", "%Y-%m-%dT%H:%M")
    inicio = fin - timedelta(minutes=_parse_estimated_minutes(tarea.TAR_TiempoEstimado))

    return {
        "summary": tarea.TAR_Nombre,
        "description": tarea.TAR_Descripcion or "",
        "start": {"dateTime": inicio.isoformat(), "timeZone": DEFAULT_TIMEZONE},
        "end": {"dateTime": fin.isoformat(), "timeZone": DEFAULT_TIMEZONE},
    }


def sync_tarea(usuario, tarea):
    """
    Crea/actualiza/borra el evento de Google Calendar que corresponde a esta
    tarea, según su estado actual. Siempre "best effort": si Google Calendar
    no está conectado, o la llamada falla (sin internet, token revocado desde
    afuera, etc.), no lanza excepción — el guardado de la tarea en HorWorks
    ya se hizo y no debe depender de que Google responda.
    """
    if not usuario.google_refresh_token:
        return

    try:
        service = _calendar_service(usuario)
        if not service:
            return

        # Sin fecha límite, o marcada como eliminada -> no debe (o ya no debe)
        # existir un evento asociado.
        if tarea.TAR_Eliminada or not tarea.TAR_FechaLimite:
            _delete_event(service, tarea)
            return

        body = _event_body(tarea)

        if tarea.TAR_GoogleEventId:
            try:
                service.events().update(
                    calendarId="primary", eventId=tarea.TAR_GoogleEventId, body=body
                ).execute()
            except HttpError as e:
                if e.resp.status == 404:
                    # El evento ya no existe del lado de Google (se borró a mano ahí) -> recrear
                    creado = service.events().insert(calendarId="primary", body=body).execute()
                    tarea.TAR_GoogleEventId = creado.get("id")
                else:
                    raise
        else:
            creado = service.events().insert(calendarId="primary", body=body).execute()
            tarea.TAR_GoogleEventId = creado.get("id")

    except Exception:
        current_app.logger.exception("No se pudo sincronizar la tarea %s con Google Calendar", tarea.TAR_Id)


def _delete_event(service, tarea):
    if not tarea.TAR_GoogleEventId:
        return
    try:
        service.events().delete(calendarId="primary", eventId=tarea.TAR_GoogleEventId).execute()
    except HttpError as e:
        if e.resp.status not in (404, 410):  # ya no existe -> lo damos por borrado igual
            raise
    tarea.TAR_GoogleEventId = None


def delete_tarea_sync(usuario, tarea):
    """Borra (best-effort) el evento de Google asociado a una tarea que se eliminó por completo."""
    if not usuario.google_refresh_token or not tarea.TAR_GoogleEventId:
        return
    try:
        service = _calendar_service(usuario)
        if service:
            _delete_event(service, tarea)
    except Exception:
        current_app.logger.exception("No se pudo borrar el evento de Google Calendar de la tarea %s", tarea.TAR_Id)
