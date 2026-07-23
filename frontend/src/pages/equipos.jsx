// LIBRERÍAS
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/equipos.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function Equipos(){
    return(
        <SidebarLayout>
            <main className="eqp-main-content eqp-equipos-layout">
                <div className="eqp-equipos-container">
                    <h1>Equipos</h1>

                    <div className="eqp-equipos-grid">
                        <div className="eqp-equipo-card">
                            <img src="https://ui-avatars.com/api/?name=Hor+Hor+Industries&background=random&size=200" alt="Hor Hor Industries" className="eqp-equipo-img" />
                            <div className="eqp-equipo-info">
                                <h4>Hor Hor Industries</h4>
                                <p>Peter's Team</p>
                            </div>
                        </div>

                        <div className="eqp-equipo-card">
                            <img src="https://ui-avatars.com/api/?name=Gestion+Desarrollo&background=random&size=200" alt="Gestión Desarrollo" className="eqp-equipo-img" />
                            <div className="eqp-equipo-info">
                                <h4>Gestión Desarr...</h4>
                                <p>César Iván's Team</p>
                            </div>
                        </div>

                        <div className="eqp-equipo-card">
                            <img src="https://ui-avatars.com/api/?name=Base+de+Datos&background=random&size=200" alt="Base de Datos" className="eqp-equipo-img" />
                            <div className="eqp-equipo-info">
                                <h4>Base de Datos</h4>
                                <p>Bryan Alexis's Team</p>
                            </div>
                        </div>

                        <div className="eqp-equipo-card">
                            <img src="https://ui-avatars.com/api/?name=Paginas+Web&background=random&size=200" alt="Páginas Web" className="eqp-equipo-img" />
                            <div className="eqp-equipo-info">
                                <h4>Páginas Web</h4>
                                <p>Jimena's Team</p>
                            </div>
                        </div>
                        
                        <div className="eqp-equipo-card">
                            <img src="https://ui-avatars.com/api/?name=Animaciones&background=random&size=200" alt="Animaciones" className="eqp-equipo-img" />
                            <div className="eqp-equipo-info">
                                <h4>Animaciones</h4>
                                <p>Julio Alfredo's Team</p>
                            </div>
                        </div>

                        <Link to="/crear_equipo" className="eqp-equipo-card eqp-create-card">
                            <div className="eqp-create-icon">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <div className="eqp-equipo-info">
                                <h4>Nuevo Equipo</h4>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </SidebarLayout>
    );
}

export default Equipos