// LIBRERÍAS
import { useState, useEffect } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/home.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function Home() {
    // ACTUALIZACIÓN DEL TIEMPO
    const [timeInSeconds, setTimeInSeconds] = useState((45 * 60) + 37);

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
                        <a href="#" className="home-view-history">Ver historial completo</a>
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
        </SidebarLayout>
    )
}

export default Home