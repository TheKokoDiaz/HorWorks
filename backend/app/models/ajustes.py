# backend/app/models/ajustes.py
from app import db


class Ajustes(db.Model):
    """
    Preferencias por usuario (tema, idioma, notificaciones...). 1 a 1 con
    HOR_Usuario — USU_Id es a la vez primary key y foreign key.
    """
    __tablename__ = 'HOR_Ajustes'

    USU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), primary_key=True)
    AJU_Tema = db.Column(db.String(20), default='azul')
    AJU_Idioma = db.Column(db.String(10), default='es-MX')
    AJU_ZonaHoraria = db.Column(db.String(30), default='GMT-06:00')
    AJU_FormatoHora = db.Column(db.Integer, default=24)
    AJU_NotiPersistente = db.Column(db.Boolean, default=True)
    AJU_NotiSonido = db.Column(db.Boolean, default=True)
    AJU_NotiDesvio = db.Column(db.Boolean, default=True)
    AJU_NotiCorreo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "theme": self.AJU_Tema,
            "language": self.AJU_Idioma,
            "timezone": self.AJU_ZonaHoraria,
            "hourFormat": self.AJU_FormatoHora,
            "notifyPersistent": bool(self.AJU_NotiPersistente),
            "notifySound": bool(self.AJU_NotiSonido),
            "notifyDeviation": bool(self.AJU_NotiDesvio),
            "notifyEmail": bool(self.AJU_NotiCorreo),
        }

    @staticmethod
    def obtener_o_crear(usuario_id):
        """Todo usuario debería tener su fila de ajustes (la crea HOR_Ajustes en el
        seed), pero por si acaso alguien se registra después sin pasar por ahí,
        creamos una fila con los valores por default la primera vez que se pide."""
        ajustes = Ajustes.query.get(usuario_id)
        if not ajustes:
            ajustes = Ajustes(USU_Id=usuario_id)
            db.session.add(ajustes)
            db.session.commit()
        return ajustes
