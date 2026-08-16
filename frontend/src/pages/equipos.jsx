// LIBRERÍAS
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/equipos.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// CLIENTE HTTP
import { authFetchJson } from '../api/client';

function avatarFallback(nombre) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || 'Equipo')}&background=random&size=200`;
}

function Equipos() {
    // --- LISTA DE EQUIPOS ---
    const [equipos, setEquipos] = useState([]);
    const [loadingEquipos, setLoadingEquipos] = useState(true);

    // --- INVITACIONES PENDIENTES A EQUIPOS ---
    const [invitaciones, setInvitaciones] = useState([]);
    const [respondiendoInv, setRespondiendoInv] = useState(null);

    // --- VENTANA FLOTANTE DE DETALLE ---
    const [equipoAbiertoId, setEquipoAbiertoId] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // --- EDICIÓN DEL EQUIPO (solo auditor) ---
    const [editando, setEditando] = useState(false);
    const [formEdicion, setFormEdicion] = useState({ name: '', description: '', organization: '', photo: '' });
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    // --- INVITAR MIEMBRO (solo auditor) ---
    const [identificadorInvitar, setIdentificadorInvitar] = useState('');
    const [invitando, setInvitando] = useState(false);
    const [mensajeInvitar, setMensajeInvitar] = useState(null); // { tipo: 'ok'|'error', texto }

    // --- ELIMINAR EQUIPO ---
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    // --- ASIGNAR TAREA A UN MIEMBRO (auditor/creador, o cualquier miembro) ---
    const [formTarea, setFormTarea] = useState({ title: '', description: '', priority: 'Media', assigneeUserId: '', deadlineDate: '', deadlineTime: '' });
    const [asignandoTarea, setAsignandoTarea] = useState(false);
    const [mensajeTarea, setMensajeTarea] = useState(null);

    // ---------- CARGA DE DATOS ----------
    const cargarEquipos = useCallback(() => {
        authFetchJson('/proyectos/')
            .then((data) => { if (Array.isArray(data)) setEquipos(data); })
            .catch((err) => console.error('Error al cargar equipos:', err))
            .finally(() => setLoadingEquipos(false));
    }, []);

    const cargarInvitaciones = useCallback(() => {
        authFetchJson('/invitaciones/equipo')
            .then((data) => { if (Array.isArray(data)) setInvitaciones(data); })
            .catch((err) => console.error('Error al cargar invitaciones:', err));
    }, []);

    useEffect(() => {
        cargarEquipos();
        cargarInvitaciones();
    }, [cargarEquipos, cargarInvitaciones]);

    // ---------- INVITACIONES: aceptar / rechazar ----------
    const responderInvitacion = (inv, aceptar) => {
        setRespondiendoInv(inv.id);
        authFetchJson(`/invitaciones/equipo/${inv.id}/${aceptar ? 'aceptar' : 'rechazar'}`, { method: 'POST' })
            .then(() => {
                setInvitaciones((prev) => prev.filter((i) => i.id !== inv.id));
                if (aceptar) cargarEquipos();
            })
            .catch((err) => console.error('Error al responder invitación:', err))
            .finally(() => setRespondiendoInv(null));
    };

    // ---------- DETALLE DE EQUIPO ----------
    const abrirDetalle = (id) => {
        setEquipoAbiertoId(id);
        setLoadingDetalle(true);
        setDetalle(null);
        setEditando(false);
        setMensajeInvitar(null);
        setConfirmandoEliminar(false);
        setIdentificadorInvitar('');

        setFormTarea({ title: '', description: '', priority: 'Media', assigneeUserId: '', deadlineDate: '', deadlineTime: '' });
        setMensajeTarea(null);

        authFetchJson(`/proyectos/${id}`)
            .then((data) => {
                if (data && !data.error) {
                    // members/tasks siempre deberían venir del backend, pero nos
                    // curamos en salud por si algún endpoint todavía no los manda.
                    setDetalle({ ...data, members: data.members || [], tasks: data.tasks || [] });
                    setFormEdicion({
                        name: data.name || '',
                        description: data.description || '',
                        organization: data.organization || '',
                        photo: data.photo || ''
                    });
                }
            })
            .catch((err) => console.error('Error al cargar el equipo:', err))
            .finally(() => setLoadingDetalle(false));
    };

    const cerrarDetalle = () => {
        setEquipoAbiertoId(null);
        setDetalle(null);
    };

    // ---------- EDITAR EQUIPO ----------
    const guardarEdicion = () => {
        if (!formEdicion.name.trim()) return;
        setGuardandoEdicion(true);
        authFetchJson(`/proyectos/${equipoAbiertoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formEdicion.name.trim(),
                description: formEdicion.description,
                organization: formEdicion.organization,
                photo: formEdicion.photo
            })
        })
            .then((data) => {
                if (data && !data.error) {
                    setDetalle({ ...data, members: data.members || [], tasks: data.tasks || [] });
                    setEditando(false);
                    cargarEquipos();
                }
            })
            .catch((err) => console.error('Error al editar el equipo:', err))
            .finally(() => setGuardandoEdicion(false));
    };

    // ---------- INVITAR MIEMBRO ----------
    const invitarMiembro = () => {
        const identificador = identificadorInvitar.trim();
        if (!identificador) return;
        setInvitando(true);
        setMensajeInvitar(null);
        authFetchJson(`/proyectos/${equipoAbiertoId}/invitar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identificador })
        })
            .then((data) => {
                if (data && data.error) {
                    setMensajeInvitar({ tipo: 'error', texto: data.error });
                } else {
                    setMensajeInvitar({ tipo: 'ok', texto: 'Invitación enviada.' });
                    setIdentificadorInvitar('');
                }
            })
            .catch(() => setMensajeInvitar({ tipo: 'error', texto: 'No se pudo enviar la invitación.' }))
            .finally(() => setInvitando(false));
    };

    // ---------- ROL / QUITAR MIEMBRO ----------
    const cambiarRol = (usuId, role) => {
        authFetchJson(`/proyectos/${equipoAbiertoId}/miembros/${usuId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        })
            .then(() => abrirDetalle(equipoAbiertoId))
            .catch((err) => console.error('Error al cambiar el rol:', err));
    };

    const quitarMiembro = (usuId) => {
        authFetchJson(`/proyectos/${equipoAbiertoId}/miembros/${usuId}`, { method: 'DELETE' })
            .then(() => { abrirDetalle(equipoAbiertoId); cargarEquipos(); })
            .catch((err) => console.error('Error al quitar al miembro:', err));
    };

    // ---------- ASIGNAR TAREA A UN MIEMBRO ----------
    const asignarTarea = () => {
        const title = formTarea.title.trim();
        if (!title || !formTarea.assigneeUserId) return;
        setAsignandoTarea(true);
        setMensajeTarea(null);
        authFetchJson(`/proyectos/${equipoAbiertoId}/tareas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description: formTarea.description,
                priority: formTarea.priority,
                assigneeUserId: Number(formTarea.assigneeUserId),
                deadlineDate: formTarea.deadlineDate,
                deadlineTime: formTarea.deadlineTime
            })
        })
            .then((data) => {
                if (data && data.error) {
                    setMensajeTarea({ tipo: 'error', texto: data.error });
                } else {
                    setMensajeTarea({ tipo: 'ok', texto: 'Tarea asignada.' });
                    setFormTarea({ title: '', description: '', priority: 'Media', assigneeUserId: '', deadlineDate: '', deadlineTime: '' });
                    abrirDetalle(equipoAbiertoId); // recarga members/tasks con la nueva tarea
                    cargarEquipos();
                }
            })
            .catch(() => setMensajeTarea({ tipo: 'error', texto: 'No se pudo asignar la tarea.' }))
            .finally(() => setAsignandoTarea(false));
    };

    // ---------- ELIMINAR EQUIPO ----------
    const eliminarEquipo = () => {
        setEliminando(true);
        authFetchJson(`/proyectos/${equipoAbiertoId}`, { method: 'DELETE' })
            .then((data) => {
                if (!data || !data.error) {
                    cerrarDetalle();
                    cargarEquipos();
                }
            })
            .catch((err) => console.error('Error al eliminar el equipo:', err))
            .finally(() => setEliminando(false));
    };

    return (
        <SidebarLayout>
            <main className="eqp-main-content eqp-equipos-layout">
                <div className="eqp-equipos-container">
                    <h1>Equipos</h1>

                    {/* INVITACIONES PENDIENTES */}
                    {invitaciones.length > 0 && (
                        <div className="eqp-invitaciones-box">
                            <h3>Invitaciones pendientes</h3>
                            {invitaciones.map((inv) => (
                                <div className="eqp-invitacion-row" key={inv.id}>
                                    <span className="material-symbols-outlined">mail</span>
                                    <span className="eqp-invitacion-texto">
                                        Te invitaron a <strong>{inv.equipo?.nombre}</strong>
                                    </span>
                                    <div className="eqp-invitacion-actions">
                                        <button
                                            className="eqp-btn-aceptar"
                                            disabled={respondiendoInv === inv.id}
                                            onClick={() => responderInvitacion(inv, true)}
                                        >Aceptar</button>
                                        <button
                                            className="eqp-btn-rechazar"
                                            disabled={respondiendoInv === inv.id}
                                            onClick={() => responderInvitacion(inv, false)}
                                        >Rechazar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {loadingEquipos ? (
                        <p className="eqp-mensaje-vacio">Cargando equipos…</p>
                    ) : (
                        <div className="eqp-equipos-grid">
                            {equipos.map((equipo) => (
                                <div
                                    className="eqp-equipo-card"
                                    key={equipo.id}
                                    onClick={() => abrirDetalle(equipo.id)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="eqp-equipo-img-wrap">
                                        <img
                                            src={equipo.photo || avatarFallback(equipo.name)}
                                            alt={equipo.name}
                                            className="eqp-equipo-img"
                                            onError={(e) => {
                                                const fb = avatarFallback(equipo.name);
                                                if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                                            }}
                                        />
                                        {equipo.soyAuditor && <span className="eqp-badge-auditor">Auditor</span>}
                                    </div>
                                    <div className="eqp-equipo-info">
                                        <h4>{equipo.name}</h4>
                                        <p>{equipo.auditor?.name ? `${equipo.auditor.name}'s Team` : ''}</p>
                                        <p className="eqp-equipo-meta">
                                            {equipo.memberCount} miembro{equipo.memberCount !== 1 ? 's' : ''} · {equipo.pendingTasks} pendiente{equipo.pendingTasks !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <Link to="/crear_equipo" className="eqp-equipo-card eqp-create-card">
                                <div className="eqp-create-icon">
                                    <span className="material-symbols-outlined">add</span>
                                </div>
                                <div className="eqp-equipo-info">
                                    <h4>Nuevo Equipo</h4>
                                </div>
                            </Link>
                        </div>
                    )}

                    {!loadingEquipos && equipos.length === 0 && (
                        <p className="eqp-mensaje-vacio">Aún no perteneces a ningún equipo. Crea uno o espera una invitación.</p>
                    )}
                </div>
            </main>

            {/* VENTANA FLOTANTE: DETALLE DEL EQUIPO */}
            {equipoAbiertoId && (
                <div className="eqp-modal-overlay" onClick={cerrarDetalle}>
                    <div className="eqp-modal-container" onClick={(e) => e.stopPropagation()}>
                        {loadingDetalle || !detalle ? (
                            <p className="eqp-mensaje-vacio">Cargando equipo…</p>
                        ) : (
                            <>
                                <div className="eqp-modal-header">
                                    <div className="eqp-modal-header-info">
                                        <img
                                            src={detalle.photo || avatarFallback(detalle.name)}
                                            alt={detalle.name}
                                            className="eqp-modal-avatar"
                                            onError={(e) => {
                                                const fb = avatarFallback(detalle.name);
                                                if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                                            }}
                                        />
                                        {editando ? (
                                            <input
                                                className="eqp-input-edicion"
                                                value={formEdicion.name}
                                                onChange={(e) => setFormEdicion((f) => ({ ...f, name: e.target.value }))}
                                            />
                                        ) : (
                                            <h2>{detalle.name}</h2>
                                        )}
                                    </div>
                                    <button className="eqp-modal-close" onClick={cerrarDetalle}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="eqp-detail-meta">
                                    <div className="eqp-detail-chip">
                                        <span className="material-symbols-outlined">badge</span>
                                        <div>
                                            <span className="eqp-detail-chip-label">Tu rol</span>
                                            <span className="eqp-detail-chip-value">{detalle.myRole || (detalle.soyAuditor ? 'Auditor' : 'Sin asignar')}</span>
                                        </div>
                                    </div>
                                    <div className="eqp-detail-chip">
                                        <span className="material-symbols-outlined">verified_user</span>
                                        <div>
                                            <span className="eqp-detail-chip-label">Auditor</span>
                                            <span className="eqp-detail-chip-value">{detalle.auditor?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* EDICIÓN (solo auditor) */}
                                {detalle.soyAuditor && (
                                    <div className="eqp-edit-toolbar">
                                        {editando ? (
                                            <>
                                                <input
                                                    className="eqp-input-edicion"
                                                    placeholder="URL de la foto del equipo"
                                                    value={formEdicion.photo}
                                                    onChange={(e) => setFormEdicion((f) => ({ ...f, photo: e.target.value }))}
                                                />
                                                <textarea
                                                    className="eqp-textarea-edicion"
                                                    placeholder="Descripción del equipo"
                                                    value={formEdicion.description}
                                                    onChange={(e) => setFormEdicion((f) => ({ ...f, description: e.target.value }))}
                                                />
                                                <input
                                                    className="eqp-input-edicion"
                                                    placeholder="Organización"
                                                    value={formEdicion.organization}
                                                    onChange={(e) => setFormEdicion((f) => ({ ...f, organization: e.target.value }))}
                                                />
                                                <div className="eqp-edit-actions">
                                                    <button className="eqp-btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
                                                    <button className="eqp-btn-primary" disabled={guardandoEdicion} onClick={guardarEdicion}>
                                                        {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button className="eqp-btn-secondary" onClick={() => setEditando(true)}>
                                                <span className="material-symbols-outlined">edit</span> Editar equipo
                                            </button>
                                        )}
                                    </div>
                                )}

                                {detalle.description && !editando && (
                                    <p className="eqp-descripcion">{detalle.description}</p>
                                )}

                                {/* MIEMBROS */}
                                <div>
                                    <h3 className="eqp-detail-section-title">Miembros del equipo</h3>
                                    <div className="eqp-members-list">
                                        {detalle.members.length > 0 ? detalle.members.map((m) => (
                                            <div className="eqp-member-row" key={m.userId}>
                                                <img
                                                    src={m.photo || avatarFallback(m.name)}
                                                    alt={m.name}
                                                    className="eqp-member-avatar"
                                                    onError={(e) => {
                                                        const fb = avatarFallback(m.name);
                                                        if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                                                    }}
                                                />
                                                <span className="eqp-member-name">{m.name}</span>
                                                {detalle.soyAuditor ? (
                                                    <>
                                                        <select
                                                            className="eqp-member-role-select"
                                                            value={m.role}
                                                            onChange={(e) => cambiarRol(m.userId, e.target.value)}
                                                        >
                                                            <option value="Colaborador">Colaborador</option>
                                                            <option value="Líder">Líder</option>
                                                        </select>
                                                        <button className="eqp-member-remove-btn" onClick={() => quitarMiembro(m.userId)} title="Quitar del equipo">
                                                            <span className="material-symbols-outlined">person_remove</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="eqp-member-role">{m.role}</span>
                                                )}
                                            </div>
                                        )) : (
                                            <p className="eqp-mensaje-vacio">Este equipo aún no tiene miembros.</p>
                                        )}
                                    </div>
                                </div>

                                {/* INVITAR (solo auditor) */}
                                {detalle.soyAuditor && (
                                    <div className="eqp-invite-box">
                                        <h3 className="eqp-detail-section-title">Invitar a alguien</h3>
                                        <div className="eqp-invite-row">
                                            <input
                                                type="text"
                                                placeholder="Username o correo exacto"
                                                value={identificadorInvitar}
                                                onChange={(e) => setIdentificadorInvitar(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && invitarMiembro()}
                                            />
                                            <button className="eqp-btn-primary" disabled={invitando} onClick={invitarMiembro}>
                                                {invitando ? '…' : 'Invitar'}
                                            </button>
                                        </div>
                                        {mensajeInvitar && (
                                            <p className={mensajeInvitar.tipo === 'error' ? 'eqp-invite-error' : 'eqp-invite-ok'}>
                                                {mensajeInvitar.texto}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ASIGNAR TAREA (solo el auditor/dueño del equipo) */}
                                {detalle.soyAuditor && detalle.members.length > 0 && (
                                    <div className="eqp-invite-box">
                                        <h3 className="eqp-detail-section-title">Asignar tarea a un miembro</h3>
                                        <div className="eqp-invite-row">
                                            <input
                                                type="text"
                                                placeholder="Título de la tarea"
                                                value={formTarea.title}
                                                onChange={(e) => setFormTarea((f) => ({ ...f, title: e.target.value }))}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Descripción (opcional)"
                                                value={formTarea.description}
                                                onChange={(e) => setFormTarea((f) => ({ ...f, description: e.target.value }))}
                                            />
                                            <select
                                                className="eqp-member-role-select"
                                                value={formTarea.assigneeUserId}
                                                onChange={(e) => setFormTarea((f) => ({ ...f, assigneeUserId: e.target.value }))}
                                            >
                                                <option value="">Asignar a…</option>
                                                {detalle.members.map((m) => (
                                                    <option key={m.userId} value={m.userId}>{m.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="eqp-member-role-select"
                                                value={formTarea.priority}
                                                onChange={(e) => setFormTarea((f) => ({ ...f, priority: e.target.value }))}
                                            >
                                                <option value="Alta">Alta</option>
                                                <option value="Media">Media</option>
                                                <option value="Baja">Baja</option>
                                            </select>
                                            <input
                                                type="date"
                                                value={formTarea.deadlineDate}
                                                onChange={(e) => setFormTarea((f) => ({ ...f, deadlineDate: e.target.value }))}
                                            />
                                            <button className="eqp-btn-primary" disabled={asignandoTarea} onClick={asignarTarea}>
                                                {asignandoTarea ? '…' : 'Asignar'}
                                            </button>
                                        </div>
                                        {mensajeTarea && (
                                            <p className={mensajeTarea.tipo === 'error' ? 'eqp-invite-error' : 'eqp-invite-ok'}>
                                                {mensajeTarea.texto}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* TAREAS */}
                                <div>
                                    <h3 className="eqp-detail-section-title">Tareas del equipo</h3>
                                    <div className="eqp-tasks-list">
                                        {detalle.tasks.length > 0 ? detalle.tasks.map((t) => (
                                            <div className="eqp-task-row" key={t.id}>
                                                <span className="material-symbols-outlined">{t.icon || 'folder'}</span>
                                                <div className="eqp-task-info">
                                                    <span className={t.completed ? 'eqp-task-done' : ''}>{t.title}</span>
                                                    <span className="eqp-task-sub">{t.deadlineDate || 'Sin fecha'} {t.deadlineTime}</span>
                                                </div>
                                                <span className={`eqp-task-priority priority-${(t.priority || '').toLowerCase()}`}>{t.priority}</span>
                                            </div>
                                        )) : (
                                            <p className="eqp-mensaje-vacio">Este equipo aún no tiene tareas.</p>
                                        )}
                                    </div>
                                </div>

                                {/* ELIMINAR EQUIPO (solo auditor) */}
                                {detalle.soyAuditor && (
                                    <div className="eqp-danger-zone">
                                        {confirmandoEliminar ? (
                                            <div className="eqp-confirm-row">
                                                <span>¿Eliminar este equipo? Esta acción no se puede deshacer.</span>
                                                <div className="eqp-edit-actions">
                                                    <button className="eqp-btn-secondary" onClick={() => setConfirmandoEliminar(false)}>Cancelar</button>
                                                    <button className="eqp-btn-danger" disabled={eliminando} onClick={eliminarEquipo}>
                                                        {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button className="eqp-btn-danger-outline" onClick={() => setConfirmandoEliminar(true)}>
                                                <span className="material-symbols-outlined">delete</span> Eliminar equipo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

export default Equipos;
