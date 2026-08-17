"""
app/services/gemini_service.py — Integración con Google Gemini API para
generar "desafíos" que el usuario debe resolver antes de poder posponer
una tarea (fricción intencional contra la procrastinación).

Flujo:
    1. Frontend pide POST /api/tareas/<id>/desafio (protegido con JWT).
    2. Backend le pide a Gemini un acertijo corto de lógica/matemáticas
       con una única respuesta numérica (así la validación del lado del
       servidor es una comparación exacta, sin depender de que el modelo
       "entienda" si una respuesta en texto libre es correcta o no).
    3. El desafío se guarda en memoria (ver _DESAFIOS_PENDIENTES más abajo)
       junto con la respuesta esperada, ligado a (usuario_id, tarea_id).
    4. El frontend muestra la pregunta y el usuario responde.
    5. POST /api/tareas/<id>/posponer manda la respuesta; el backend la
       compara contra lo guardado en el paso 3. Si coincide, se aplica el
       nuevo plazo (igual que hacía antes el PUT directo) y se borra el
       desafío pendiente. Si no coincide, no se poospone nada.

LIMITACIÓN CONOCIDA: los desafíos pendientes se guardan en un diccionario
en memoria del proceso (_DESAFIOS_PENDIENTES), no en la base de datos. Esto
es suficiente mientras gunicorn corra con un solo worker (que es como está
configurado hoy: "gunicorn --bind 0.0.0.0:5000 run:app", sin --workers).
Si en algún momento subes el número de workers, cada proceso tendría su
propia copia del diccionario y el desafío podría "perderse" si la petición
de /posponer cae en un worker distinto al que generó /desafio. En ese caso
habría que mover esto a una tabla o a Redis.
"""

import json
import os
import random
import re
import time
import uuid

import requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

DESAFIO_TTL_SEGUNDOS = 5 * 60  # el usuario tiene 5 min para responder

# (usuario_id, tarea_id) -> {"respuesta": str, "expira": epoch_seconds, "token": str}
_DESAFIOS_PENDIENTES = {}


class GeminiNoConfigurado(Exception):
    """Se lanza si falta la variable de entorno GEMINI_API_KEY."""
    pass


def credenciales_configuradas():
    return bool(GEMINI_API_KEY)


PROMPT_BASE = """Genera un reto mental MUY breve (acertijo de lógica simple o una
cuenta matemática de primaria/secundaria) para que alguien demuestre que está
prestando atención antes de posponer una tarea pendiente. Debe resolverse en
menos de 30 segundos y tener una ÚNICA respuesta correcta que sea un número
entero (puede ser negativo).

El nombre de la tarea que se quiere posponer es: "{titulo_tarea}"
Puedes (opcionalmente) referenciarla de forma ligera/graciosa en la pregunta,
pero el reto en sí debe seguir siendo resoluble sin saber nada de la tarea.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto extra, sin markdown,
con exactamente estas dos llaves:
{{"pregunta": "...", "respuesta": "..."}}

Donde "respuesta" es el número entero correcto, como string (ej. "42" o "-3").
"""

# Si Gemini no está configurado o falla, usamos estos retos locales como
# respaldo para que la funcionalidad no dependa 100% de un servicio externo.
_RETOS_FALLBACK = [
    ("Si tienes 3 tareas y completas 1, ¿cuántas te quedan?", "2"),
    ("¿Cuánto es 7 + 8?", "15"),
    ("Si pospones una tarea 2 veces y cada vez sumas 15 minutos, ¿cuántos minutos sumaste en total?", "30"),
    ("¿Cuánto es 9 x 3?", "27"),
    ("Si hoy es el día 5 y pospones 4 días, ¿en qué día caerá?", "9"),
    ("¿Cuánto es 100 - 37?", "63"),
]


