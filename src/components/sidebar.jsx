// LIBRERÍA
import { useState } from 'react'

// HOJAS DE ESTILOS
import '../assets/css/sidebar.css'

// IMAGENES
// import reactLogo from './assets/react.svg'

function Sidebar() {
    // JS
    // Lo que antes iba en un archivo de JS, ahora se inserta aquí
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(prev => !prev);
    };

    // Elementos HTML
    return (
        <>
            {/* Barra lateral */}
            <aside id="main-sidebar" class={collapsed ? "sidebar collapsed" : "sidebar"}>
                <div class="sidebar-top">
                    {/* Desplegar barra */}
                    <div class="menu-icon" id="menu-toggle" onClick={toggleSidebar}>
                        <span class="material-symbols-outlined">menu</span>
                    </div>

                    {/* Enlaces directos */}
                    <nav class="nav-links">
                        {/* Eliminé los enlaces temporalmente en lo que vemos como funciona la navegación aquí */}
                        <a href="" class="active">
                            <span class="material-symbols-outlined">home</span>
                            <span class="text-link">Inicio</span>
                        </a>
                        <a href="">
                            <span class="material-symbols-outlined">folder</span>
                            <span class="text-link">Mis Tareas</span>
                        </a>
                        <a href="">
                            <span class="material-symbols-outlined">calendar_today</span>
                            <span class="text-link">Calendario</span>
                        </a>
                        <a href="">
                            <span class="material-symbols-outlined">bar_chart</span>
                            <span class="text-link">Estadísticas</span>
                        </a>
                        <a href="">
                            <span class="material-symbols-outlined">group</span>
                            <span class="text-link">Equipos</span>
                        </a>        
                        <a href="">
                            <span class="material-symbols-outlined">person</span>
                            <span class="text-link">Perfil</span>
                        </a>
                    </nav>
                </div>

                <div class="sidebar-bottom">
                    <div class="user-profile">
                        <img src="https://ui-avatars.com/api/?name=Auditor&background=fca5a5&color=fff" alt="Usuario" />
                        <span class="text-link">Usuario</span>
                    </div>
                    <a href="/ajustes" class="settings-btn"><span class="material-symbols-outlined">settings</span></a>
                </div>
            </aside>
        </>
    )
}

export default Sidebar