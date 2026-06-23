// HOJAS DE ESTILOS
import '../assets/css/welcome.css'

function Welcome(){
    // HTML
    return (
        <>
            {/* NAV */}
            <nav>
                <div className="logo">HOR WORKS</div>
                <ul className="nav-links">
                    <li><a href="#">Inicio</a></li>
                    <li><a href="#" className="dropdown">Herramientas</a></li>
                    <li><a href="#" className="btn-login">Iniciar sesión</a></li>
                </ul>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-text">
                    <h1>Keep focus with us</h1>
                    <p>Gestiona tareas, equipos y proyectos desde un solo lugar. Colabora mejor, entrega más rápido.</p>
                    <div className="hero-actions">
                        <button className="btn-primary">Comenzar gratis</button>
                        <button className="btn-ghost">Ver demo →</button>
                    </div>
                </div>

                <div className="hero-visual">

                    {/* Tasks Card */}
                    <div className="card-mock card-tasks">
                        <div className="card-header">
                            <span className="card-title">Tareas próximas</span>
                            <button style={{background: "#4a9eff", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", cursor: "pointer"}}>+ Nueva tarea</button>
                        </div>
                        <div className="stat-pills">
                            <div className="pill pill-blue"><span className="pill-dot" style={{background: "#2979d0"}}></span>12</div>
                            <div className="pill pill-orange"><span className="pill-dot" style={{background: "#e07b00"}}></span>3</div>
                            <div className="pill pill-red"><span className="pill-dot" style={{background: "#d63333"}}></span>8</div>
                            <div className="pill pill-green"><span className="pill-dot" style={{background: "#1d9a5f"}}></span>15</div>
                        </div>
                        <div className="task-tabs">
                            <div className="tab active">Todas</div>
                            <div className="tab">Pendientes</div>
                            <div className="tab">En progreso</div>
                            <div className="tab">Hecho</div>
                        </div>
                        <div className="task-row">
                            <div className="task-dot" style={{background: "#2979d0"}}></div>
                            <span className="task-name">Diseño de interfaz</span>
                            <span className="task-badge badge-in-progress">En progreso</span>
                        </div>
                        <div className="task-row">
                            <div className="task-dot" style={{background: "#e07b00"}}></div>
                            <span className="task-name">Revisión de sprint</span>
                            <span className="task-badge badge-review">Revisión</span>
                        </div>
                        <div className="task-row">
                            <div className="task-dot" style={{background: "#1d9a5f"}}></div>
                            <span className="task-name">Deploy a producción</span>
                            <span className="task-badge badge-done">Listo</span>
                        </div>
                        <div className="task-row">
                            <div className="task-dot" style={{background: "#aaa"}}></div>
                            <span className="task-name">Documentación API</span>
                            <span className="task-badge badge-todo">Por hacer</span>
                        </div>
                    </div>

                    {/* Mini calendar card */}
                    <div className="card-mock card-mini">
                        <div className="mini-title">Próximos eventos</div>
                        <div className="mini-row">
                            <div className="mini-indicator" style={{background: "#4a9eff"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Stand-up diario</div>
                                <div>9:00 AM</div>
                            </div>
                        </div>
                        <div className="mini-row">
                            <div className="mini-indicator" style={{background: "#ff6b6b"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Demo cliente</div>
                                <div>2:30 PM</div>
                            </div>
                        </div>
                        <div className="mini-row">
                            <div className="mini-indicator" style={{background: "#ffd166"}}></div>
                            <div>
                                <div style={{fontWeight: "600", color: "#1a2a3a", fontSize: "0.72rem"}}>Retrospectiva</div>
                                <div>4:00 PM</div>
                            </div>
                        </div>
                    </div>

                    {/* Teams Card */}
                    <div className="card-mock card-teams">
                        <div className="card-header">
                            <span className="card-title">Equipos</span>
                            <span style={{fontSize: "0.7rem", color: "#888"}}>Ver todos →</span>
                        </div>
                        <div className="teams-grid">
                            <div className="team-item">
                                <div className="avatar av-blue">🐻</div>
                                <span className="team-name">Diseño</span>
                            </div>
                            <div className="team-item">
                                <div className="avatar av-purple">🦊</div>
                                <span className="team-name">Backend</span>
                            </div>
                            <div className="team-item">
                                <div className="avatar av-pink">🐼</div>
                                <span className="team-name">Frontend</span>
                            </div>
                            <div className="team-item">
                                <div className="avatar av-yellow">🐧</div>
                                <span className="team-name">DevOps</span>
                            </div>
                            <div className="team-item">
                                <div className="avatar av-green">🦁</div>
                                <span className="team-name">QA</span>
                            </div>
                            <div className="team-item">
                                <div className="avatar av-orange">🐸</div>
                                <span className="team-name">Datos</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="features-header">
                    <span>¿Por qué HOR WORKS?</span>
                    <h2>Todo lo que tu equipo necesita</h2>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: "rgba(74,158,255,.15)"}}>📋</div>
                        <h3>Gestión de tareas</h3>
                        <p>Organiza, prioriza y da seguimiento a cada tarea con vistas de tablero, lista y calendario.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: "rgba(255,107,107,.15)"}}>👥</div>
                        <h3>Equipos conectados</h3>
                        <p>Crea equipos, asigna roles y mantén a todos alineados con actualizaciones en tiempo real.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{background: "rgba(255,209,102,.15)"}}>📊</div>
                        <h3>Reportes y métricas</h3>
                        <p>Visualiza el progreso de tus proyectos con dashboards claros y exportables al instante.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <div className="footer-logo">HOR WORKS</div>
                <div>© 2026 HOR WORKS. Todos los derechos reservados.</div>
                <div style={{display: "flex", gap: "20px"}}>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Privacidad</a>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Términos</a>
                    <a href="#" style={{color: "inherit", textDecoration: "none"}}>Contacto</a>
                </div>
            </footer>
        </>
    )
}

export default Welcome