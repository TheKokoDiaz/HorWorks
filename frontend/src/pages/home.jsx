// LIBRERÍAS
import { useState, useEffect, useCallback } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/home.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// CLIENTE HTTP (agrega el Authorization: Bearer <token> a cada request)
import { authFetch } from '../api/client';

// Cada cuánto se refresca la actividad/estadísticas/banner para simular tiempo real
// (no hay websockets en el backend, así que se hace polling)
const POLL_MS = 30000;

function Home() {
    // --- BANNER DE PRIORIDAD ---
    const [bannerTask, setBannerTask] = useState(null); // null = no hay nada urgente (<24h)
    const [secondsLeft, setSecondsLeft] = useState(0);

    // --- PROYECTOS COLABORATIVOS ---
    const [proyectos, setProyectos] = useState([]);
    const [proyectoDetalle, setProyectoDetalle] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);

    // --- TAREAS DESTACADAS ---
    const [tareasDestacadas, setTareasDestacadas] = useState([]);

    // --- ACTIVIDAD ---
    const [actividadReciente, setActividadReciente] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('todos');
    const [historialCompleto, setHistorialCompleto] = useState([]);

    // --- ESTADÍSTICAS ---
    const [estadisticas, setEstadisticas] = useState(null);

    // ---------- CARGA DE DATOS ----------
    const cargarBanner = useCallback(() => {
        authFetch(`/dashboard/banner`)
            .then(res => res.json())
            .then(data => {
                setBannerTask(data.task);
                if (data.task) setSecondsLeft(data.task.secondsRemaining);
            })
            .catch(err => console.error('Error al cargar el banner:', err));
    }, []);

    const cargarProyectos = useCallback(() => {
        authFetch(`/proyectos/`)
            .then(res => res.json())
            .then(setProyectos)
            .catch(err => console.error('Error al cargar proyectos:', err));
    }, []);

    const cargarDestacadas = useCallback(() => {
        authFetch(`/dashboard/destacadas`)
            .then(res => res.json())
            .then(setTareasDestacadas)
            .catch(err => console.error('Error al cargar tareas destacadas:', err));
    }, []);

    const cargarActividadReciente = useCallback(() => {
        authFetch(`/actividad/?limit=4`)
            .then(res => res.json())
            .then(setActividadReciente)
            .catch(err => console.error('Error al cargar actividad:', err));
    }, []);

    const cargarEstadisticas = useCallback(() => {
        authFetch(`/dashboard/estadisticas`)
            .then(res => res.json())
            .then(setEstadisticas)
            .catch(err => console.error('Error al cargar estadísticas:', err));
    }, []);

    const cargarTodo = useCallback(() => {
        cargarBanner();
        cargarProyectos();
        cargarDestacadas();
        cargarActividadReciente();
        cargarEstadisticas();
    }, [cargarBanner, cargarProyectos, cargarDestacadas, cargarActividadReciente, cargarEstadisticas]);

    useEffect(() => {
        cargarTodo();
        const poll = setInterval(cargarTodo, POLL_MS);
        return () => clearInterval(poll);
    }, [cargarTodo]);

    // Historial filtrado (modal completo) — se recarga cada vez que cambia el filtro o se abre el modal
    useEffect(() => {
        if (!isHistoryModalOpen) return;
        authFetch(`/actividad/?categoria=${historyFilter}&limit=50`)
            .then(res => res.json())
            .then(setHistorialCompleto)
            .catch(err => console.error('Error al cargar historial:', err));
    }, [isHistoryModalOpen, historyFilter]);

    // ---------- CONTADOR LOCAL (cuenta regresiva del banner) ----------
    useEffect(() => {
        if (!bannerTask) return;
        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    cargarBanner(); // al llegar a 0, vuelve a preguntar (puede tocar cambiar de tarea/nivel)
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [bannerTask, cargarBanner]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    };

    // ---------- PROYECTOS: abrir ventana flotante de detalle ----------
    const abrirDetalleProyecto = (id) => {
        setIsProjectModalOpen(true);
        setLoadingProjectDetail(true);
        setProyectoDetalle(null);
        authFetch(`/proyectos/${id}`)
            .then(res => res.json())
            .then(data => {
                setProyectoDetalle(data);
                setLoadingProjectDetail(false);
            })
            .catch(err => {
                console.error('Error al cargar el proyecto:', err);
                setLoadingProjectDetail(false);
            });
    };

    // Insignia visual según prioridad (usada en "Tareas por realizar")
    const iconoPorPrioridad = (prioridad) => {
        const p = (prioridad || '').toLowerCase();
        if (p === 'alta') return { icon: 'local_fire_department', className: 'home-red' };
        if (p === 'media') return { icon: 'schedule', className: 'home-purple' };
        return { icon: 'low_priority', className: 'home-blue' };
    };

    const tierLabel = { alta: 'Alta prioridad', media: 'Prioridad media', baja: 'Prioridad baja' };

    // HTML
    return (
        <SidebarLayout>
            <main className="home-main-content">
                <div className="home-center-column">
                    {/* --- BANNER DE PRIORIDAD: solo aparece si hay algo urgente (<24h) --- */}
                    {bannerTask && (
                        <section className={`home-banner-priority tier-${bannerTask.priorityTier}`} id="banner-high-priority">
                            <div className="home-banner-info">
                                <span className={`material-symbols-outlined home-fire-icon tier-${bannerTask.priorityTier}`}>
                                    local_fire_department
                                </span>
                                <div>
                                    <h2>{tierLabel[bannerTask.priorityTier] || 'Tarea próxima a vencer'}</h2>
                                    <p>{bannerTask.title}</p>
                                </div>
                            </div>
                            <div className="home-banner-timer">
                                <span>Tiempo restante:</span>
                                <h3 id="countdown-timer">{formatTime(secondsLeft)}</h3>
                            </div>
                            <div className="home-banner-actions">
                                <button className="home-btn-primary">
                                    <span className="material-symbols-outlined">play_arrow</span> Continuar
                                </button>
                                <a href="/tareas">Ver detalles</a>
                            </div>
                        </section>
                    )}

                    <section className="home-projects-section" id="projects-container">
                        <h2>Proyectos colaborativos</h2>
                        <div className="home-projects-grid" id="projects-list">
                            {proyectos.length > 0 ? (
                                proyectos.map(p => (
                                    <div
                                        key={p.id}
                                        className="home-project-card"
                                        onClick={() => abrirDetalleProyecto(p.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3>{p.name}</h3>
                                        {p.photo ? (
                                            <img
                                                src={p.photo}
                                                alt={p.name}
                                                style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="home-shapes-placeholder"></div>
                                        )}
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {p.memberCount} miembro{p.memberCount !== 1 ? 's' : ''} · {p.pendingTasks} tarea{p.pendingTasks !== 1 ? 's' : ''} pendiente{p.pendingTasks !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Aún no perteneces a ningún proyecto colaborativo.</p>
                            )}
                        </div>
                    </section>

                    <section className="home-tasks-section" id="tasks-container">
                        <div className="home-section-header">
                            <h2>Tareas por realizar</h2>
                            <button className="home-btn-add" id="btn-add-task" onClick={() => window.location.href = '/tareas'}>
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <ul className="home-task-list" id="task-list-items">
                            {tareasDestacadas.length > 0 ? (
                                tareasDestacadas.map(task => {
                                    const badge = iconoPorPrioridad(task.priority);
                                    return (
                                        <li className="home-task-item" data-task-id={task.id} key={task.id}>
                                            <div className={`home-activity-icon ${badge.className}`} style={{ width: 40, height: 40 }}>
                                                <span className="material-symbols-outlined">{task.icon || badge.icon}</span>
                                            </div>
                                            <div className="home-task-details">
                                                <h4>{task.title}</h4>
                                                <p>{task.description || 'Sin descripción'}</p>
                                            </div>
                                            <div className="home-task-actions">
                                                <button onClick={() => window.location.href = '/tareas'}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No tienes tareas pendientes. 🎉</p>
                            )}
                        </ul>
                    </section>
                </div>

                <aside className="home-right-column">
                    <div className="home-widget activity-widget" id="real-time-activity">
                        <div className="home-widget-header">
                            <h3>Actividad en tiempo real</h3>
                            <span className="home-status-online">En línea</span>
                        </div>
                        <ul className="home-activity-list" id="activity-list-items">
                            {actividadReciente.length > 0 ? (
                                actividadReciente.map(item => (
                                    <li key={item.id}>
                                        <div className={`home-activity-icon home-${item.type}`}>
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <div className="home-activity-text">
                                            <strong className={item.type === 'red' ? 'home-text-red' : ''}>{item.title}</strong>
                                            <span>{item.desc}</span>
                                        </div>
                                        <span className="home-time">{item.time}</span>
                                    </li>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Sin actividad reciente.</p>
                            )}
                        </ul>
                        <button
                            type="button"
                            className="home-view-history-btn"
                            onClick={() => setIsHistoryModalOpen(true)}
                        >
                            Ver historial completo
                        </button>
                    </div>

                    <div className="home-widget home-stats-widget" id="daily-stats">
                        <h3>Tus estadísticas hoy</h3>
                        <div className="home-stats-grid">
                            <div className="home-stat-card">
                                <span className="home-stat-value home-purple-text">{estadisticas ? estadisticas.impulsosDetectados : '—'}</span>
                                <span className="home-stat-label">Impulsos detectados</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-blue-text">{estadisticas ? estadisticas.tiempoPromedioAntesDePosponer : '—'}</span>
                                <span className="home-stat-label">Tiempo promedio antes de posponer</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-blue-text">{estadisticas ? estadisticas.tareasIgnoradas : '—'}</span>
                                <span className="home-stat-label">Tareas ignoradas</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-green-text">
                                    {estadisticas ? estadisticas.rachaCumplimiento : '—'} <small>días 🔥</small>
                                </span>
                                <span className="home-stat-label">Racha de cumplimiento</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* MODAL HISTORIAL COMPLETO DE ACTIVIDAD */}
            {isHistoryModalOpen && (
                <div className="home-modal-overlay" onClick={() => setIsHistoryModalOpen(false)}>
                    <div className="home-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="home-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>history</span>
                                <h2>Historial Completo de Actividades</h2>
                            </div>
                            <button className="home-modal-close" onClick={() => setIsHistoryModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* FILTROS */}
                        <div className="home-history-filters">
                            {[
                                ['todos', 'Todos'],
                                ['completadas', 'Completadas'],
                                ['pospuestas', 'Pospuestas'],
                                ['evidencias', 'Evidencias'],
                                ['alertas', 'Alertas']
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    className={`filter-btn ${historyFilter === value ? 'active' : ''}`}
                                    onClick={() => setHistoryFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* LISTA DE ACTIVIDADES EXPANDIDA */}
                        <div className="home-history-scroll-list">
                            {historialCompleto.length > 0 ? (
                                <ul className="home-activity-list">
                                    {historialCompleto.map(item => (
                                        <li key={item.id}>
                                            <div className={`home-activity-icon home-${item.type}`}>
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div className="home-activity-text">
                                                <strong className={item.type === 'red' ? 'home-text-red' : ''}>
                                                    {item.title}
                                                </strong>
                                                <span>{item.desc}</span>
                                            </div>
                                            <span className="home-time">{item.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#64748b', margin: '2rem 0' }}>
                                    No se encontraron actividades en esta categoría.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* VENTANA FLOTANTE: DETALLE DE PROYECTO COLABORATIVO */}
            {isProjectModalOpen && (
                <div className="home-modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
                    <div className="home-modal-container" onClick={e => e.stopPropagation()}>
                        {loadingProjectDetail || !proyectoDetalle ? (
                            <p style={{ textAlign: 'center', margin: '2rem 0', color: '#64748b' }}>Cargando proyecto...</p>
                        ) : (
                            <>
                                <div className="home-modal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {proyectoDetalle.photo ? (
                                            <img src={proyectoDetalle.photo} alt={proyectoDetalle.name}
                                                style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>groups</span>
                                        )}
                                        <h2>{proyectoDetalle.name}</h2>
                                    </div>
                                    <button className="home-modal-close" onClick={() => setIsProjectModalOpen(false)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="project-detail-meta">
                                    <div className="project-detail-chip">
                                        <span className="material-symbols-outlined">badge</span>
                                        <div>
                                            <span className="project-detail-chip-label">Tu rol</span>
                                            <span className="project-detail-chip-value">{proyectoDetalle.myRole || 'Sin asignar'}</span>
                                        </div>
                                    </div>
                                    <div className="project-detail-chip">
                                        <span className="material-symbols-outlined">verified_user</span>
                                        <div>
                                            <span className="project-detail-chip-label">Auditor</span>
                                            <span className="project-detail-chip-value">{proyectoDetalle.auditor?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="project-detail-section-title">Miembros del equipo</h3>
                                    <div className="project-members-list">
                                        {proyectoDetalle.members.map(m => (
                                            <div className="project-member-row" key={m.userId}>
                                                {m.photo ? (
                                                    <img src={m.photo} alt={m.name} className="project-member-avatar" />
                                                ) : (
                                                    <div className="project-member-avatar project-member-avatar-placeholder">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                )}
                                                <span className="project-member-name">{m.name}</span>
                                                <span className="project-member-role">{m.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="project-detail-section-title">Tareas del proyecto</h3>
                                    <div className="home-history-scroll-list" style={{ maxHeight: '220px' }}>
                                        {proyectoDetalle.tasks.length > 0 ? (
                                            proyectoDetalle.tasks.map(t => (
                                                <div className="project-task-row" key={t.id}>
                                                    <span className="material-symbols-outlined">{t.icon || 'folder'}</span>
                                                    <div className="project-task-info">
                                                        <span className={t.completed ? 'project-task-done' : ''}>{t.title}</span>
                                                        <span className="project-task-sub">{t.deadlineDate || 'Sin fecha'} {t.deadlineTime}</span>
                                                    </div>
                                                    <span className={`project-task-priority priority-${(t.priority || '').toLowerCase()}`}>{t.priority}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Este proyecto aún no tiene tareas asociadas.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </SidebarLayout>
    )
}

export default Home
