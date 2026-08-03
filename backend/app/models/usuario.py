# backend/app/models/usuario.py
from app import db

class Usuario(db.Model):
    __tablename__ = 'HOR_Usuario'  # Nombre exacto de tu tabla en MySQL

    # Mapeamos las columnas reales de tu base de datos
    id = db.Column('USU_Id', db.Integer, primary_key=True)
    nombre = db.Column('USU_Nombre', db.String(100))
    email = db.Column('USU_Correo', db.String(120), unique=True, nullable=False)
    password = db.Column('USU_Contrasenia', db.String(256), nullable=False)
    foto = db.Column('USU_Foto', db.String(255))
    estado = db.Column('USU_Estado', db.Integer, default=1)
    tickets = db.Column('USU_Tickets', db.Integer, default=0)

    def check_password(self, password_input):
        # Como tus datos de prueba están en texto plano ('1234'), comparamos directamente:
        return self.password == password_input

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "foto": self.foto
        }