// LIBRERÍAS
import { useState } from 'react'
import { Link } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/sidebar.css'

function Sidebar() {
    // JS
    const [collapsed, setCollapsed] = useState(false);

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
                        <a href="" className="active">
                            <span className="material-symbols-outlined">home</span>
                            <span className="text-link">Inicio</span>
                        </a>
                        <a href="">
                            <span className="material-symbols-outlined">folder</span>
                            <span className="text-link">Mis Tareas</span>
                        </a>
                        <a href="">
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-link">Calendario</span>
                        </a>
                        <a href="">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="text-link">Estadísticas</span>
                        </a>
                        <a href="">
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-link">Equipos</span>
                        </a>        
                        <a href="">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-link">Perfil</span>
                        </a>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-profile">
                        <img src="https://ui-avatars.com/api/?name=Auditor&background=fca5a5&color=fff" alt="Usuario" />
                        <span className="text-link">Usuario</span>
                    </div>
                    <a href="/ajustes" className="settings-btn"><span className="material-symbols-outlined">settings</span></a>
                </div>
            </aside>
        </>
    )
}

export default Sidebar