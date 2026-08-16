"""
app/services/ — Capa de servicios.

Aquí vive la LÓGICA DE NEGOCIO e integraciones externas, separada de las rutas
(Blueprints), que solo deben encargarse de recibir el request, llamar al
servicio correspondiente y devolver el jsonify.

Convención para cada servicio nuevo (Calendar, Push, Gemini, ...):
    app/services/<nombre>_service.py
        - Funciones puras/orquestadoras, sin `request`/`jsonify` adentro.
        - Si necesita credenciales o config, se leen de os.getenv() al inicio
          del archivo (nunca hardcodeadas).
        - Lanza excepciones propias o devuelve (resultado, error) — evita que
          la ruta tenga que hacer try/except sobre errores de librería externa.
"""
