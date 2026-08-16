from app import db


class GoogleToken(db.Model):
    """
    Credenciales OAuth de Google Calendar de un usuario. Un registro = una
    cuenta de Google conectada. Si no existe fila para un USU_Id, ese usuario
    no ha conectado Calendar todavía (todo el flujo lo trata como opcional).
    """
    __tablename__ = 'HOR_GoogleToken'

    USU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), primary_key=True)
    GTK_AccessToken = db.Column(db.Text, nullable=False)
    GTK_RefreshToken = db.Column(db.Text, nullable=True)
    GTK_TokenExpiry = db.Column(db.DateTime, nullable=True)
    GTK_Scopes = db.Column(db.String(255), nullable=True)
    GTK_Correo = db.Column(db.String(120), nullable=True)  # correo de Google conectado, solo informativo

    def to_dict(self):
        return {
            "conectado": True,
            "correo": self.GTK_Correo
        }
