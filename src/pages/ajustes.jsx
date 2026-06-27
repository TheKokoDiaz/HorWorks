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
                            <div className="encabezado-tarjeta-ajustes">Editar Usuario</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                <div className="perfil-usuario-ajustes">
                                    <div className="contenedor-avatar-ajustes">
                                        <img src="https://ui-avatars.com/api/?name=Pedro+Angel+Santos+Bautista&background=1c558e&color=fff" alt="Avatar Pedro" />
                                    </div>
                                    <div className="info-usuario-ajustes">
                                        <h2>Pedro Angel Santos Bautista</h2>
                                        <p>233111534@upmh.edu.mx</p>
                                        {/* NOS FALTA QUE ESTE BOTON TE REDIRIJA A /PERFIL */}
                                        <button className="btn-azul-claro-ajustes">
                                            <span className="material-symbols-outlined">edit</span> Editar Perfil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tarjeta Auditor Asignado */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta-ajustes">Auditoría</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                <div className="auditor-asignado-ajustes">
                                    <div className="contenedor-avatar-ajustes">
                                        <img src="https://ui-avatars.com/api/?name=Ivan+Herrera+Reyes&background=1c558e&color=fff" alt="Avatar Ivan" />
                                    </div>
                                    <div className="info-auditor-ajustes">
                                        <span>Auditor Asignado</span>
                                        <h2>Ivan Herrera Reyes</h2>
                                        <p>233111913@upmh.edu.mx</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tarjeta Posponer Tickets */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta-ajustes">Posponer Actividades</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                <div className="posponer-tickets-ajustes">
                                    <div className="bloque-tickets-ajustes">
                                        <span className="numero-tickets-ajustes">0</span>
                                        <div className="ticket-badge-ajustes">
                                            <span>TICKETS</span>
                                            <span>DISPONIBLES</span>
                                        </div>
                                        <span className="leyenda-tickets-ajustes">No tienes más oportunidades</span>
                                    </div>
                                    <div className="bloque-desafio-ajustes">
                                        <label>Intercambia un ticket para posponer tu activity actual:</label>
                                        <button className="btn-usar-ticket-ajustes" disabled>Usar Ticket</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="columna-ajustes">
                        
                        {/* Tarjeta Preferencias Generales */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta-ajustes">Preferencias Generales</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                
                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">light_mode</span>
                                        <span>Tema</span>
                                    </div>
                                    <div className="selectores-color-ajustes">
                                        <button className="btn-color-ajustes azul activo"></button>
                                        <button className="btn-color-ajustes verde"></button>
                                        <button className="btn-color-ajustes morado"></button>
                                        <button className="btn-color-ajustes naranja"></button>
                                    </div>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">language</span>
                                        <span>Idioma</span>
                                    </div>
                                    <select className="control-seleccion-ajustes" defaultValue="es-MX">
                                        <option value="es-MX">Español (México)</option>
                                        <option value="en-US">English (US)</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <span>Zona Horaria</span>
                                    </div>
                                    <select className="control-seleccion-ajustes" defaultValue="gmt-6">
                                        <option value="gmt-6">(GMT-06:00) CDMX</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">hourglass_empty</span>
                                        <span>Formato de Hora</span>
                                    </div>
                                    <div className="conmutador-horas-ajustes">
                                        <button className="btn-alternar-ajustes">12 horas</button>
                                        <button className="btn-alternar-ajustes activo">24 horas</button>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Tarjeta Notificaciones */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta-ajustes">Notificaciones</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                
                                <div className="fila-notificacion-ajustes">
                                    <div className="texto-notificacion-ajustes">
                                        <label>Correos electrónicos</label>
                                        <p>Recibir alertas de tareas vencidas en tu correo.</p>
                                    </div>
                                    <label className="switch-control-ajustes">
                                        <input type="checkbox" checked={notifEmail} onChange={() => setNotifEmail(!notifEmail)} />
                                        <span className="deslizador-ajustes"></span>
                                    </label>
                                </div>

                                <div className="fila-notificacion-ajustes">
                                    <div className="texto-notificacion-ajustes">
                                        <label>Notificaciones Push</label>
                                        <p>Alertas de escritorio en tiempo real.</p>
                                    </div>
                                    <label className="switch-control-ajustes">
                                        <input type="checkbox" checked={notifPush} onChange={() => setNotifPush(!notifPush)} />
                                        <span className="deslizador-ajustes"></span>
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