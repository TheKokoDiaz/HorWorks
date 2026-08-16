// src/pages/invitacion_auditor.jsx
//
// Antes esta ruta simplemente NO EXISTÍA en el router (ver App.jsx): el
// backend sí generaba el link (GET/POST /api/auditoria/invitacion/<token>
// en auditoria_routes.py) pero al abrirlo en el navegador no había ninguna
// pantalla que lo atendiera. Esta página es esa pantalla, y es pública a
// propósito (quien la recibe puede no tener cuenta todavía).

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE, authFetchJson } from '../api/client';
import '../assets/css/login.css';

function InvitacionAuditor() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, usuario } = useAuth();

    const [invitacion, setInvitacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [respondiendo, setRespondiendo] = useState(false);
    const [resultado, setResultado] = useState(null); // { tipo: 'ok'|'error', texto }

    useEffect(() => {
        // Pública: no necesita sesión para ver quién invitó.
        fetch(`${API_BASE}/auditoria/invitacion/${token}`)
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    setError(data.error || 'Invitación no encontrada o ya expiró.');
                } else {
                    setInvitacion(data);
                }
            })
            .catch(() => setError('No se pudo cargar la invitación.'))
            .finally(() => setCargando(false));
    }, [token]);

    const responder = (accion) => {
        setRespondiendo(true);
        setResultado(null);
        // Rechazar no requiere sesión iniciada (ver auditoria_routes.py); aceptar sí.
        const request = accion === 'aceptar'
            ? authFetchJson(`/auditoria/invitacion/${token}/aceptar`, { method: 'POST' })
            : fetch(`${API_BASE}/auditoria/invitacion/${token}/rechazar`, { method: 'POST' }).then((r) => r.json());

        request
            .then((data) => {
                if (data && data.error) {
                    setResultado({ tipo: 'error', texto: data.error });
                } else {
                    setResultado({ tipo: 'ok', texto: data?.message || 'Listo.' });
                }
            })
            .catch(() => setResultado({ tipo: 'error', texto: 'No se pudo enviar tu respuesta.' }))
            .finally(() => setRespondiendo(false));
    };

    return (
        <div className="login-container">
            <main className="login-card">
                <h1 className="login-title">Invitación a ser auditor</h1>

                {cargando && <p>Cargando invitación…</p>}

                {!cargando && error && (
                    <>
                        <p style={{ color: '#c0392b' }}>{error}</p>
                        <div className="login-signup-container">
                            <Link to="/login" className="login-signup-link">Ir al inicio de sesión</Link>
                        </div>
                    </>
                )}

                {!cargando && invitacion && !resultado && (
                    <>
                        <p>
                            <strong>{invitacion.remitente?.nombre || 'Alguien'}</strong> te invitó a ser su auditor
                            en HorWorks: podrás ver, en modo solo lectura, si va cumpliendo sus tareas.
                        </p>
                        <p style={{ color: '#555', fontSize: '0.9rem' }}>
                            Invitación enviada a <strong>{invitacion.correoDestino}</strong> · estado: {invitacion.estado}
                        </p>

                        {invitacion.estado !== 'pendiente' ? (
                            <p>Esta invitación ya fue respondida anteriormente.</p>
                        ) : !isAuthenticated ? (
                            <>
                                <p>
                                    Para aceptar necesitas una cuenta en HorWorks con el correo al que te
                                    invitaron. Inicia sesión o regístrate y vuelve a abrir este mismo enlace.
                                </p>
                                <div className="login-signup-container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <Link to="/login" className="login-signup-link">Iniciar sesión</Link>
                                    <Link to="/registro" className="login-signup-link">Crear cuenta</Link>
                                </div>
                                <button
                                    type="button"
                                    className="login-btn-submit"
                                    style={{ marginTop: '1rem', background: '#999' }}
                                    disabled={respondiendo}
                                    onClick={() => responder('rechazar')}
                                >
                                    {respondiendo ? '…' : 'Rechazar invitación'}
                                </button>
                            </>
                        ) : (
                            <>
                                {usuario?.email && usuario.email.toLowerCase() !== invitacion.correoDestino.toLowerCase() && (
                                    <p style={{ color: '#b45309' }}>
                                        Ojo: iniciaste sesión como <strong>{usuario.email}</strong>, distinto al correo
                                        al que se mandó esta invitación ({invitacion.correoDestino}). Aun así puedes
                                        aceptarla con esta cuenta si es la tuya.
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="login-btn-submit" disabled={respondiendo} onClick={() => responder('aceptar')}>
                                        {respondiendo ? '…' : 'Aceptar'}
                                    </button>
                                    <button
                                        type="button"
                                        className="login-btn-submit"
                                        style={{ background: '#999' }}
                                        disabled={respondiendo}
                                        onClick={() => responder('rechazar')}
                                    >
                                        {respondiendo ? '…' : 'Rechazar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {resultado && (
                    <>
                        <p style={{ color: resultado.tipo === 'error' ? '#c0392b' : '#2e7d32' }}>{resultado.texto}</p>
                        <button type="button" className="login-btn-submit" onClick={() => navigate(isAuthenticated ? '/perfil' : '/login')}>
                            {isAuthenticated ? 'Ir a mi perfil' : 'Ir al inicio de sesión'}
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}

export default InvitacionAuditor;
