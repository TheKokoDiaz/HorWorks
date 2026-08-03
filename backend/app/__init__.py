from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

# Inicializamos la base de datos sin vincularla aún a la app
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # 1. CRÍTICO PARA SESIONES: Clave secreta para firmar la cookie de sesión
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'una_clave_secreta_super_segura_12345')
    
    # 2. CRÍTICO PARA REACT: Permite que el navegador guarde cookies entre puerto 3000 y 5000
    CORS(app, supports_credentials=True)
    
    default_db_url = f"mysql+pymysql://root:{os.getenv('DB_PASSWORD', 'Pelusa12!')}@db:3306/{os.getenv('DB_NAME', 'DB_HORWORKS')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', default_db_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Vinculamos la base de datos a la app
    db.init_app(app)
    
    # 3. IMPORTAR MODELOS Y CREAR TABLAS (Para que nazca la tabla "usuarios" en MySQL)
    with app.app_context():
        from app.models.usuario import Usuario  # Importamos el nuevo modelo
        db.create_all()  # Crea las tablas si no existen
    
    # 4. REGISTRAR RUTAS (Blueprints)
    from app.routes.tarea_routes import tarea_bp
    from app.routes.auth_routes import auth_bp  # Importamos tu nuevo archivo de login
    
    app.register_blueprint(tarea_bp, url_prefix='/api/tareas')
    app.register_blueprint(auth_bp, url_prefix='/api') # Así tu ruta queda como /api/login
    
    return app