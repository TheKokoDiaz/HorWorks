// LIBRERÍAS
import { useState, useEffect } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/home.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function Home() {
    // ACTUALIZACIÓN DEL TIEMPO
    const [timeInSeconds, setTimeInSeconds] = useState((45 * 60) + 37);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('todos');

    const fullHistoryItems = [
        { id: 1, type: 'green', icon: 'check_circle', title: 'Completaste', desc: 'Hacer ejercicio', time: 'Hace 10 min', category: 'completadas' },
        { id: 2, type: 'purple', icon: 'schedule', title: 'Pospusiste', desc: 'Reunión con el equipo', time: 'Hace 15 min', category: 'pospuestas' },
        { id: 3, type: 'blue', icon: 'photo_camera', title: 'Evidencia subida', desc: 'Gym.png', time: 'Hace 20 min', category: 'evidencias' },
        { id: 4, type: 'red', icon: 'warning', title: 'Alerta de desvío', desc: 'Detectamos inactividad', time: 'Hace 25 min', category: 'alertas' },
        { id: 5, type: 'green', icon: 'check_circle', title: 'Completaste', desc: 'Avance de prototipo Figma', time: 'Hace 1 hora', category: 'completadas' },
        { id: 6, type: 'blue', icon: 'description', title: 'Evidencia subida', desc: 'Reporte_Semanal.pdf', time: 'Hace 2 horas', category: 'evidencias' },
        { id: 7, type: 'purple', icon: 'schedule', title: 'Pospusiste', desc: 'Revisión de Base de Datos', time: 'Hace 3 horas', category: 'pospuestas' },
        { id: 8, type: 'green', icon: 'check_circle', title: 'Completaste', desc: 'Lectura de requerimientos', time: 'Ayer, 4:30 PM', category: 'completadas' },
        { id: 9, type: 'red', icon: 'warning', title: 'Alerta de desvío', desc: 'Uso prolongado de redes sociales', time: 'Ayer, 2:15 PM', category: 'alertas' }
    ];

    const filteredHistory = historyFilter === 'todos'
        ? fullHistoryItems
        : fullHistoryItems.filter(item => item.category === historyFilter);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeInSeconds(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const displayTime =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    // HTML
    return (
        <SidebarLayout>
            <main className="home-main-content">
                <div className="home-center-column">
                    <section className="home-banner-priority" id="banner-high-priority">
                        <div className="home-banner-info">
                            <span className="material-symbols-outlined home-fire-icon">local_fire_department</span>
                            <div>
                                <h2>Tarea de alta prioridad</h2>
                                <p>Entrega de reporte de proyecto</p>
                            </div>
                        </div>
                        <div className="home-banner-timer">
                            <span>Tiempo restante:</span>
                            <h3 id="countdown-timer">{displayTime}</h3>
                        </div>
                        <div className="home-banner-actions">
                            <button className="home-btn-primary"><span className="material-symbols-outlined">play_arrow</span> Continuar</button>
                            <a href="#">Ver detalles</a>
                        </div>
                    </section>

                    <section className="home-projects-section" id="projects-container">
                        <h2>Proyectos colaborativos</h2>
                        <div className="home-projects-grid" id="projects-list">
                            <div className="home-project-card">
                                <h3>Proyecto 1</h3>
                                <div className="home-shapes-placeholder"></div>
                            </div>
                            <div className="home-project-card">
                                <h3>Proyecto 2</h3>
                                <div className="home-shapes-placeholder"></div>
                            </div>
                            <div className="home-project-card">
                                <h3>Proyecto 3</h3>
                                <div className="home-shapes-placeholder"></div>
                            </div>
                            <div className="home-project-card home-small-card">
                                <a href="#">Show all</a>
                            </div>
                        </div>
                    </section>

                    <section className="home-tasks-section" id="tasks-container">
                        <div className="home-section-header">
                            <h2>Tareas por realizar</h2>
                            <button className="home-btn-add" id="btn-add-task"><span className="material-symbols-outlined">add</span></button>
                        </div>
                        <ul className="home-task-list" id="task-list-items">
                            <li className="home-task-item" data-task-id="1">
                                <div className="home-task-icon home-placeholder"></div>
                                <div className="home-task-details">
                                    <h4>Tarea 1</h4>
                                    <p>Avanzar con el mockup</p>
                                </div>
                                <div className="home-task-actions">
                                    <button><span className="material-symbols-outlined">edit</span></button>
                                    <button><span className="material-symbols-outlined">more_vert</span></button>
                                </div>
                            </li>
                            <li className="home-task-item" data-task-id="2">
                                <div className="home-task-icon home-placeholder"></div>
                                <div className="home-task-details">
                                    <h4>List item</h4>
                                    <p>Supporting line text lorem ipsum dolor sit amet, consectetur.</p>
                                </div>
                                <div className="home-task-actions">
                                    <button><span className="material-symbols-outlined">more_vert</span></button>
                                </div>
                            </li>
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
                            <li>
                                <div className="home-activity-icon home-green"><span className="material-symbols-outlined">check_circle</span></div>
                                <div className="home-activity-text">
                                    <strong>Completaste</strong>
                                    <span>Hacer ejercicio</span>
                                </div>
                                <span className="home-time">Hace 10 min</span>
                            </li>
                            <li>
                                <div className="home-activity-icon home-purple"><span className="material-symbols-outlined">schedule</span></div>
                                <div className="home-activity-text">
                                    <strong>Pospusiste</strong>
                                    <span>Reunión con el equipo</span>
                                </div>
                                <span className="home-time">Hace 15 min</span>
                            </li>
                            <li>
                                <div className="home-activity-icon home-blue"><span className="material-symbols-outlined">photo_camera</span></div>
                                <div className="home-activity-text">
                                    <strong>Evidencia subida</strong>
                                    <span className="home-link">Gym.png</span>
                                </div>
                                <span className="home-time">Hace 20 min</span>
                            </li>
                            <li>
                                <div className="home-activity-icon home-red"><span className="material-symbols-outlined">warning</span></div>
                                <div className="home-activity-text">
                                    <strong className="home-text-red">Alerta de desvío</strong>
                                    <span>Detectamos inactividad</span>
                                </div>
                                <span className="home-time">Hace 25 min</span>
                            </li>
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
                                <span className="home-stat-value home-purple-text">4</span>
                                <span className="home-stat-label">Impulsos detectados</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-blue-text">3.2s</span>
                                <span className="home-stat-label">Tiempo promedio antes de posponer</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-blue-text">2</span>
                                <span className="home-stat-label">Tareas ignoradas</span>
                            </div>
                            <div className="home-stat-card">
                                <span className="home-stat-value home-green-text">5 <small>días 🔥</small></span>
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
                            <button
                                className={`filter-btn ${historyFilter === 'todos' ? 'active' : ''}`}
                                onClick={() => setHistoryFilter('todos')}
                            >
                                Todos
                            </button>
                            <button
                                className={`filter-btn ${historyFilter === 'completadas' ? 'active' : ''}`}
                                onClick={() => setHistoryFilter('completadas')}
                            >
                                Completadas
                            </button>
                            <button
                                className={`filter-btn ${historyFilter === 'pospuestas' ? 'active' : ''}`}
                                onClick={() => setHistoryFilter('pospuestas')}
                            >
                                Pospuestas
                            </button>
                            <button
                                className={`filter-btn ${historyFilter === 'evidencias' ? 'active' : ''}`}
                                onClick={() => setHistoryFilter('evidencias')}
                            >
                                Evidencias
                            </button>
                            <button
                                className={`filter-btn ${historyFilter === 'alertas' ? 'active' : ''}`}
                                onClick={() => setHistoryFilter('alertas')}
                            >
                                Alertas
                            </button>
                        </div>

                        {/* LISTA DE ACTIVIDADES EXPANDIDA */}
                        <div className="home-history-scroll-list">
                            {filteredHistory.length > 0 ? (
                                <ul className="home-activity-list">
                                    {filteredHistory.map(item => (
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
        </SidebarLayout>
    )
}

export default Home