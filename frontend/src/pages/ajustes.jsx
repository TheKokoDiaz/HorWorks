// LIBRERÍA
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom';

// COMPONENTES
import SidebarLayout from '../layouts/SidebarLayout';

// HOJAS DE ESTILOS
import '../assets/css/ajustes.css'

// SESIÓN
import { useAuth } from '../context/AuthContext';
// Preferencias: mismo contexto que ya aplica el tema a toda la app, para que
// esta pantalla y el resto de la app siempre estén viendo el mismo dato.
import { useAjustes } from '../context/AjustesContext';

const TEMAS = ['azul', 'verde', 'morado', 'naranja'];

function Ajustes() {
    const { usuario } = useAuth();
    const { ajustes, loading, actualizarAjustes } = useAjustes();

    const [guardando, setGuardando] = useState(false);

    // Actualiza en pantalla al toque (optimista, ya lo hace el contexto) y
    // manda el cambio al backend; si falla, no revertimos la UI para no ser
    // molestos, solo lo mandamos a consola.
    const actualizarAjuste = useCallback((cambios) => {
        setGuardando(true);
        actualizarAjustes(cambios)
            .catch((err) => console.error('Error al guardar ajustes:', err))
            .finally(() => setGuardando(false));
    }, [actualizarAjustes]);

    const nombreUsuario = usuario?.nombre || 'Usuario';
    const avatarUrl = usuario?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=1c558e&color=fff`;
    const ticketsDisponibles = usuario?.tickets ?? 0;

    if (loading || !ajustes) {
        return (
            <div className="layout-ajustes-container">
                <SidebarLayout />
                <main className="contenedor-ajustes">
                    <h1 className="titulo-ajustes">Ajustes</h1>
                    <p>Cargando…</p>
                </main>
            </div>
        );
    }

    return (
        <div className="layout-ajustes-container">
            {/* Agregamos tu barra lateral global aquí */}
            <SidebarLayout />

            {/* Contenedor del contenido principal de Ajustes */}
            <main className="contenedor-ajustes">
                <h1 className="titulo-ajustes">
                    Ajustes {guardando && <span className="guardando-ajustes">Guardando…</span>}
                </h1>

                <div className="cuadricula-ajustes">
                    {/* COLUMNA IZQUIERDA */}
                    <div className="columna-ajustes">

                        {/* Tarjeta Perfil de Usuario */}
                        <section className="tarjeta-ajustes">
                            <div className="encabezado-tarjeta-ajustes">Editar Usuario</div>
                            <div className="cuerpo-tarjeta-ajustes">
                                <div className="perfil-usuario-ajustes">
                                    <div className="contenedor-avatar-ajustes">
                                        <img
                                            src={avatarUrl}
                                            alt={nombreUsuario}
                                            onError={(e) => {
                                                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=1c558e&color=fff`;
                                                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                                            }}
                                        />
                                    </div>
                                    <div className="info-usuario-ajustes">
                                        <h2>{nombreUsuario}</h2>
                                        <p>{usuario?.email}</p>
                                        <Link to="/perfil" className="btn-azul-claro-ajustes">
                                            <span className="material-symbols-outlined">edit</span> Editar Perfil
                                        </Link>
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
                                        <span className="numero-tickets-ajustes">{ticketsDisponibles}</span>
                                        <div className="ticket-badge-ajustes">
                                            <span>TICKETS</span>
                                            <span>DISPONIBLES</span>
                                        </div>
                                        <span className="leyenda-tickets-ajustes">
                                            {ticketsDisponibles > 0 ? 'Úsalos para posponer una actividad' : 'No tienes más oportunidades'}
                                        </span>
                                    </div>
                                    <div className="bloque-desafio-ajustes">
                                        <label>Intercambia un ticket para posponer tu actividad actual:</label>
                                        <button className="btn-usar-ticket-ajustes" disabled={ticketsDisponibles === 0}>Usar Ticket</button>
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
                                        {TEMAS.map((tema) => (
                                            <button
                                                key={tema}
                                                type="button"
                                                className={`btn-color-ajustes ${tema} ${ajustes.theme === tema ? 'activo' : ''}`}
                                                onClick={() => actualizarAjuste({ theme: tema })}
                                                aria-label={`Tema ${tema}`}
                                            ></button>
                                        ))}
                                    </div>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">language</span>
                                        <span>Idioma</span>
                                    </div>
                                    <select
                                        className="control-seleccion-ajustes"
                                        value={ajustes.language}
                                        onChange={(e) => actualizarAjuste({ language: e.target.value })}
                                    >
                                        <option value="es-MX">Español (México)</option>
                                        <option value="en-US">English (US)</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <span>Zona Horaria</span>
                                    </div>
                                    <select
                                        className="control-seleccion-ajustes"
                                        value={ajustes.timezone}
                                        onChange={(e) => actualizarAjuste({ timezone: e.target.value })}
                                    >
                                        <option value="GMT-06:00">(GMT-06:00) CDMX</option>
                                        <option value="GMT-05:00">(GMT-05:00) Bogotá / Lima</option>
                                        <option value="GMT-08:00">(GMT-08:00) Tijuana</option>
                                    </select>
                                </div>

                                <div className="fila-preferencia-ajustes">
                                    <div className="etiqueta-icono-ajustes">
                                        <span className="material-symbols-outlined">hourglass_empty</span>
                                        <span>Formato de Hora</span>
                                    </div>
                                    <div className="conmutador-horas-ajustes">
                                        <button
                                            type="button"
                                            className={`btn-alternar-ajustes ${ajustes.hourFormat === 12 ? 'activo' : ''}`}
                                            onClick={() => actualizarAjuste({ hourFormat: 12 })}
                                        >12 horas</button>
                                        <button
                                            type="button"
                                            className={`btn-alternar-ajustes ${ajustes.hourFormat === 24 ? 'activo' : ''}`}
                                            onClick={() => actualizarAjuste({ hourFormat: 24 })}
                                        >24 horas</button>
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
                                        <input
                                            type="checkbox"
                                            checked={ajustes.notifyEmail}
                                            onChange={() => actualizarAjuste({ notifyEmail: !ajustes.notifyEmail })}
                                        />
                                        <span className="deslizador-ajustes"></span>
                                    </label>
                                </div>

                                <div className="fila-notificacion-ajustes">
                                    <div className="texto-notificacion-ajustes">
                                        <label>Notificaciones Push</label>
                                        <p>Alertas persistentes en tiempo real (Web Push).</p>
                                    </div>
                                    <label className="switch-control-ajustes">
                                        <input
                                            type="checkbox"
                                            checked={ajustes.notifyPersistent}
                                            onChange={() => actualizarAjuste({ notifyPersistent: !ajustes.notifyPersistent })}
                                        />
                                        <span className="deslizador-ajustes"></span>
                                    </label>
                                </div>

                                <div className="fila-notificacion-ajustes">
                                    <div className="texto-notificacion-ajustes">
                                        <label>Sonido</label>
                                        <p>Reproducir un sonido junto con las notificaciones.</p>
                                    </div>
                                    <label className="switch-control-ajustes">
                                        <input
                                            type="checkbox"
                                            checked={ajustes.notifySound}
                                            onChange={() => actualizarAjuste({ notifySound: !ajustes.notifySound })}
                                        />
                                        <span className="deslizador-ajustes"></span>
                                    </label>
                                </div>

                                <div className="fila-notificacion-ajustes">
                                    <div className="texto-notificacion-ajustes">
                                        <label>Alertas de desvío</label>
                                        <p>Avisarme si me estoy retrasando respecto al plan.</p>
                                    </div>
                                    <label className="switch-control-ajustes">
                                        <input
                                            type="checkbox"
                                            checked={ajustes.notifyDeviation}
                                            onChange={() => actualizarAjuste({ notifyDeviation: !ajustes.notifyDeviation })}
                                        />
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
