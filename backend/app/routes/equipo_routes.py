"""
app/routes/equipo_routes.py — Todo lo de "equipos" (= "proyectos" en el
frontend, es la misma tabla HOR_Equipo):

    GET    /api/proyectos/                       listar los míos (miembro o auditor)
    GET    /api/proyectos/<id>                    detalle (miembro o auditor, solo lectura para el auditor)
    POST   /api/proyectos/                       crear (el creador queda como auditor)
    PUT    /api/proyectos/<id>                    editar nombre/descripción/organización/foto (solo el auditor)
    DELETE /api/proyectos/<id>                    eliminar (solo el auditor)

    POST   /api/proyectos/<id>/invitar            invitar a un miembro por username/correo EXACTO (solo el auditor)
    PUT    /api/proyectos/<id>/miembros/<usu_id>  cambiar el rol de un miembro (solo el auditor)
    DELETE /api/proyectos/<id>/miembros/<usu_id>  quitar a un miembro (solo el auditor)

    GET    /api/invitaciones/equipo               mis invitaciones pendientes a equipos
    POST   /api/invitaciones/equipo/<id>/aceptar
    POST   /api/invitaciones/equipo/<id>/rechazar

    POST   /api/proyectos/<id>/tareas             crear una tarea y asignarla a un miembro (miembros, no el auditor)

Nota: estas rutas REEMPLAZAN a get_proyectos/get_proyecto_detalle que antes
vivían en home_routes.py (mismo path /proyectos/, movidas aquí junto con
todo lo demás de equipos para no repetir el bug de blueprints duplicados
que ya arreglamos una vez).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.home import Equipo, Grupo, Tarea
from app.models.usuario import Usuario
from app.models.invitacion import InvitacionEquipo

equipo_bp = Blueprint('equipo_bp', __name__)


def _equipos_donde_soy_miembro(usuario_id):
    return [g.EQU_Id for g in Grupo.query.filter_by(USU_Id=usuario_id).all()]


def _soy_auditor(equipo, usuario_id):
    return equipo.EQU_Auditor == usuario_id


def _soy_miembro(equipo, usuario_id):
    return any(m.USU_Id == usuario_id for m in equipo.miembros)


def _requerir_auditor(equipo, usuario_id):
    """None si es el auditor; si no, regresa la respuesta de error lista para retornar."""
    if not _soy_auditor(equipo, usuario_id):
        return jsonify({"error": "Solo el auditor del equipo puede hacer esto"}), 403
    return None


# =========================================================
# LISTAR / DETALLE
# =========================================================
@equipo_bp.route('/proyectos/', methods=['GET'])
@jwt_required()
def get_proyectos():
    usuario_id = int(get_jwt_identity())
    ids_miembro = _equipos_donde_soy_miembro(usuario_id)

    equipos = Equipo.query.filter(
        db.or_(Equipo.EQU_Id.in_(ids_miembro) if ids_miembro else False,
               Equipo.EQU_Auditor == usuario_id)
    ).all()

    resultado = []
    for equipo in equipos:
        data = equipo.to_dict(usuario_actual_id=usuario_id)
        data["pendingTasks"] = Tarea.query.filter_by(
            EQU_Id=equipo.EQU_Id, TAR_Completada=False, TAR_Eliminada=False
        ).count()
        mi_membresia = next((m for m in equipo.miembros if m.USU_Id == usuario_id), None)
        data["myRole"] = mi_membresia.GRU_Rol if mi_membresia else None
        resultado.append(data)

    return jsonify(resultado), 200


@equipo_bp.route('/proyectos/<int:id>', methods=['GET'])
@jwt_required()
def get_proyecto_detalle(id):
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    es_auditor = _soy_auditor(equipo, usuario_id)
    es_miembro = _soy_miembro(equipo, usuario_id)
    if not es_auditor and not es_miembro:
        return jsonify({"error": "No perteneces a este proyecto"}), 403

    data = equipo.to_dict(incluir_detalle=True, usuario_actual_id=usuario_id)

    tareas = Tarea.query.filter_by(EQU_Id=id, TAR_Eliminada=False).order_by(Tarea.TAR_FechaLimite.asc()).all()
    data["tasks"] = [t.to_dict() for t in tareas]

    return jsonify(data), 200


# =========================================================
# CRUD DEL EQUIPO
# =========================================================
@equipo_bp.route('/proyectos/', methods=['POST'])
@jwt_required()
def create_proyecto():
    """Quien crea el equipo queda como su auditor (ve todo, no edita tareas)."""
    usuario_id = int(get_jwt_identity())
    data = request.json or {}

    if not data.get('name'):
        return jsonify({"error": "El nombre del proyecto es obligatorio"}), 400

    equipo = Equipo(
        EQU_Nombre=data['name'],
        EQU_Foto=data.get('photo'),
        EQU_Descripcion=data.get('description'),
        EQU_Organizacion=data.get('organization'),
        EQU_Auditor=usuario_id
    )
    db.session.add(equipo)
    db.session.commit()
    return jsonify(equipo.to_dict(incluir_detalle=True, usuario_actual_id=usuario_id)), 201


@equipo_bp.route('/proyectos/<int:id>', methods=['PUT'])
@jwt_required()
def update_proyecto(id):
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    data = request.json or {}
    if 'name' in data: equipo.EQU_Nombre = data['name']
    if 'photo' in data: equipo.EQU_Foto = data['photo']
    if 'description' in data: equipo.EQU_Descripcion = data['description']
    if 'organization' in data: equipo.EQU_Organizacion = data['organization']

    db.session.commit()

    # El frontend reutiliza este JSON para reemplazar por completo el "detalle"
    # que ya tenía en pantalla (incluye members/tasks), así que debe traer la
    # misma forma que GET /proyectos/<id>. Antes faltaba "tasks" aquí y el
    # componente truena al hacer detalle.tasks.length con tasks=undefined.
    data_respuesta = equipo.to_dict(incluir_detalle=True, usuario_actual_id=usuario_id)
    tareas = Tarea.query.filter_by(EQU_Id=id, TAR_Eliminada=False).order_by(Tarea.TAR_FechaLimite.asc()).all()
    data_respuesta["tasks"] = [t.to_dict() for t in tareas]

    return jsonify(data_respuesta), 200


@equipo_bp.route('/proyectos/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_proyecto(id):
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    db.session.delete(equipo)  # cascada borra HOR_Grupos; las tareas del equipo quedan (EQU_Id NULL no aplica aquí, ver nota abajo)
    db.session.commit()
    return jsonify({"message": "Proyecto eliminado"}), 200


# =========================================================
# MIEMBROS + INVITACIONES
# =========================================================
@equipo_bp.route('/proyectos/<int:id>/invitar', methods=['POST'])
@jwt_required()
def invitar_miembro(id):
    """
    El auditor invita a alguien que YA tiene cuenta, buscándolo por su
    username o correo EXACTO (nunca se lista/busca gente por nombre parcial).
    """
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    data = request.json or {}
    identificador = (data.get('identificador') or '').strip()
    if not identificador:
        return jsonify({"error": "Escribe el username o correo exacto de la persona"}), 400

    invitado = Usuario.buscar_por_identificador(identificador)
    if not invitado:
        return jsonify({"error": "No existe ningún usuario con ese username/correo"}), 404

    if _soy_miembro(equipo, invitado.id) or equipo.EQU_Auditor == invitado.id:
        return jsonify({"error": "Esa persona ya está en el equipo"}), 409

    ya_pendiente = InvitacionEquipo.query.filter_by(
        EQU_Id=id, USU_Id=invitado.id, INV_Estado='pendiente'
    ).first()
    if ya_pendiente:
        return jsonify({"error": "Ya tiene una invitación pendiente a este equipo"}), 409

    invitacion = InvitacionEquipo(EQU_Id=id, USU_Id=invitado.id)
    db.session.add(invitacion)
    db.session.commit()

    return jsonify(invitacion.to_dict()), 201


@equipo_bp.route('/proyectos/<int:id>/miembros/<int:usu_id>', methods=['PUT'])
@jwt_required()
def cambiar_rol_miembro(id, usu_id):
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    membresia = Grupo.query.filter_by(EQU_Id=id, USU_Id=usu_id).first()
    if not membresia:
        return jsonify({"error": "Esa persona no es miembro de este equipo"}), 404

    data = request.json or {}
    if 'role' in data:
        membresia.GRU_Rol = data['role']
        db.session.commit()

    return jsonify(membresia.to_dict()), 200


@equipo_bp.route('/proyectos/<int:id>/miembros/<int:usu_id>', methods=['DELETE'])
@jwt_required()
def quitar_miembro(id, usu_id):
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    membresia = Grupo.query.filter_by(EQU_Id=id, USU_Id=usu_id).first()
    if not membresia:
        return jsonify({"error": "Esa persona no es miembro de este equipo"}), 404

    # Las tareas que tenía asignadas dentro del equipo se quedan huérfanas de
    # dueño activo pero visibles para el auditor; no se borran solas.
    db.session.delete(membresia)
    db.session.commit()
    return jsonify({"message": "Miembro removido"}), 200


@equipo_bp.route('/invitaciones/equipo', methods=['GET'])
@jwt_required()
def mis_invitaciones_equipo():
    usuario_id = int(get_jwt_identity())
    invitaciones = InvitacionEquipo.query.filter_by(USU_Id=usuario_id, INV_Estado='pendiente').all()
    return jsonify([i.to_dict() for i in invitaciones]), 200


@equipo_bp.route('/invitaciones/equipo/<int:inv_id>/aceptar', methods=['POST'])
@jwt_required()
def aceptar_invitacion_equipo(inv_id):
    usuario_id = int(get_jwt_identity())
    invitacion = InvitacionEquipo.query.get(inv_id)
    if not invitacion or invitacion.USU_Id != usuario_id:
        return jsonify({"error": "Invitación no encontrada"}), 404
    if invitacion.INV_Estado != 'pendiente':
        return jsonify({"error": "Esta invitación ya fue respondida"}), 409

    invitacion.INV_Estado = 'aceptada'
    db.session.add(Grupo(USU_Id=usuario_id, EQU_Id=invitacion.EQU_Id, GRU_Rol='Colaborador'))
    db.session.commit()
    return jsonify({"message": "Te uniste al equipo"}), 200


@equipo_bp.route('/invitaciones/equipo/<int:inv_id>/rechazar', methods=['POST'])
@jwt_required()
def rechazar_invitacion_equipo(inv_id):
    usuario_id = int(get_jwt_identity())
    invitacion = InvitacionEquipo.query.get(inv_id)
    if not invitacion or invitacion.USU_Id != usuario_id:
        return jsonify({"error": "Invitación no encontrada"}), 404

    invitacion.INV_Estado = 'rechazada'
    db.session.commit()
    return jsonify({"message": "Invitación rechazada"}), 200


# =========================================================
# TAREAS ASIGNADAS A MIEMBROS
# =========================================================
@equipo_bp.route('/proyectos/<int:id>/tareas', methods=['POST'])
@jwt_required()
def asignar_tarea(id):
    """Crea una tarea dentro del equipo y se la asigna a un miembro. Solo el
    auditor/creador del equipo puede hacerlo (los demás miembros no)."""
    usuario_id = int(get_jwt_identity())
    equipo = Equipo.query.get(id)
    if not equipo:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    error = _requerir_auditor(equipo, usuario_id)
    if error:
        return error

    data = request.json or {}
    assignee_id = data.get('assigneeUserId')
    if not assignee_id:
        return jsonify({"error": "Elige a quién se le asigna la tarea"}), 400
    if not _soy_miembro(equipo, assignee_id):
        return jsonify({"error": "Esa persona no es miembro de este equipo"}), 400

    nueva_tarea = Tarea(
        TAR_Nombre=data.get('title', 'Nueva Tarea'),
        TAR_Icono=data.get('icon', 'folder'),
        TAR_Descripcion=data.get('description', ''),
        TAR_Prioridad=data.get('priority', 'Media'),
        TAR_TiempoEstimado=data.get('estimatedTime', '1h'),
        TAR_FechaLimite=data.get('deadlineDate', ''),
        TAR_HoraLimite=data.get('deadlineTime', ''),
        TAR_Completada=False,
        USU_Id=assignee_id,
        EQU_Id=id
    )
    db.session.add(nueva_tarea)
    db.session.commit()
    return jsonify(nueva_tarea.to_dict()), 201
