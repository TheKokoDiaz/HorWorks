// LIBRERÍAS
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/sidebar.css'

// SESIÓN
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    // JS
    const [collapsed, setCollapsed] = useState(true);
    const location = useLocation();
    const { usuario, logout } = useAuth();

    const nombreUsuario = usuario?.nombre || usuario?.email || 'Usuario';
    const avatarUrl = usuario?.foto
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=fca5a5&color=fff`;

    const handleLogout = (event) => {
        event.preventDefault();
        logout();
    };

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
                        <Link to="/home" className={location.pathname === '/home' ? "active" : ""}>
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-link">Inicio</span>
                        </Link>
                        <Link to="/tareas" className={location.pathname === '/tareas' ? "active" : ""}>
                            <span className="material-symbols-outlined">folder</span>
                            <span className="text-link">Mis Tareas</span>
                        </Link>
                        <Link to="/calendario" className={location.pathname === '/calendario' ? "active" : ""}>
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-link">Calendario</span>
                        </Link>
                        {/* <Link to="/estadisticas">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="text-link">Estadísticas</span>
                        </Link> */}
                        <Link to="/equipos" className={location.pathname === '/equipos' ? "active" : ""}>
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-link">Equipos</span>
                        </Link>
                        <Link to="/perfil" className={location.pathname === '/perfil' ? "active" : ""}>
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-link">Perfil</span>
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <Link to="/perfil" className="user-profile">
                        <img
                            src={avatarUrl}
                            alt={nombreUsuario}
                            onError={(e) => {
                                // Si la foto guardada en BD (ej. dicebear.com) no
                                // responde, caemos a ui-avatars como respaldo.
                                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=fca5a5&color=fff`;
                                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                            }}
                        />
                        <span className="text-link">{nombreUsuario}</span>
                    </Link>
                    <Link to="/ajustes" className="settings-btn">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                    <a href="/login" className="settings-btn" onClick={handleLogout} title="Cerrar sesión">
                        <span className="material-symbols-outlined">logout</span>
                    </a>
                </div>
            </aside>
        </>
    )
}

export default Sidebar