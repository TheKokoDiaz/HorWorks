"""
home.py — Modelos exclusivos de la sección Home / Dashboard:

    Equipo    -> HOR_Equipo    (proyecto colaborativo)
    Grupo     -> HOR_Grupos    (membresía usuario<->equipo, con rol)
    Actividad -> HOR_Actividad (feed en tiempo real + estadísticas)

Usuario vive en app/models/usuario.py y Tarea/Evidencia en app/models/tarea.py
(cada quien en su archivo, este solo trae lo de Home). Se importa Usuario aquí
solo para que SQLAlchemy registre la clase antes de resolver las relaciones
que la referencian por nombre ('Usuario') — no se usa directamente.
"""

from datetime import datetime, timezone
from app import db
from app.models.usuario import Usuario  # noqa: F401  (necesario para relationship('Usuario'))
from app.models.tarea import Tarea, Evidencia  # noqa: F401  (re-exportadas para home_routes.py)


# =========================================================
# EQUIPO (proyecto colaborativo) + GRUPO (membresía con rol)
# =========================================================
class Equipo(db.Model):
    __tablename__ = 'HOR_Equipo'

    EQU_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    EQU_Nombre = db.Column(db.String(40), nullable=False)
    EQU_Foto = db.Column(db.String(255))
    EQU_Auditor = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=False)

    auditor = db.relationship('Usuario', foreign_keys=[EQU_Auditor])
    miembros = db.relationship('Grupo', backref='equipo', cascade='all, delete-orphan')

    def to_dict(self, incluir_detalle=False, usuario_actual_id=None):
        data = {
            "id": self.EQU_Id,
            "name": self.EQU_Nombre,
            "photo": self.EQU_Foto,
            # Usuario.to_dict() trae sus propias claves (nombre/email/...) pensadas para
            # el login; aquí armamos manualmente el shape que espera el frontend de Home.
            "auditor": {
                "id": self.auditor.id,
                "name": self.auditor.nombre,
                "photo": self.auditor.foto
            } if self.auditor else None,
            "memberCount": len(self.miembros)
        }

        if incluir_detalle:
            data["members"] = [m.to_dict() for m in self.miembros]
            if usuario_actual_id is not None:
                mi_membresia = next((m for m in self.miembros if m.USU_Id == usuario_actual_id), None)
                data["myRole"] = mi_membresia.GRU_Rol if mi_membresia else None

        return data


class Grupo(db.Model):
    """Relación usuario <-> equipo, con el rol que ocupa dentro de ese equipo."""
    __tablename__ = 'HOR_Grupos'

    GRU_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=False)
    EQU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Equipo.EQU_Id'), nullable=False)
    GRU_Rol = db.Column(db.String(40), default='Colaborador')

    usuario = db.relationship('Usuario')

    def to_dict(self):
        return {
            "userId": self.usuario.id,
            "name": self.usuario.nombre,
            "photo": self.usuario.foto,
            "role": self.GRU_Rol
        }

# =========================================================
# ACTIVIDAD (feed en tiempo real + estadísticas)
# =========================================================

# Config visual por tipo de actividad — usado para no repetir esto en cada endpoint
TIPO_INFO = {
    'completada': {'icon': 'check_circle', 'color': 'green', 'label': 'Completaste'},
    'reabierta': {'icon': 'undo', 'color': 'purple', 'label': 'Reabriste'},
    'pospuesta': {'icon': 'schedule', 'color': 'purple', 'label': 'Pospusiste'},
    'evidencia': {'icon': 'photo_camera', 'color': 'blue', 'label': 'Evidencia subida'},
    'alerta': {'icon': 'warning', 'color': 'red', 'label': 'Alerta de desvío'},
}


class Actividad(db.Model):
    __tablename__ = 'HOR_Actividad'

    ACT_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    USU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Usuario.USU_Id'), nullable=False)
    TAR_Id = db.Column(db.Integer, db.ForeignKey('HOR_Tarea.TAR_Id'), nullable=True)
    ACT_Tipo = db.Column(db.String(20), nullable=False)
    ACT_Titulo = db.Column(db.String(80), nullable=False)
    ACT_Descripcion = db.Column(db.String(255))
    ACT_SegundosAntesLimite = db.Column(db.Integer, nullable=True)
    ACT_Fecha = db.Column(db.DateTime, server_default=db.func.now())

    @staticmethod
    def registrar(usuario_id, tipo, descripcion, tarea_id=None, segundos_antes_limite=None):
        """Crea (pero no hace commit) un registro de actividad. Llamar dentro de la
        misma transacción que el cambio que la origina, y hacer db.session.commit() después."""
        info = TIPO_INFO.get(tipo, {'label': tipo.capitalize()})
        actividad = Actividad(
            USU_Id=usuario_id,
            TAR_Id=tarea_id,
            ACT_Tipo=tipo,
            ACT_Titulo=info['label'],
            ACT_Descripcion=descripcion,
            ACT_SegundosAntesLimite=segundos_antes_limite
        )
        db.session.add(actividad)
        return actividad

    def _tiempo_relativo(self):
        fecha = self.ACT_Fecha
        ahora = datetime.now(timezone.utc) if fecha.tzinfo is not None else datetime.now()

        diff = ahora - fecha
        segundos = diff.total_seconds()

        if segundos < 60:
            return 'Hace un momento'
        minutos = int(segundos // 60)
        if minutos < 60:
            return f'Hace {minutos} min'
        horas = int(minutos // 60)
        if horas < 24:
            return f'Hace {horas} h'
        dias = int(horas // 24)
        if dias == 1:
            return 'Ayer'
        return f'Hace {dias} días'

    def to_dict(self):
        info = TIPO_INFO.get(self.ACT_Tipo, {'icon': 'notifications', 'color': 'blue'})
        return {
            "id": self.ACT_Id,
            "type": info['color'],
            "icon": info['icon'],
            "title": self.ACT_Titulo,
            "desc": self.ACT_Descripcion,
            "time": self._tiempo_relativo(),
            "category": self.ACT_Tipo,
            "taskId": self.TAR_Id,
            "timestamp": self.ACT_Fecha.isoformat() if self.ACT_Fecha else None
        }