def _limpiar_desafios_vencidos():
    ahora = time.time()
    vencidos = [clave for clave, d in _DESAFIOS_PENDIENTES.items() if d["expira"] < ahora]
    for clave in vencidos:
        _DESAFIOS_PENDIENTES.pop(clave, None)


def _parsear_json_de_texto(texto):
    """Gemini a veces envuelve el JSON en ```json ... ``` a pesar de que se
    le pide que no lo haga; esto le quita el markdown si existe."""
    texto = texto.strip()
    texto = re.sub(r"^```(json)?", "", texto).strip()
    texto = re.sub(r"```$", "", texto).strip()
    return json.loads(texto)


def _generar_con_gemini(titulo_tarea):
    if not credenciales_configuradas():
        raise GeminiNoConfigurado("Falta la variable de entorno GEMINI_API_KEY")

    prompt = PROMPT_BASE.format(titulo_tarea=titulo_tarea or "tu tarea")

    resp = requests.post(
        GEMINI_URL,
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.9, "maxOutputTokens": 200},
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    texto = data["candidates"][0]["content"]["parts"][0]["text"]
    payload = _parsear_json_de_texto(texto)

    pregunta = str(payload["pregunta"]).strip()
    respuesta = str(payload["respuesta"]).strip()

    # Validamos que la "respuesta" sea realmente un entero; si Gemini
    # regresó algo raro (texto libre, decimales, etc.), lo tratamos como
    # fallo y usamos el fallback en vez de guardar un reto invalidable.
    if not re.fullmatch(r"-?\d+", respuesta):
        raise ValueError(f"Respuesta de Gemini no es un entero válido: {respuesta!r}")

    return pregunta, respuesta


def _generar_fallback():
    return random.choice(_RETOS_FALLBACK)


def generar_desafio(usuario_id, tarea):
    """
    Genera (con Gemini, o con fallback local si falla/no está configurado)
    un desafío para el usuario+tarea dados, lo guarda en memoria y regresa
    {"token": ..., "pregunta": ...} — la respuesta NUNCA se manda al
    frontend.
    """
    _limpiar_desafios_vencidos()

    titulo_tarea = tarea.TAR_Nombre if tarea else "tu tarea"

    try:
        pregunta, respuesta = _generar_con_gemini(titulo_tarea)
        origen = "gemini"
    except Exception as err:  # noqa: BLE001 — best-effort, cae a fallback
        pregunta, respuesta = _generar_fallback()
        origen = f"fallback ({err.__class__.__name__})"

    token = uuid.uuid4().hex
    clave = (usuario_id, tarea.TAR_Id if tarea else None)
    _DESAFIOS_PENDIENTES[clave] = {
        "token": token,
        "respuesta": respuesta,
        "expira": time.time() + DESAFIO_TTL_SEGUNDOS,
        "origen": origen,
    }

    return {"token": token, "pregunta": pregunta, "expiraEnSegundos": DESAFIO_TTL_SEGUNDOS}


def validar_respuesta(usuario_id, tarea_id, token, respuesta_usuario):
    """
    True si (token, respuesta_usuario) coinciden con el desafío pendiente
    guardado para ese usuario+tarea y todavía no venció. Consume el
    desafío (se borra) sin importar si acertó o no, para que no se pueda
    reintentar la misma pregunta indefinidamente.
    """
    _limpiar_desafios_vencidos()
    clave = (usuario_id, tarea_id)
    pendiente = _DESAFIOS_PENDIENTES.get(clave)

    if not pendiente:
        return False, "No hay un desafío pendiente para esta tarea (pide uno nuevo)."

    if pendiente["token"] != token:
        return False, "El desafío ya no es válido (pide uno nuevo)."

    _DESAFIOS_PENDIENTES.pop(clave, None)  # se consume, acierte o no

    respuesta_normalizada = str(respuesta_usuario).strip()
    if respuesta_normalizada != pendiente["respuesta"]:
        return False, "Respuesta incorrecta."

    return True, None
