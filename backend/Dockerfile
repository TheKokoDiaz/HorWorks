FROM python:3.11-slim
# Evita que Python escriba bytecode (.pyc) y fuerza el buffer de salida libre
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
# Instalar dependencias del sistema requeridas para conectores de BD
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
# Copiar e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copiar el código de la aplicación
COPY . .
EXPOSE 5000
# Ejecutar con Gunicorn (servidor WSGI profesional)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]