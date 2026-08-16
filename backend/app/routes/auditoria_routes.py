"""
app/routes/auditoria_routes.py — Auditor PERSONAL (no de equipo).

Un usuario que trabaja solo (sin equipo) puede invitar a alguien —de dentro
o fuera de la app— a ser su auditor: esa persona puede ver, en solo lectura,
si va cumpliendo sus tareas. Pensado para un alumno que le manda la
invitación a su papá/tutor.

    POST   /api/auditoria/invitar                   {correo} -> genera link con token
    GET    /api/auditoria/invitacion/<token>         pública: quién te invitó (para decidir)
    POST   /api/auditoria/invitacion/<token>/aceptar requiere sesión iniciada (o /api/register primero)
    POST   /api/auditoria/invitacion/<token>/rechazar
    DELETE /api/auditoria/desvincular                dejo de tener auditor
    GET    /api/auditoria/mis-auditados              a quién audito (individuales + equipos)
    GET    /api/auditoria/individual/<usuario_id>/tareas   solo lectura de las tareas de alguien que audito

No hay servicio de correo conectado todavía: /invitar regresa `invitationLink`
para que tú se lo mandes por el medio que quieras (WhatsApp, correo manual, etc.)
"""
import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.usuario import Usuario
from app.models.home import Equipo, Tarea
from app.models.invitacion import InvitacionAuditor

auditoria_bp = Blueprint('auditoria_bp', __name__)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')


@auditoria_bp.route('/auditoria/invitar', methods=['POST'])
@jwt_required()
def invitar_auditor():
    usuario_id = int(get_jwt_identity())
    data = request.json or {}
    correo = (data.get('correo') or '').strip()
    if not correo:
        return jsonify({"error": "Escribe el correo de la persona que quieres que sea tu auditor"}), 400

    invitacion = InvitacionAuditor(INV_RemitenteId=usuario_id, INV_CorreoDestino=correo)
    db.session.add(invitacion)
    db.session.commit()

    link = f"{FRONTEND_URL}/invitacion-auditor/{invitacion.INV_Token}"
    return jsonify({**invitacion.to_dict(), "invitationLink": link}), 201


@auditoria_bp.route('/auditoria/invitacion/<token>', methods=['GET'])
def ver_invitacion(token):
    """Pública a propósito: quien recibe el link puede no tener cuenta todavía."""
    invitacion = InvitacionAuditor.query.filter_by(INV_Token=token).first()
    if not invitacion:
        return jsonify({"error": "Invitación no encontrada o ya expiró"}), 404
    return jsonify(invitacion.to_dict()), 200


@auditoria_bp.route('/auditoria/invitacion/<token>/aceptar', methods=['POST'])
@jwt_required()
def aceptar_invitacion(token):
    """
    Requiere sesión iniciada: si la persona invitada no tiene cuenta, primero
    debe crearla con POST /api/register (con el mismo correo que le llegó la
    invitación no es obligatorio, pero sí recomendable).
    """
    usuario_id = int(get_jwt_identity())
    invitacion = InvitacionAuditor.query.filter_by(INV_Token=token).first()
    if not invitacion:
        return jsonify({"error": "Invitación no encontrada"}), 404
    if invitacion.INV_Estado != 'pendiente':
        return jsonify({"error": "Esta invitación ya fue respondida"}), 409
    if invitacion.INV_RemitenteId == usuario_id:
        return jsonify({"error": "No puedes ser tu propio auditor"}), 400

    invitacion.INV_Estado = 'aceptada'
    invitacion.INV_FechaRespuesta = db.func.now()

    remitente = Usuario.query.get(invitacion.INV_RemitenteId)
    remitente.auditor_id = usuario_id

    db.session.commit()
    return jsonify({"message": f"Ahora eres el auditor de {remitente.nombre}"}), 200


@auditoria_bp.route('/auditoria/invitacion/<token>/rechazar', methods=['POST'])
def rechazar_invitacion(token):
    invitacion = InvitacionAuditor.query.filter_by(INV_Token=token).first()
    if not invitacion:
        return jsonify({"error": "Invitación no encontrada"}), 404

    invitacion.INV_Estado = 'rechazada'
    invitacion.INV_FechaRespuesta = db.func.now()
    db.session.commit()
    return jsonify({"message": "Invitación rechazada"}), 200


@auditoria_bp.route('/auditoria/mi-auditor', methods=['GET'])
@jwt_required()
def mi_auditor():
    """El auditor personal que YO tengo asignado (no de equipo), para la
    tarjeta de Auditoría en la página de Perfil."""
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario or not usuario.auditor_id:
        return jsonify(None), 200

    auditor = Usuario.query.get(usuario.auditor_id)
    if not auditor:
        return jsonify(None), 200

    return jsonify(auditor.to_dict_publico()), 200


@auditoria_bp.route('/auditoria/desvincular', methods=['DELETE'])
@jwt_required()
def desvincular_auditor():
    """El propio usuario le quita el acceso a su auditor personal, cuando quiera."""
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    usuario.auditor_id = None
    db.session.commit()
    return jsonify({"message": "Auditor desvinculado"}), 200


@auditoria_bp.route('/auditoria/mis-auditados', methods=['GET'])
@jwt_required()
def mis_auditados():
    """A quién audito: personas que me eligieron como auditor personal, + equipos que creé."""
    usuario_id = int(get_jwt_identity())

    individuales = Usuario.query.filter_by(auditor_id=usuario_id).all()
    equipos = Equipo.query.filter_by(EQU_Auditor=usuario_id).all()

    return jsonify({
        "individuales": [u.to_dict_publico() for u in individuales],
        "equipos": [e.to_dict() for e in equipos]
    }), 200


@auditoria_bp.route('/auditoria/individual/<int:usuario_id>/tareas', methods=['GET'])
@jwt_required()
def ver_tareas_auditado(usuario_id):
    """Solo lectura: las tareas personales de alguien que me puso como su auditor."""
    mi_id = int(get_jwt_identity())
    auditado = Usuario.query.get(usuario_id)
    if not auditado or auditado.auditor_id != mi_id:
        return jsonify({"error": "No eres el auditor de esa persona"}), 403

    tareas = Tarea.query.filter_by(USU_Id=usuario_id, TAR_Eliminada=False).all()
    return jsonify({
        "usuario": auditado.to_dict_publico(),
        "tareas": [t.to_dict() for t in tareas]
    }), 200
