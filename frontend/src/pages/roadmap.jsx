// LIBRERÍA
import { useState, useEffect, useMemo, useCallback } from 'react'

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// HOJAS DE ESTILOS
import '../assets/css/roadmap.css'

// CLIENTE HTTP (agrega el Authorization: Bearer <token> a cada request)
import { authFetchJson } from '../api/client';

const NOMBRES_MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const TRIMESTRES = [
    { titulo: 'T1', meses: [0, 1, 2] },
    { titulo: 'T2', meses: [3, 4, 5] },
    { titulo: 'T3', meses: [6, 7, 8] },
    { titulo: 'T4', meses: [9, 10, 11] },
];

// Mapea el estado que calcula el backend (app/routes/home_routes.py::_estado_roadmap)
// al color/etiqueta que ya definía el diseño original del roadmap.
const ESTADO_INFO = {
    pendiente: { clase: 'color-5', etiqueta: 'PENDIENTE' },
    retraso: { clase: 'color-4', etiqueta: 'RETRASO' },
    completado: { clase: 'color-3', etiqueta: 'COMPLETADO' },
    cancelado: { clase: 'color-6', etiqueta: 'CANCELADO' },
};

/** Acomoda las tareas de una fila en el menor número de "carriles" (grid-row)
 *  posible, evitando que dos tareas del mismo mes se encimen. */
function acomodarEnCarriles(tareas) {
    const ordenadas = [...tareas].sort((a, b) => (a.month || 0) - (b.month || 0));
    const carriles = []; // cada carril guarda el último mes que ocupa

    return ordenadas.map((tarea) => {
        let carril = carriles.findIndex((ultimoMes) => ultimoMes < tarea.month);
        if (carril === -1) {
            carril = carriles.length;
            carriles.push(tarea.month);
        } else {
            carriles[carril] = tarea.month;
        }
        return { ...tarea, carril };
    });
}

