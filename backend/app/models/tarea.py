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
    TAR_Evidencia = db.Column(db.String(255), nullable=True)
    
    # Asegúrate de que esta línea exista SOLO UNA VEZ en todo el archivo
    TAR_Icono = db.Column(db.String(50), default='folder') 
    
    TAR_Bookmarked = db.Column(db.Boolean, default=False)
    USU_Id = db.Column(db.Integer, nullable=False) 
    EQU_Id = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.TAR_Id,
            "title": self.TAR_Nombre,
            "description": self.TAR_Descripcion,
            "priority": self.TAR_Prioridad,
            "estimatedTime": self.TAR_TiempoEstimado,
            "deadlineDate": self.TAR_FechaLimite,
            "deadlineTime": self.TAR_HoraLimite,
            "evidence": self.TAR_Evidencia,
            "icon": self.TAR_Icono or "folder", 
            "status": "Completada" if self.TAR_Completada else "Pendiente",
            "completed": bool(self.TAR_Completada),
            "bookmarked": bool(self.TAR_Bookmarked),
            "equipo_id": self.EQU_Id
        }