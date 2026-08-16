"""
app/models/invitacion.py — Dos flujos de invitación distintos:

InvitacionEquipo:
    El auditor invita a un Usuario que YA existe en la app (lo busca por
    username/correo exacto) a unirse a su equipo. Vive dentro de la app:
    el invitado la ve en su lista de notificaciones y la acepta/rechaza.

InvitacionAuditor:
    Alguien invita a una persona a ser SU auditor personal. Esa persona puede
    no tener cuenta todavía (ej. un padre/tutor de fuera de la app), así que
    esta invitación viaja por un link con token en vez de vivir "dentro" de
    la cuenta de nadie. Quien la recibe entra al link, y si no tiene cuenta
    la crea ahí mismo (POST /api/register) antes de aceptar.
"""
import secrets
from datetime import datetime
from app import db

ESTADOS_INVITACION = ['pendiente', 'aceptada', 'rechazada']


class InvitacionEquipo(db.Model):
    __tablename__ = 'HOR_InvitacionEquipo'

    INV_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    EQU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Equipo.EQU_Id'), nullable=False)
    USU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=False)  # invitado
    INV_Estado = db.Column(db.String(20), nullable=False, default='pendiente')
    INV_Fecha = db.Column(db.DateTime, server_default=db.func.now())

    equipo = db.relationship('Equipo')
    usuario = db.relationship('Usuario')

    def to_dict(self):
        return {
            "id": self.INV_Id,
            "estado": self.INV_Estado,
            "fecha": self.INV_Fecha.isoformat() if self.INV_Fecha else None,
            "equipo": {"id": self.equipo.EQU_Id, "nombre": self.equipo.EQU_Nombre} if self.equipo else None,
            "invitado": self.usuario.to_dict_publico() if self.usuario else None
        }


class InvitacionAuditor(db.Model):
    __tablename__ = 'HOR_InvitacionAuditor'

    INV_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    INV_RemitenteId = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=False)  # quien pide auditor
    INV_CorreoDestino = db.Column(db.String(120), nullable=False)
    INV_Token = db.Column(db.String(64), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32))
    INV_Estado = db.Column(db.String(20), nullable=False, default='pendiente')
    INV_FechaCreacion = db.Column(db.DateTime, server_default=db.func.now())
    INV_FechaRespuesta = db.Column(db.DateTime, nullable=True)

    remitente = db.relationship('Usuario')

    def to_dict(self):
        return {
            "id": self.INV_Id,
            "correoDestino": self.INV_CorreoDestino,
            "estado": self.INV_Estado,
            "fechaCreacion": self.INV_FechaCreacion.isoformat() if self.INV_FechaCreacion else None,
            "remitente": self.remitente.to_dict_publico() if self.remitente else None
        }
