# backend/app/models/usuario.py
from app import db

class Usuario(db.Model):
    __tablename__ = 'HOR_Usuario'  # Nombre exacto de tu tabla en MySQL

    # Mapeamos las columnas reales de tu base de datos
    id = db.Column('USU_Id', db.Integer, primary_key=True)
    nombre = db.Column('USU_Nombre', db.String(100))
    usuario = db.Column('USU_Usuario', db.String(30), unique=True)
    email = db.Column('USU_Correo', db.String(120), unique=True, nullable=False)
    password = db.Column('USU_Contrasenia', db.String(256), nullable=False)
    foto = db.Column('USU_Foto', db.String(255))
    rol = db.Column('USU_Rol', db.String(20), default='Alumno')
    estado = db.Column('USU_Estado', db.Integer, default=1)
    tickets = db.Column('USU_Tickets', db.Integer, default=0)

    # Auditor personal (opcional): otro Usuario que puede ver, en solo lectura,
    # si esta persona va cumpliendo sus tareas. Se asigna vía invitación
    # aceptada (ver models/invitacion.py), nunca directamente.
    auditor_id = db.Column('USU_AuditorId', db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=True)

    def check_password(self, password_input):
        # Como tus datos de prueba están en texto plano ('1234'), comparamos directamente:
        return self.password == password_input

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "usuario": self.usuario,
            "email": self.email,
            "foto": self.foto,
            "rol": self.rol,
            "auditorId": self.auditor_id,
            "tickets": self.tickets
        }

    def to_dict_publico(self):
        """Para mostrar a otros usuarios (ej. listas de miembros de un equipo):
        nunca expone el correo ni datos sensibles de alguien que no eres tú."""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "usuario": self.usuario,
            "foto": self.foto
        }

    @staticmethod
    def buscar_por_identificador(identificador):
        """Busca por username o correo EXACTO (nunca por nombre parcial:
        así no se puede listar/curiosear usuarios, solo invitar a quien ya conoces)."""
        if not identificador:
            return None
        return Usuario.query.filter(
            (Usuario.email == identificador) | (Usuario.usuario == identificador)
        ).first()
