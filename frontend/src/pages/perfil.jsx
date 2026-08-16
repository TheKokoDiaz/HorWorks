// LIBRERÍA
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/Perfil.css'

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// SESIÓN + CLIENTE HTTP
import { useAuth } from '../context/AuthContext';
import { authFetchJson } from '../api/client';

function Perfil() {
    const { usuario, logout } = useAuth();

    // --- DATOS DEL PERFIL ---
    const [perfil, setPerfil] = useState(null);
    const [cargandoPerfil, setCargandoPerfil] = useState(true);

    // --- EDICIÓN NOMBRE ---
    const [nombreInput, setNombreInput] = useState('');
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const [errorPerfil, setErrorPerfil] = useState(null);
    const [okPerfil, setOkPerfil] = useState(false);

    // --- EDICIÓN FOTO ---
    const [editandoFoto, setEditandoFoto] = useState(false);
    const [fotoInput, setFotoInput] = useState('');

    // --- CAMBIO DE CONTRASEÑA ---
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [passwordConfirmar, setPasswordConfirmar] = useState('');
    const [guardandoPassword, setGuardandoPassword] = useState(false);
    const [errorPassword, setErrorPassword] = useState(null);
    const [okPassword, setOkPassword] = useState(false);

    // --- MIS EQUIPOS ---
    const [equipos, setEquipos] = useState([]);
    const [cargandoEquipos, setCargandoEquipos] = useState(true);

    // --- AUDITOR PERSONAL ---
    const [auditor, setAuditor] = useState(undefined); // undefined = cargando, null = no tiene
    const [mostrarInvitarAuditor, setMostrarInvitarAuditor] = useState(false);
    const [correoAuditor, setCorreoAuditor] = useState('');
    const [linkInvitacion, setLinkInvitacion] = useState(null);
    const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
    const [errorAuditor, setErrorAuditor] = useState(null);
    const [desvinculando, setDesvinculando] = useState(false);

    // --- CARGA INICIAL ---
    useEffect(() => {
        authFetchJson('/perfil/')
            .then((data) => {
                if (data && !data.error) {
                    setPerfil(data);
                    setNombreInput(data.nombre || '');
                    setFotoInput(data.foto || '');
                }
            })
            .finally(() => setCargandoPerfil(false));

        authFetchJson('/proyectos/')
            .then((data) => { if (Array.isArray(data)) setEquipos(data); })
            .finally(() => setCargandoEquipos(false));

        authFetchJson('/auditoria/mi-auditor')
            .then((data) => setAuditor(data && !data.error ? data : null))
            .catch(() => setAuditor(null));
    }, []);

    // --- GUARDAR NOMBRE / FOTO ---
    const guardarPerfil = useCallback(async (cambios) => {
        setGuardandoPerfil(true);
        setErrorPerfil(null);
        setOkPerfil(false);
        const data = await authFetchJson('/perfil/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cambios)
        });
        setGuardandoPerfil(false);
        if (!data || data.error) {
            setErrorPerfil(data?.error || 'No se pudo guardar el cambio.');
            return;
        }
        setPerfil(data);
        setOkPerfil(true);
        setTimeout(() => setOkPerfil(false), 2500);
    }, []);

    const handleGuardarNombre = (e) => {
        e.preventDefault();
        const nombre = nombreInput.trim();
        if (!nombre) {
            setErrorPerfil('El nombre no puede estar vacío.');
            return;
        }
        guardarPerfil({ nombre });
    };

    const handleGuardarFoto = () => {
        const foto = fotoInput.trim();
        if (!foto) return;
        guardarPerfil({ foto }).then(() => setEditandoFoto(false));
    };

    // --- CAMBIO DE CONTRASEÑA ---
    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setErrorPassword(null);
        setOkPassword(false);

        if (!passwordActual || !passwordNueva) {
            setErrorPassword('Completa tu contraseña actual y la nueva.');
            return;
        }
        if (passwordNueva !== passwordConfirmar) {
            setErrorPassword('La nueva contraseña y su confirmación no coinciden.');
            return;
        }

        setGuardandoPassword(true);
        const data = await authFetchJson('/perfil/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: passwordActual, newPassword: passwordNueva })
        });
        setGuardandoPassword(false);

        if (!data || data.error) {
            setErrorPassword(data?.error || 'No se pudo cambiar la contraseña.');
            return;
        }
        setOkPassword(true);
        setPasswordActual('');
        setPasswordNueva('');
        setPasswordConfirmar('');
        setTimeout(() => { setOkPassword(false); setMostrarPassword(false); }, 2000);
    };

    // --- AUDITOR PERSONAL: invitar / desvincular ---
    const handleInvitarAuditor = async (e) => {
        e.preventDefault();
        const correo = correoAuditor.trim();
        if (!correo) return;

        setEnviandoInvitacion(true);
        setErrorAuditor(null);
        const data = await authFetchJson('/auditoria/invitar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });
        setEnviandoInvitacion(false);

        if (!data || data.error) {
            setErrorAuditor(data?.error || 'No se pudo enviar la invitación.');
            return;
        }
        setLinkInvitacion(data.invitationLink);
    };

    const handleDesvincularAuditor = async () => {
        setDesvinculando(true);
        const data = await authFetchJson('/auditoria/desvincular', { method: 'DELETE' });
        setDesvinculando(false);
        if (data && !data.error) {
            setAuditor(null);
        }
    };

    // --- DERIVADOS PARA MOSTRAR ---
    const nombreMostrado = perfil?.nombre || usuario?.nombre || 'Usuario';
    const avatarUrl = perfil?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreMostrado)}&background=fca5a5&color=fff&size=150`;

    return (
        <SidebarLayout>
            <main className="prf-main-content">
                <div className="prf-profile-container">
                    <div className="prf-section-header">
                        <h2>Configuración de Perfil</h2>
                    </div>

                    <div className="prf-profile-grid">
                        {/* --- RESUMEN + AVATAR --- */}
                        <aside className="prf-profile-summary prf-widget" id="user-status-card">
                            <div className="prf-avatar-container">
                                <img
                                    src={avatarUrl}
                                    alt="Foto de perfil"
                                    className="prf-profile-avatar-large"
                                    id="display_USU_Foto"
                                    onError={(e) => {
                                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreMostrado)}&background=fca5a5&color=fff&size=150`;
                                        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                                    }}
                                />
                                <button
                                    type="button"
                                    className="prf-btn-edit-avatar"
                                    onClick={() => setEditandoFoto((v) => !v)}
                                    title="Cambiar foto"
                                >
                                    <span className="material-symbols-outlined">photo_camera</span>
                                </button>
                            </div>

                            {editandoFoto && (
                                <div className="prf-avatar-edit-row">
                                    <input
                                        type="text"
                                        placeholder="URL de tu nueva foto"
                                        value={fotoInput}
                                        onChange={(e) => setFotoInput(e.target.value)}
                                    />
                                    <button type="button" className="prf-btn-text" onClick={handleGuardarFoto} disabled={guardandoPerfil}>
                                        Guardar
                                    </button>
                                </div>
                            )}

                            <h3 className="prf-profile-username" id="display_USU_Usuario">
                                @{perfil?.usuario || usuario?.usuario || '...'}
                            </h3>

                            <span className="prf-badge prf-status-active" id="display_USU_Estado">Activo</span>

                            <div className="prf-profile-stats-divider"></div>

                            <div className="prf-profile-stats">
                                <div className="prf-stat-item">
                                    <div className="prf-stat-icon prf-purple"><span className="material-symbols-outlined">confirmation_number</span></div>
                                    <div className="prf-stat-info">
                                        <span>Tickets Disponibles</span>
                                        <strong className="prf-purple-text" id="display_USU_Tickets">{perfil?.tickets ?? 0}</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* --- DATOS PERSONALES --- */}
                        <section className="prf-profile-details prf-widget" id="user-data-form">
                            <h3>Datos Personales</h3>
                            <p className="prf-subtitle">Actualiza tu información básica y credenciales de acceso.</p>

                            {cargandoPerfil ? (
                                <p className="prf-loading">Cargando datos…</p>
                            ) : (
                            <form onSubmit={handleGuardarNombre} className="prf-profile-form">
                                <div className="prf-form-row">
                                    <div className="prf-form-group prf-full-width">
                                        <label htmlFor="USU_Nombre">Nombre Completo</label>
                                        <input
                                            type="text"
                                            id="USU_Nombre"
                                            value={nombreInput}
                                            onChange={(e) => setNombreInput(e.target.value)}
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="prf-form-row">
                                    <div className="prf-form-group">
                                        <label htmlFor="USU_Usuario">Nombre de Usuario</label>
                                        <input type="text" id="USU_Usuario" value={perfil?.usuario || ''} disabled readOnly />
                                    </div>
                                    <div className="prf-form-group">
                                        <label htmlFor="USU_Correo">Correo Electrónico</label>
                                        <input type="email" id="USU_Correo" value={perfil?.email || ''} disabled readOnly />
                                    </div>
                                </div>

                                <h3 className="prf-section-divider">Seguridad</h3>

                                {!mostrarPassword ? (
                                    <div className="prf-form-row">
                                        <div className="prf-form-group">
                                            <label htmlFor="USU_Contrasenia">Contraseña</label>
                                            <input type="password" id="USU_Contrasenia" value="········" disabled readOnly />
                                            <button type="button" className="prf-btn-text prf-mt-2" onClick={() => setMostrarPassword(true)}>
                                                Cambiar contraseña
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prf-password-form">
                                        <div className="prf-form-group">
                                            <label>Contraseña actual</label>
                                            <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} />
                                        </div>
                                        <div className="prf-form-group">
                                            <label>Nueva contraseña</label>
                                            <input type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} />
                                        </div>
                                        <div className="prf-form-group">
                                            <label>Confirmar nueva contraseña</label>
                                            <input type="password" value={passwordConfirmar} onChange={(e) => setPasswordConfirmar(e.target.value)} />
                                        </div>
                                        {errorPassword && <p className="prf-error-msg">{errorPassword}</p>}
                                        {okPassword && <p className="prf-success-msg">Contraseña actualizada.</p>}
                                        <div className="prf-form-actions" style={{ marginTop: 0 }}>
                                            <button type="button" className="prf-btn-secondary" onClick={() => { setMostrarPassword(false); setErrorPassword(null); }}>
                                                Cancelar
                                            </button>
                                            <button type="button" className="prf-btn-primary" onClick={handleCambiarPassword} disabled={guardandoPassword}>
                                                {guardandoPassword ? 'Guardando…' : 'Actualizar contraseña'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {errorPerfil && <p className="prf-error-msg">{errorPerfil}</p>}
                                {okPerfil && <p className="prf-success-msg">Cambios guardados.</p>}

                                <div className="prf-form-actions">
                                    <button type="button" className="prf-btn-secondary" onClick={() => setNombreInput(perfil?.nombre || '')}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="prf-btn-primary" disabled={guardandoPerfil}>
                                        {guardandoPerfil ? 'Guardando…' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                            )}
                        </section>
                    </div>


                    <aside className="prf-profile-summary-col">
                        <div className="prf-widget prf-card-split prf-mt-4" id="auditor-card">
                            <div className="prf-card-header-blue">
                                <h3>Auditoría</h3>
                            </div>
                            <div className="prf-card-body-center">
                                {auditor === undefined ? (
                                    <p className="prf-loading">Cargando…</p>
                                ) : auditor ? (
                                    <>
                                        <img
                                            src={auditor.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(auditor.nombre || 'Auditor')}&background=bfdbfe&color=1e3a8a&size=100`}
                                            alt="Auditor"
                                            className="prf-avatar-md"
                                        />
                                        <span className="prf-text-muted prf-italic">Auditor Asignado</span>
                                        <h4 className="prf-mt-1">{auditor.nombre}</h4>
                                        <p className="prf-text-muted prf-text-sm">@{auditor.usuario}</p>
                                        <button
                                            type="button"
                                            className="prf-btn-danger-text prf-mt-2"
                                            onClick={handleDesvincularAuditor}
                                            disabled={desvinculando}
                                        >
                                            {desvinculando ? 'Desvinculando…' : 'Desvincular auditor'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="prf-auditor-empty">
                                        <span className="prf-text-muted prf-italic">No tienes un auditor asignado</span>
                                        <p className="prf-text-muted prf-text-sm">
                                            Invita a alguien (por ejemplo tu tutor) para que vea, en solo lectura, si vas cumpliendo tus tareas.
                                        </p>

                                        {!mostrarInvitarAuditor ? (
                                            <button type="button" className="prf-btn-text" onClick={() => setMostrarInvitarAuditor(true)}>
                                                Invitar a un auditor
                                            </button>
                                        ) : (
                                            <form onSubmit={handleInvitarAuditor} style={{ width: '100%' }}>
                                                <div className="prf-form-group">
                                                    <input
                                                        type="email"
                                                        placeholder="correo@ejemplo.com"
                                                        value={correoAuditor}
                                                        onChange={(e) => setCorreoAuditor(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {errorAuditor && <p className="prf-error-msg">{errorAuditor}</p>}
                                                {linkInvitacion && (
                                                    <div className="prf-invite-link-box">{linkInvitacion}</div>
                                                )}
                                                <div className="prf-form-actions" style={{ marginTop: '0.75rem' }}>
                                                    <button type="button" className="prf-btn-secondary" onClick={() => setMostrarInvitarAuditor(false)}>
                                                        Cerrar
                                                    </button>
                                                    <button type="submit" className="prf-btn-primary" disabled={enviandoInvitacion}>
                                                        {enviandoInvitacion ? 'Enviando…' : 'Enviar invitación'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    <section className="prf-profile-details-col">
                        <div className="prf-widget prf-mt-4" id="user-teams-card">
                            <h3>Mis Equipos</h3>
                            <p className="prf-subtitle">Gestiona tu participación y roles en proyectos colaborativos.</p>

                            {cargandoEquipos ? (
                                <p className="prf-loading">Cargando equipos…</p>
                            ) : equipos.length === 0 ? (
                                <p className="prf-empty">Todavía no perteneces a ningún equipo.</p>
                            ) : (
                                <div className="prf-teams-list">
                                    {equipos.map((equipo) => (
                                        <div className="prf-team-item" key={equipo.id}>
                                            <div className={`prf-team-icon ${equipo.soyAuditor ? 'prf-purple-bg' : 'prf-blue-bg'}`}>
                                                <span className="material-symbols-outlined">
                                                    {equipo.soyAuditor ? 'visibility' : 'folder_shared'}
                                                </span>
                                            </div>
                                            <div className="prf-team-info">
                                                <h4>{equipo.name}</h4>
                                                <span className={`prf-badge ${equipo.soyAuditor ? 'prf-role-admin' : 'prf-role-member'}`}>
                                                    {equipo.soyAuditor ? 'Auditor' : (equipo.myRole || 'Colaborador')}
                                                </span>
                                            </div>
                                            <Link to={`/equipos`} className="prf-icon-btn">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="prf-form-actions">
                                <Link to="/equipos" className="prf-btn-secondary">Explorar todos los equipos</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </SidebarLayout>
    )
}

export default Perfil
