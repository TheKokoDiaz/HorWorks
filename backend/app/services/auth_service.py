"""
app/services/auth_service.py — Lógica de autenticación.

Reemplaza el flujo anterior basado en `session` (cookie de servidor) por
JSON Web Tokens (JWT), vía Flask-JWT-Extended:

    - access_token  -> corta duración (ver JWT_ACCESS_TOKEN_EXPIRES en __init__.py),
                        se manda en el header Authorization de cada request:
                        "Authorization: Bearer <access_token>"
    - refresh_token -> larga duración, solo se usa contra POST /api/refresh
                        para pedir un access_token nuevo sin volver a loguearse.

Por qué JWT y no session: las cookies de sesión de Flask dependen de que el
cliente mande la cookie de vuelta (CORS + credentials, dominio, etc.), lo cual
se complica con apps móviles o con el frontend y backend en dominios distintos.
Con JWT el cliente guarda el token (memoria/localStorage) y lo manda él mismo
en cada request; el backend no guarda nada de sesión (stateless).
"""

from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.usuario import Usuario


def autenticar_usuario(email, password):
    """
    Valida credenciales contra HOR_Usuario.

    Retorna el objeto Usuario si son correctas, o None si no.
    (La comparación de password sigue siendo texto plano por ahora —
    ver Usuario.check_password; migrar a hash es un pendiente aparte,
    no forma parte de este cambio de JWT.)
    """
    usuario = Usuario.query.filter_by(email=email).first()
    if usuario and usuario.check_password(password):
        return usuario
    return None


def generar_tokens(usuario):
    """
    Crea el par access/refresh token para un Usuario ya autenticado.

    La identidad del token (`identity`) es el USU_Id como string — es lo que
    después recuperas en cualquier ruta protegida con get_jwt_identity().
    Los claims extra (email, nombre) van solo en el access_token, para que
    el frontend no tenga que pegarle a /me nada más para pintar el navbar.
    """
    claims_extra = {"email": usuario.email, "nombre": usuario.nombre}

    access_token = create_access_token(identity=str(usuario.id), additional_claims=claims_extra)
    refresh_token = create_refresh_token(identity=str(usuario.id))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }
