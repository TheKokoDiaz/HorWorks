from app import db

# Los 6 estados que ya existen pintados en roadmap.css / roadmap.jsx (color-1 .. color-6)
ESTADOS_VALIDOS = ['sin_iniciar', 'en_progreso', 'completado', 'retraso', 'pendiente', 'cancelado']

ESTADO_A_COLOR = {
    'sin_iniciar': 'color-1',
    'en_progreso': 'color-2',
    'completado': 'color-3',
    'retraso': 'color-4',
    'pendiente': 'color-5',
    'cancelado': 'color-6',
}


class RoadmapItem(db.Model):
    """
    Una barra dentro del Gantt de un proyecto (HOR_Equipo). Se agrupan por
    RMI_Seccion (ej. 'Planificación', 'Estrategia') igual que en el mock de
    roadmap.jsx, y opcionalmente marcan un hito/bandera con fecha (RMI_EsHito).
    """
    __tablename__ = 'HOR_RoadmapItem'

    RMI_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    EQU_Id = db.Column(db.Integer, db.ForeignKey('HOR_Equipo.EQU_Id'), nullable=False)
    TAR_Id = db.Column(db.Integer, db.ForeignKey('HOR_Tarea.TAR_Id'), nullable=True)

    RMI_Nombre = db.Column(db.String(120), nullable=False)
    RMI_Seccion = db.Column(db.String(60), nullable=False, default='General')
    RMI_Estado = db.Column(db.String(20), nullable=False, default='sin_iniciar')
    RMI_FechaInicio = db.Column(db.Date, nullable=False)
    RMI_FechaFin = db.Column(db.Date, nullable=False)
    RMI_EsHito = db.Column(db.Boolean, default=False)
    RMI_Etiqueta = db.Column(db.String(120), nullable=True)  # texto de la bandera, ej "VERSIÓN 02/01"

    # Id del evento en Google Calendar, igual que en Tarea
    RMI_GoogleEventId = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.RMI_Id,
            "equipoId": self.EQU_Id,
            "tareaId": self.TAR_Id,
            "name": self.RMI_Nombre,
            "section": self.RMI_Seccion,
            "status": self.RMI_Estado,
            "colorClass": ESTADO_A_COLOR.get(self.RMI_Estado, 'color-1'),
            "startDate": self.RMI_FechaInicio.isoformat() if self.RMI_FechaInicio else None,
            "endDate": self.RMI_FechaFin.isoformat() if self.RMI_FechaFin else None,
            "isMilestone": bool(self.RMI_EsHito),
            "label": self.RMI_Etiqueta,
            "syncedToCalendar": bool(self.RMI_GoogleEventId)
        }
