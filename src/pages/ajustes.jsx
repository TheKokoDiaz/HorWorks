// LIBRERÍA
import { useState } from 'react'

// COMPONENTES
import Sidebar from '../components/sidebar'

// HOJAS DE ESTILOS
import '../assets/css/ajustes.css'

function Ajustes() {
    // Estado de ejemplo para los switches (puedes adaptarlo después)
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifPush, setNotifPush] = useState(false);

    return (
        <div className="layout-ajustes-container">
            {/* Agregamos tu barra lateral global aquí */}
            <Sidebar />

            {/* Contenedor del contenido principal de Ajustes */}
            <main className="contenedor-ajustes">
                <h1 className="titulo-ajustes">Ajustes</h1>

                <div className="cuadricula-ajustes">
                    {/* COLUMNA IZQUIERDA */}
                    <div className="columna-ajustes">
                        
                        {/* Tarjeta Perfil de Usuario */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta">Editar Usuario</div>
                            <div className="cuerpo-tarjeta">
                                <div className="perfil-usuario">
                                    <div className="contenedor-avatar">
                                        <img src="https://ui-avatars.com/api/?name=Pedro+Angel+Santos+Bautista&background=1c558e&color=fff" alt="Avatar Pedro" />
                                    </div>
                                    <div className="info-usuario">
                                        <h2>Pedro Angel Santos Bautista</h2>
                                        <p>233111534@upmh.edu.mx</p>
                                        <button className="btn-azul-claro">
                                            <span className="material-symbols-outlined">edit</span> Editar Perfil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tarjeta Auditor Asignado */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta">Auditoría</div>
                            <div className="cuerpo-tarjeta">
                                <div className="auditor-asignado">
                                    <div className="contenedor-avatar">
                                        <img src="https://ui-avatars.com/api/?name=Ivan+Herrera+Reyes&background=1c558e&color=fff" alt="Avatar Ivan" />
                                    </div>
                                    <div className="info-auditor">
                                        <span>Auditor Asignado</span>
                                        <h2>Ivan Herrera Reyes</h2>
                                        <p>233111913@upmh.edu.mx</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tarjeta Posponer Tickets */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta">Posponer Actividades</div>
                            <div className="cuerpo-tarjeta">
                                <div className="posponer-tickets">
                                    <div className="bloque-tickets">
                                        <span className="numero-tickets">0</span>
                                        <div className="ticket-badge">
                                            <span>TICKETS</span>
                                            <span>DISPONIBLES</span>
                                        </div>
                                        <span className="leyenda-tickets">No tienes más oportunidades</span>
                                    </div>
                                    <div className="bloque-desafio">
                                        <label>Intercambia un ticket para posponer tu actividad actual:</label>
                                        <button className="btn-usar-ticket" disabled>Usar Ticket</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="columna-ajustes">
                        
                        {/* Tarjeta Preferencias Generales */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta">Preferencias Generales</div>
                            <div className="cuerpo-tarjeta">
                                
                                <div className="fila-preferencia">
                                    <div className="etiqueta-icono">
                                        <span className="material-symbols-outlined">light_mode</span>
                                        <span>Tema</span>
                                    </div>
                                    <div className="selectores-color">
                                        <button className="btn-color azul activo"></button>
                                        <button className="btn-color verde"></button>
                                        <button className="btn-color morado"></button>
                                        <button className="btn-color naranja"></button>
                                    </div>
                                </div>

                                <div className="fila-preferencia">
                                    <div className="etiqueta-icono">
                                        <span className="material-symbols-outlined">language</span>
                                        <span>Idioma</span>
                                    </div>
                                    <select className="control-seleccion" defaultValue="es-MX">
                                        <option value="es-MX">Español (México)</option>
                                        <option value="en-US">English (US)</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia">
                                    <div className="etiqueta-icono">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <span>Zona Horaria</span>
                                    </div>
                                    <select className="control-seleccion" defaultValue="gmt-6">
                                        <option value="gmt-6">(GMT-06:00) CDMX</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia">
                                    <div className="etiqueta-icono">
                                        <span className="material-symbols-outlined">hourglass_empty</span>
                                        <span>Formato de Hora</span>
                                    </div>
                                    <div className="conmutador-horas">
                                        <button className="btn-alternar">12 horas</button>
                                        <button className="btn-alternar activo">24 horas</button>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Tarjeta Notificaciones */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta">Notificaciones</div>
                            <div className="cuerpo-tarjeta">
                                
                                <div className="fila-notificacion">
                                    <div className="texto-notificacion">
                                        <label>Correos electrónicos</label>
                                        <p>Recibir alertas de tareas vencidas en tu correo.</p>
                                    </div>
                                    <label className="switch-control">
                                        <input type="checkbox" checked={notifEmail} onChange={() => setNotifEmail(!notifEmail)} />
                                        <span className="deslizador"></span>
                                    </label>
                                </div>

                                <div className="fila-notificacion">
                                    <div className="texto-notificacion">
                                        <label>Notificaciones Push</label>
                                        <p>Alertas de escritorio en tiempo real.</p>
                                    </div>
                                    <label className="switch-control">
                                        <input type="checkbox" checked={notifPush} onChange={() => setNotifPush(!notifPush)} />
                                        <span className="deslizador"></span>
                                    </label>
                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Ajustes