function Roadmap() {
    const anioActual = new Date().getFullYear();
    const [year, setYear] = useState(anioActual);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [googleStatus, setGoogleStatus] = useState({ connected: false, email: null });
    const [googleBanner, setGoogleBanner] = useState(null); // { type: 'ok'|'error', text }
    const [connecting, setConnecting] = useState(false);

    // ---------- Cargar tareas del roadmap ----------
    const cargarRoadmap = useCallback(() => {
        setLoading(true);
        authFetchJson(`/roadmap/?year=${year}`)
            .then((data) => setRows(data && Array.isArray(data.rows) ? data.rows : []))
            .catch((err) => console.error('Error al cargar el roadmap:', err))
            .finally(() => setLoading(false));
    }, [year]);

    useEffect(() => { cargarRoadmap(); }, [cargarRoadmap]);

    // ---------- Estado de conexión con Google Calendar ----------
    const cargarGoogleStatus = useCallback(() => {
        authFetchJson('/google/status')
            .then((data) => { if (data && !data.error) setGoogleStatus(data); })
            .catch((err) => console.error('Error al consultar estado de Google Calendar:', err));
    }, []);

    useEffect(() => { cargarGoogleStatus(); }, [cargarGoogleStatus]);

    // Si venimos de regreso del consentimiento de Google (?google=connected|error)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resultado = params.get('google');
        if (!resultado) return;

        if (resultado === 'connected') {
            setGoogleBanner({ type: 'ok', text: 'Google Calendar conectado. Tus tareas con fecha límite ya se sincronizan.' });
            cargarGoogleStatus();
            cargarRoadmap();
        } else if (resultado === 'error') {
            const motivo = params.get('motivo') || 'desconocido';
            setGoogleBanner({ type: 'error', text: `No se pudo conectar Google Calendar (${motivo}).` });
        }

        // Limpia el query string para no repetir el banner en un refresh
        window.history.replaceState({}, '', window.location.pathname);
    }, [cargarGoogleStatus, cargarRoadmap]);

    const handleConectarGoogle = async () => {
        setConnecting(true);
        try {
            const data = await authFetchJson('/google/auth-url');
            if (data && data.url) {
                window.location.href = data.url; // navegación completa: Google necesita redirigir de vuelta al backend
            } else {
                setGoogleBanner({ type: 'error', text: (data && data.error) || 'No se pudo iniciar la conexión con Google.' });
            }
        } catch (err) {
            console.error(err);
            setGoogleBanner({ type: 'error', text: 'No se pudo iniciar la conexión con Google.' });
        } finally {
            setConnecting(false);
        }
    };

    const handleDesconectarGoogle = async () => {
        try {
            await authFetchJson('/google/disconnect', { method: 'POST' });
            setGoogleStatus({ connected: false, email: null });
            setGoogleBanner({ type: 'ok', text: 'Google Calendar desconectado.' });
        } catch (err) {
            console.error(err);
        }
    };

    // ---------- Línea vertical "HOY" ----------
    const hoy = new Date();
    const esAnioActual = year === anioActual;
    const fraccionAnio = (hoy.getMonth() + hoy.getDate() / 31) / 12; // 0..1 aprox dentro del año
    const trimestreActualIdx = Math.floor(hoy.getMonth() / 3);

    // ---------- Filas con carriles calculados ----------
    const filasProcesadas = useMemo(() => {
        return rows.map((fila) => {
            const conFecha = fila.tasks.filter((t) => t.month);
            const sinFecha = fila.tasks.filter((t) => !t.month);
            const acomodadas = acomodarEnCarriles(conFecha);
            const carriles = acomodadas.length ? Math.max(...acomodadas.map((t) => t.carril)) + 1 : 1;
            return { ...fila, tasksAcomodadas: acomodadas, sinFecha, carriles };
        });
    }, [rows]);

    return (
        <SidebarLayout>
            <div className="roadmap-container">
                {/* Encabezado y Leyenda */}
                <header className="roadmap-header">
                    <div className="header-title">
                        <h2>ROADMAP {year}</h2>
                        <p>TAREAS PROPIAS Y DE EQUIPO POR MES</p>
                    </div>
                    <div className="color-legend">
                        {Object.entries(ESTADO_INFO).map(([key, info]) => (
                            <div className="legend-item" key={key}>
                                <span className={`badge ${info.clase}`}></span> {info.etiqueta}
                            </div>
                        ))}
                    </div>
                </header>

                {/* Selector de año + estado de Google Calendar */}
                <div className="roadmap-toolbar">
                    <div className="year-switch">
                        <button onClick={() => setYear((y) => y - 1)} aria-label="Año anterior">‹</button>
                        <span>{year}</span>
                        <button onClick={() => setYear((y) => y + 1)} aria-label="Año siguiente">›</button>
                    </div>

                    <div className="google-connect">
                        {googleStatus.connected ? (
                            <>
                                <span className="google-connected-tag">
                                    <span className="material-symbols-outlined">event_available</span>
                                    Google Calendar conectado{googleStatus.email ? ` (${googleStatus.email})` : ''}
                                </span>
                                <button className="google-disconnect-btn" onClick={handleDesconectarGoogle}>Desconectar</button>
                            </>
                        ) : (
                            <button className="google-connect-btn" onClick={handleConectarGoogle} disabled={connecting}>
                                <span className="material-symbols-outlined">calendar_add_on</span>
                                {connecting ? 'Conectando…' : 'Conectar Google Calendar'}
                            </button>
                        )}
                    </div>
                </div>

                {googleBanner && (
                    <div className={`google-banner ${googleBanner.type}`}>
                        {googleBanner.text}
                        <button onClick={() => setGoogleBanner(null)} aria-label="Cerrar aviso">×</button>
                    </div>
                )}

                <div className="timeline-grid header-grid">
                    <div className="row-label-blank"></div>
                    <div className="months-container-wrapper">
                        <div className="months-container">
                            {TRIMESTRES.map((t, i) => (
                                <div className="quarter-col" key={t.titulo}>
                                    <div className={esAnioActual && i === trimestreActualIdx ? 'quarter-title-current' : 'quarter-title'}>
                                        {t.titulo} {esAnioActual && i === trimestreActualIdx && <span className="hoy-tag">HOY</span>}
                                    </div>
                                    <div className="months-subgrid">
                                        {t.meses.map((m) => <div key={m}>{NOMBRES_MES[m]}</div>)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Línea "Hoy" posicionada dentro del wrapper de meses (0% a 100% del grid) */}
                        {esAnioActual && (
                            <div 
                                className="today-line" 
                                style={{ left: `${fraccionAnio * 100}%` }}
                            ></div>
                        )}
                    </div>
                </div>

                {loading && <p className="roadmap-loading">Cargando roadmap…</p>}

                {!loading && filasProcesadas.every((f) => f.tasks.length === 0) && (
                    <p className="roadmap-empty">No tienes tareas con fecha límite en {year}. Crea una en "Mis Tareas" y aparecerá aquí.</p>
                )}

                {!loading && filasProcesadas.map((fila) => (
                    <section className="roadmap-section" key={fila.id}>
                        <div className="timeline-grid">
                            <div className="row-label">{fila.label.toUpperCase()}</div>
                            <div className="tasks-space" style={{ gridTemplateRows: `repeat(${fila.carriles}, 32px)` }}>
                                <div className="bg-grid-lines">
                                    {Array.from({ length: 12 }).map((_, i) => <div key={i}></div>)}
                                </div>

                                {fila.tasksAcomodadas.map((tarea) => {
                                    const info = ESTADO_INFO[tarea.status] || ESTADO_INFO.pendiente;
                                    return (
                                        <div
                                            key={tarea.id}
                                            className={`task ${info.clase}`}
                                            title={`${tarea.title} — vence ${tarea.deadlineDate}${tarea.syncedWithGoogle ? ' — sincronizada con Google Calendar' : ''}`}
                                            style={{ gridColumn: `${tarea.month} / ${tarea.month + 1}`, gridRow: tarea.carril + 1 }}
                                        >
                                            {tarea.syncedWithGoogle && <span className="material-symbols-outlined task-sync-icon">event_available</span>}
                                            {tarea.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {fila.sinFecha.length > 0 && (
                            <p className="roadmap-sin-fecha">
                                {fila.sinFecha.length} tarea(s) sin fecha límite no se muestran en la línea de tiempo.
                            </p>
                        )}
                    </section>
                ))}
            </div>
        </SidebarLayout>
    );
}

export default Roadmap;
