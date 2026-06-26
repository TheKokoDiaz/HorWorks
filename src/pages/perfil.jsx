// LIBRERÍA
import { useState, useEffect } from 'react'

// HOJAS DE ESTILOS
import '../assets/css/perfil.css'

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function Perfil() {
    // HTML
    return (
        <SidebarLayout>
            <main class="main-content">
            
                <div class="profile-container">
                    <div class="section-header">
                        <h2>Configuración de Perfil</h2>
                    </div>

                    <div className="profile-grid">
                        <aside className="profile-summary widget" id="user-status-card">
                            <div className="avatar-container">
                                <img src="https://ui-avatars.com/api/?name=Pedro+Angel&background=fca5a5&color=fff&size=150" alt="Foto de perfil" className="profile-avatar-large" id="display_USU_Foto"/>
                                <button className="btn-edit-avatar"><span className="material-symbols-outlined">photo_camera</span></button>
                            </div>
                            
                            <h3 className="profile-username" id="display_USU_Usuario">@pedro_santos</h3>
                            
                            <span className="badge status-active" id="display_USU_Estado">Activo</span>

                            <div className="profile-stats-divider"></div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-icon purple"><span className="material-symbols-outlined">confirmation_number</span></div>
                                    <div className="stat-info">
                                        <span>Tickets Disponibles</span>
                                        <strong className="purple-text" id="display_USU_Tickets">5</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <section className="profile-details widget" id="user-data-form">
                            <h3>Datos Personales</h3>
                            <p className="subtitle">Actualiza tu información básica y credenciales de acceso.</p>

                            <form action="#" method="POST" className="profile-form">
                                <input type="hidden" name="USU_Id" id="USU_Id" value="1"/>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label for="USU_Nombre">Nombre Completo</label>
                                        <input type="text" name="USU_Nombre" id="USU_Nombre" value="Pedro Angel Santos Bautista" required/>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label for="USU_Usuario">Nombre de Usuario</label>
                                        <input type="text" name="USU_Usuario" id="USU_Usuario" value="pedro_santos" required/>
                                    </div>
                                    <div className="form-group">
                                        <label for="USU_Correo">Correo Electrónico</label>
                                        <input type="email" name="USU_Correo" id="USU_Correo" value="pedro@ejemplo.com" required/>
                                    </div>
                                </div>

                                <h3 className="section-divider">Seguridad</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label for="USU_Contrasenia">Contraseña</label>
                                        <input type="password" name="USU_Contrasenia" id="USU_Contrasenia" value="********" readonly/>
                                        <button type="button" className="btn-text mt-2">Cambiar contraseña</button>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-secondary">Cancelar</button>
                                    <button type="submit" className="btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        </section>
                    </div>


                    <aside className="profile-summary-col">
                        <div className="widget" id="user-status-card"></div>

                            <div className="widget card-split mt-4" id="auditor-card">
                                <div className="card-header-blue">
                                    <h3>Auditoría</h3>
                                </div>
                                <div className="card-body-center">
                                    <img src="https://ui-avatars.com/api/?name=Ivan+Herrera&background=bfdbfe&color=1e3a8a&size=100" alt="Auditor" className="avatar-md"/>
                                    <span className="text-muted italic">Auditor Asignado</span>
                                    <h4 className="mt-1">Ivan Herrera Reyes</h4>
                                    <p className="text-muted text-sm">233111913@upmh.edu.mx</p>
                                    <a href="/auditor" className="btn-text mt-2">Ver panel de auditoría &rarr;</a>
                                </div>
                        </div>
                    </aside>

                    <section className="profile-details-col">
                        <div className="widget" id="user-data-form"></div>
                        <div className="widget mt-4" id="user-teams-card">
                            <h3>Mis Equipos</h3>
                            <p className="subtitle">Gestiona tu participación y roles en proyectos colaborativos.</p>

                            <div className="teams-list">
                                <div className="team-item">
                                    <div className="team-icon blue-bg"><span className="material-symbols-outlined">folder_shared</span></div>
                                    <div className="team-info">
                                        <h4>Desarrollo Interfaz TECH</h4>
                                        <span className="badge role-admin">Administrador</span>
                                    </div>
                                    <a href="/equipos/1" className="icon-btn"><span className="material-symbols-outlined">chevron_right</span></a>
                                </div>

                                <div className="team-item">
                                    <div className="team-icon purple-bg"><span className="material-symbols-outlined">group_work</span></div>
                                    <div className="team-info">
                                        <h4>Campaña Marketing Q3</h4>
                                        <span className="badge role-member">Colaborador</span>
                                    </div>
                                    <a href="/equipos/2" className="icon-btn"><span className="material-symbols-outlined">chevron_right</span></a>
                                </div>
                            </div>

                            <div className="form-actions">
                                <a href="/equipos" className="btn-secondary">Explorar todos los equipos</a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </SidebarLayout>
    )
}

export default Perfil