from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

# Inicializamos la base de datos sin vincularla aún a la app
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    CORS(app)
    
    default_db_url = f"mysql+pymysql://root:{os.getenv('DB_PASSWORD', 'Pelusa12!')}@db:3306/{os.getenv('DB_NAME', 'DB_HORWORKS')}"
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', default_db_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Vinculamos la base de datos a la app
    db.init_app(app)
    
    # Importamos las rutas (después de inicializar db para evitar errores)
    from app.routes.tarea_routes import tarea_bp
    app.register_blueprint(tarea_bp, url_prefix='/api/tareas')
    
    return app