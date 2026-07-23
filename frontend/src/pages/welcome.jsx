// HOJAS DE ESTILOS
import '../assets/css/welcome.css'

function Welcome(){
    // HTML
    return (
        <section className='welcome-body'>
            {/* NAV */}
            <nav className='welcome-nav'>
                <div className="welcome-logo">HOR WORKS</div>
                <ul className="welcome-nav-links">
                    <li><a href="#">Inicio</a></li>
                    <li><a href="#" className="welcome-dropdown">Herramientas</a></li>
                    <li><a href="#" className="welcome-btn-login">Iniciar sesión</a></li>
                </ul>
            </nav>

            {/* HERO */}
            <section className="welcome-hero">
                <div className="welcome-hero-text">
                    <h1>Keep focus with us</h1>
                    <p>Gestiona tareas, equipos y proyectos desde un solo lugar. Colabora mejor, entrega más rápido.</p>
                    <div className="welcome-hero-actions">
                        <button className="welcome-btn-primary">Comenzar gratis</button>
                        <button className="welcome-btn-ghost">Ver demo →</button>
                    </div>
                </div>

                <div className="welcome-hero-visual">
                    {/* Tasks Card */}
                    <div className="welcome-card-mock welcome-card-tasks">
                        <div className="welcome-card-header">
                            <span className="welcome-card-title">Tareas próximas</span>
                            <button style={{background: "#4a9eff", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer"}}>+ Nueva tarea</button>
                        </div>
                        <div className="welcome-stat-pills">
                            <div className="welcome-pill welcome-pill-blue"><span className="welcome-pill-dot" style={{background: "#2979d0"}}></span>12</div>
                            <div className="welcome-pill welcome-pill-orange"><span className="welcome-pill-dot" style={{background: "#e07b00"}}></span>3</div>
                            <div className="welcome-pill welcome-pill-red"><span className="welcome-pill-dot" style={{background: "#d63333"}}></span>8</div>
                            <div className="welcome-pill welcome-pill-green"><span className="welcome-pill-dot" style={{background: "#1d9a5f"}}></span>15</div>
                        </div>
                        <div className="welcome-task-tabs">
                            <div className="welcome-tab welcome-active">Todas</div>
                            <div className="welcome-tab">Pendientes</div>
                            <div className="welcome-tab">En progreso</div>
                            <div className="welcome-tab">Hecho</div>
                        </div>
                        <div className="welcome-task-row">
                            <div className="welcome-task-dot" style={{background: "#2979d0"}}></div>
                            <span className="welcome-task-name">Diseño de interfaz</span>
                            <span className="welcome-task-badge welcome-badge-in-progress">En progreso</span>
                        </div>
                        <div className="welcome-task-row">
                            <div className="welcome-task-dot" style={{background: "#e07b00"}}></div>
                            <span className="welcome-task-name">Revisión de sprint</span>
                            <span className="welcome-task-badge welcome-badge-review">Revisión</span>
                        </div>
                        <div className="welcome-task-row">
                            <div className="welcome-task-dot" style={{background: "#1d9a5f"}}></div>
                            <span className="welcome-task-name">Deploy a producción</span>
                            <span className="welcome-task-badge welcome-badge-done">Listo</span>
                        </div>
                        <div className="welcome-task-row">
                            <div className="welcome-task-dot" style={{background: "#aaa"}}></div>
                            <span className="welcome-task-name">Documentación API</span>
                            <span className="welcome-task-badge welcome-badge-todo">Por hacer</span>
                        </div>
                    </div>

                    {/* Mini calendar card */}
                    <div className="welcome-card-mock welcome-card-mini">
                        <div className="welcome-mini-title">Próximos eventos</div>
                        <div className="welcome-mini-row">
                            <div className="welcome-mini-indicator" style={{background: "#4a9eff"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Stand-up diario</div>
                                <div>9:00 AM</div>
                            </div>
                        </div>
                        <div className="welcome-mini-row">
                            <div className="welcome-mini-indicator" style={{background: "#ff6b6b"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Demo cliente</div>
                                <div>2:30 PM</div>
                            </div>
                        </div>
                        <div className="welcome-mini-row">
                            <div className="welcome-mini-indicator" style={{background: "#ffd166"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Retrospectiva</div>
                                <div>4:00 PM</div>
                            </div>
                        </div>
                    </div>

                    {/* Teams Card */}
                    <div className="welcome-card-mock welcome-card-teams">
                        <div className="welcome-card-header">
                            <span className="welcome-card-title">Equipos</span>
                            <span style={{fontSize: "0.7rem", color: "#888"}}>Ver todos →</span>
                        </div>
                        <div className="welcome-teams-grid">
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-blue">🐻</div>
                                <span className="welcome-team-name">Diseño</span>
                            </div>
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-purple">🦊</div>
                                <span className="welcome-team-name">Backend</span>
                            </div>
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-pink">🐼</div>
                                <span className="welcome-team-name">Frontend</span>
                            </div>
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-yellow">🐧</div>
                                <span className="welcome-team-name">DevOps</span>
                            </div>
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-green">🦁</div>
                                <span className="welcome-team-name">QA</span>
                            </div>
                            <div className="welcome-team-item">
                                <div className="welcome-avatar welcome-av-orange">🐸</div>
                                <span className="welcome-team-name">Datos</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* FEATURES */}
            <section className="welcome-features">
                <div className="welcome-features-header">
                    <span>¿Por qué HOR WORKS?</span>
                    <h2>Todo lo que tu equipo necesita</h2>
                </div>
                <div className="welcome-features-grid">
                    <div className="welcome-feature-card">
                        <div className="welcome-feature-icon" style={{background: "rgba(74,158,255,.15)"}}>📋</div>
                        <h3>Gestión de tareas</h3>
                        <p>Organiza, prioriza y da seguimiento a cada tarea con vistas de tablero, lista y calendario.</p>
                    </div>
                    <div className="welcome-feature-card">
                        <div className="welcome-feature-icon" style={{background: "rgba(255,107,107,.15)"}}>👥</div>
                        <h3>Equipos conectados</h3>
                        <p>Crea equipos, asigna roles y mantén a todos alineados con actualizaciones en tiempo real.</p>
                    </div>
                    <div className="welcome-feature-card">
                        <div className="welcome-feature-icon" style={{background: "rgba(255,209,102,.15)"}}>📊</div>
                        <h3>Reportes y métricas</h3>
                        <p>Visualiza el progreso de tus proyectos con dashboards claros y exportables al instante.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className='welcome-footer'>
                <div className="welcome-footer-logo">HOR WORKS</div>
                <div>© 2026 HOR WORKS. Todos los derechos reservados.</div>
                <div style={{display: "flex", gap: "20px"}}>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Privacidad</a>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Términos</a>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Contacto</a>
                </div>
            </footer>
        </section>
    )
}

export default Welcome