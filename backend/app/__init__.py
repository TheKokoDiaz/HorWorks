from datetime import timedelta
from flask import Flask, app
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

# Inicializamos la base de datos sin vincularla aún a la app
db = SQLAlchemy()

# Igual que db: se crea sin vincular, y se vincula a la app dentro de create_app()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # 1. CRÍTICO PARA SESIONES: Clave secreta para firmar la cookie de sesión
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'una_clave_secreta_super_segura_12345')

    # 1.b CRÍTICO PARA JWT: clave para firmar los tokens. Reutiliza SECRET_KEY
    # por defecto, pero puedes definir JWT_SECRET_KEY aparte si quieres rotarlas
    # de forma independiente.
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    jwt.init_app(app)

    # Respuestas JSON consistentes cuando el token falta, expiró o es inválido
    # (por defecto Flask-JWT-Extended regresa esto, pero lo dejamos explícito
    # para que el frontend siempre reciba la misma forma: {"error": "..."})
    @jwt.unauthorized_loader
    def _sin_token(motivo):
        return {"error": "Falta el token de autenticación"}, 401

    @jwt.invalid_token_loader
    def _token_invalido(motivo):
        return {"error": "Token inválido"}, 422

    @jwt.expired_token_loader
    def _token_expirado(jwt_header, jwt_payload):
        return {"error": "El token expiró, usa /api/refresh"}, 401

    # 2. CRÍTICO PARA REACT: Permite que el navegador guarde cookies entre puerto 3000 y 5000
    CORS(app, supports_credentials=True)
    
    default_db_url = f"mysql+pymysql://root:{os.getenv('DB_PASSWORD', 'Pelusa12!')}@db:3306/{os.getenv('DB_NAME', 'DB_HORWORKS')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', default_db_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Vinculamos la base de datos a la app
    db.init_app(app)
    
    # 3. IMPORTAR MODELOS Y CREAR TABLAS
    # (el .sql ya crea las tablas al levantar el contenedor de MySQL vía
    # docker-entrypoint-initdb.d; esto es un respaldo para entornos donde
    # arranques el backend contra una BD vacía, ej. pruebas locales)
    with app.app_context():
        from app.models.usuario import Usuario  # noqa: F401
        from app.models.home import Equipo, Grupo, Tarea, Evidencia, Actividad  # noqa: F401
        db.create_all()  # Crea las tablas que no existan; no toca las que ya existen
    
    # 4. REGISTRAR RUTAS (Blueprints)
    # tarea_routes.py se eliminó: era un duplicado exacto de las rutas de
    # tareas que ya vive en home_routes.py (mismas URLs /api/tareas/...).
    from app.routes.auth_routes import auth_bp
    from app.routes.home_routes import home_bp
    app.register_blueprint(home_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api') # Así tu ruta queda como /api/login
    
    return app