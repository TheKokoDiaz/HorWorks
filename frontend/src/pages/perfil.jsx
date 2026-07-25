// LIBRERÍA
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/Perfil.css'

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function Perfil() {
    // HTML
    return (
        <SidebarLayout>
            <main className="prf-main-content">
                <div className="prf-profile-container">
                    <div className="prf-section-header">
                        <h2>Configuración de Perfil</h2>
                    </div>

                    <div className="prf-profile-grid">
                        <aside className="prf-profile-summary prf-widget" id="user-status-card">
                            <div className="prf-avatar-container">
                                <img src="https://ui-avatars.com/api/?name=Pedro+Angel&background=fca5a5&color=fff&size=150" alt="Foto de perfil" className="prf-profile-avatar-large" id="display_USU_Foto"/>
                                <button className="prf-btn-edit-avatar"><span className="material-symbols-outlined">photo_camera</span></button>
                            </div>
                            
                            <h3 className="prf-profile-username" id="display_USU_Usuario">@pedro_santos</h3>
                            
                            <span className="prf-badge status-active" id="display_USU_Estado">Activo</span>

                            <div className="prf-profile-stats-divider"></div>

                            <div className="prf-profile-stats">
                                <div className="prf-stat-item">
                                    <div className="prf-stat-icon prf-purple"><span className="material-symbols-outlined">confirmation_number</span></div>
                                    <div className="prf-stat-info">
                                        <span>Tickets Disponibles</span>
                                        <strong className="prf-purple-text" id="display_USU_Tickets">5</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <section className="prf-profile-details prf-widget" id="user-data-form">
                            <h3>Datos Personales</h3>
                            <p className="prf-subtitle">Actualiza tu información básica y credenciales de acceso.</p>

                            <form action="#" method="POST" className="prf-profile-form">
                                <input type="hidden" name="USU_Id" id="USU_Id" value="1" readOnly/>

                                <div className="prf-form-row">
                                    <div className="prf-form-group prf-full-width">
                                        <label htmlFor="USU_Nombre">Nombre Completo</label>
                                        <input type="text" name="USU_Nombre" id="USU_Nombre" value="Pedro Angel Santos Bautista" required readOnly/>
                                    </div>
                                </div>

                                <div className="prf-form-row">
                                    <div className="prf-form-group">
                                        <label htmlFor="USU_Usuario">Nombre de Usuario</label>
                                        <input type="text" name="USU_Usuario" id="USU_Usuario" value="pedro_santos" required readOnly/>
                                    </div>
                                    <div className="prf-form-group">
                                        <label htmlFor="USU_Correo">Correo Electrónico</label>
                                        <input type="email" name="USU_Correo" id="USU_Correo" value="pedro@ejemplo.com" required readOnly/>
                                    </div>
                                </div>

                                <h3 className="prf-section-divider">Seguridad</h3>

                                <div className="prf-form-row">
                                    <div className="prf-form-group">
                                        <label htmlFor="USU_Contrasenia">Contraseña</label>
                                        <input type="password" name="USU_Contrasenia" id="USU_Contrasenia" value="********" readOnly/>
                                        <button type="button" className="prf-btn-text prf-mt-2">Cambiar contraseña</button>
                                    </div>
                                </div>

                                <div className="prf-form-actions">
                                    <button type="button" className="prf-btn-secondary">Cancelar</button>
                                    <button type="submit" className="prf-btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        </section>
                    </div>


                    <aside className="prf-profile-summary-col">
                        <div className="prf-widget prf-card-split prf-mt-4" id="auditor-card">
                            <div className="prf-card-header-blue">
                                <h3>Auditoría</h3>
                            </div>
                            <div className="prf-card-body-center">
                                <img src="https://ui-avatars.com/api/?name=Ivan+Herrera&background=bfdbfe&color=1e3a8a&size=100" alt="Auditor" className="prf-avatar-md"/>
                                <span className="prf-text-muted prf-italic">Auditor Asignado</span>
                                <h4 className="prf-mt-1">Ivan Herrera Reyes</h4>
                                <p className="prf-text-muted prf-text-sm">233111913@upmh.edu.mx</p>
                                <a href="/auditor" className="prf-btn-text prf-mt-2">Ver panel de auditoría &rarr;</a>
                            </div>
                        </div>
                    </aside>

                    <section className="prf-profile-details-col">
                        <div className="prf-widget prf-mt-4" id="user-teams-card">
                            <h3>Mis Equipos</h3>
                            <p className="prf-subtitle">Gestiona tu participación y roles en proyectos colaborativos.</p>

                            <div className="prf-teams-list">
                                <div className="prf-team-item">
                                    <div className="prf-team-icon prf-blue-bg"><span className="material-symbols-outlined">folder_shared</span></div>
                                    <div className="prf-team-info">
                                        <h4>Desarrollo Interfaz TECH</h4>
                                        <span className="prf-badge prf-role-admin">Administrador</span>
                                    </div>
                                    <a href="/equipos/1" className="prf-icon-btn"><span className="material-symbols-outlined">chevron_right</span></a>
                                </div>

                                <div className="prf-team-item">
                                    <div className="prf-team-icon prf-purple-bg"><span className="material-symbols-outlined">group_work</span></div>
                                    <div className="prf-team-info">
                                        <h4>Campaña Marketing Q3</h4>
                                        <span className="prf-badge prf-role-member">Colaborador</span>
                                    </div>
                                    <a href="/equipos/2" className="prf-icon-btn"><span className="material-symbols-outlined">chevron_right</span></a>
                                </div>
                            </div>

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