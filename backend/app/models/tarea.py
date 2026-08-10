from app import db 

class Tarea(db.Model):
    __tablename__ = 'HOR_Tarea'
    
    TAR_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TAR_Nombre = db.Column(db.String(100), nullable=False)
    TAR_Descripcion = db.Column(db.Text)
    TAR_Completada = db.Column(db.Boolean, default=False)
    TAR_Prioridad = db.Column(db.String(20), default='Media')
    TAR_TiempoEstimado = db.Column(db.String(50))
    TAR_FechaLimite = db.Column(db.String(50))
    TAR_HoraLimite = db.Column(db.String(50))
    TAR_Evidencia = db.Column(db.String(255), nullable=True)  # DEPRECATED: ver HOR_Evidencia (soporta varias)
    
    # Asegúrate de que esta línea exista SOLO UNA VEZ en todo el archivo
    TAR_Icono = db.Column(db.String(50), default='folder') 
    
    TAR_Bookmarked = db.Column(db.Boolean, default=False)
    TAR_Eliminada = db.Column(db.Boolean, default=False)
    USU_Id = db.Column(db.Integer, nullable=False) 
    EQU_Id = db.Column(db.Integer, nullable=True)

    # Una tarea puede tener varias evidencias (imágenes, PDFs, etc.)
    evidencias = db.relationship(
        'Evidencia',
        backref='tarea',
        cascade='all, delete-orphan',
        order_by='Evidencia.EVI_FechaSubida'
    )

    def to_dict(self):
        return {
            "id": self.TAR_Id,
            "title": self.TAR_Nombre,
            "description": self.TAR_Descripcion,
            "priority": self.TAR_Prioridad,
            "estimatedTime": self.TAR_TiempoEstimado,
            "deadlineDate": self.TAR_FechaLimite,
            "deadlineTime": self.TAR_HoraLimite,
            "evidences": [e.to_dict() for e in self.evidencias],
            "icon": self.TAR_Icono or "folder", 
            "status": "Completada" if self.TAR_Completada else "Pendiente",
            "completed": bool(self.TAR_Completada),
            "bookmarked": bool(self.TAR_Bookmarked),
            "deleted": bool(self.TAR_Eliminada),
            "equipo_id": self.EQU_Id
        }


class Evidencia(db.Model):
    __tablename__ = 'HOR_Evidencia'

    EVI_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TAR_Id = db.Column(db.Integer, db.ForeignKey('HOR_Tarea.TAR_Id'), nullable=False)
    EVI_Nombre = db.Column(db.String(255), nullable=False)
    EVI_Tipo = db.Column(db.String(100))          # ej. 'image/png', 'application/pdf'
    EVI_Data = db.Column(db.Text, nullable=False)  # data URL en base64 (para previsualización)
    EVI_FechaSubida = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.EVI_Id,
            "name": self.EVI_Nombre,
            "type": self.EVI_Tipo,
            "data": self.EVI_Data
        }