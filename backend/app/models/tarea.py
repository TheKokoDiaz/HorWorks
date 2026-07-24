from app import db 

class Tarea(db.Model):
    __tablename__ = 'HOR_Tareas'
    
    TAR_Id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TAR_Titulo = db.Column(db.String(100), nullable=False)
    TAR_Descripcion = db.Column(db.Text)
    TAR_Prioridad = db.Column(db.String(20))
    TAR_TiempoEstimado = db.Column(db.String(50))
    TAR_FechaLimite = db.Column(db.String(50))
    TAR_HoraLimite = db.Column(db.String(50))
    TAR_Estado = db.Column(db.String(20), default='Pendiente')
    TAR_Bookmarked = db.Column(db.Boolean, default=False)
    USU_Id = db.Column(db.Integer, nullable=False) 

    def to_dict(self):
        return {
            "id": self.TAR_Id,
            "title": self.TAR_Titulo,
            "description": self.TAR_Descripcion,
            "priority": self.TAR_Prioridad,
            "estimatedTime": self.TAR_TiempoEstimado,
            "deadlineDate": self.TAR_FechaLimite,
            "deadlineTime": self.TAR_HoraLimite,
            "status": self.TAR_Estado,
            "bookmarked": bool(self.TAR_Bookmarked)
        }