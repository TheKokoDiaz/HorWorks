// LIBRERÍAS
import { useState } from 'react'
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/sidebar.css'

function Sidebar() {
    // JS
    const [collapsed, setCollapsed] = useState(true);

    const toggleSidebar = () => {
        setCollapsed(prev => !prev);
    };

    // Elementos HTML
    return (
        <>
            {/* Barra lateral */}
            <aside id="main-sidebar" className={collapsed ? "sidebar collapsed" : "sidebar"}>
                <div className="sidebar-top">
                    {/* Desplegar barra */}
                    <div className="menu-icon" id="menu-toggle" onClick={toggleSidebar}>
                        <span className="material-symbols-outlined">menu</span>
                    </div>

                    {/* Enlaces directos */}
                    <nav className="nav-links">
                        {/* Eliminé los enlaces temporalmente en lo que vemos como funciona la navegación aquí */}
                        <Link to="/" className="active">
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-link">Inicio</span>
                        </Link>
                        <Link to="">
                            <span className="material-symbols-outlined">folder</span>
                            <span className="text-link">Mis Tareas</span>
                        </Link>
                        <Link to="/calendario">
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-link">Calendario</span>
                        </Link>
                        {/* <Link to="">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="text-link">Estadísticas</span>
                        </Link> */}
                        <Link to="/equipos">
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-link">Equipos</span>
                        </Link>        
                        <Link to="/perfil">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-link">Perfil</span>
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <Link to="/perfil" className="user-profile">
                        <img src="https://ui-avatars.com/api/?name=Auditor&background=fca5a5&color=fff" alt="Usuario" />
                        <span className="text-link">Usuario</span>
                    </Link>
                    <Link to="/ajustes" className="settings-btn">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

export default Sidebar