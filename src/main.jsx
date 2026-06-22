// LIBRERÍAS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// HOJAS DE ESTILOS
import './assets/css/main.css'

// PÁGINAS HTML
import Home from './pages/home.jsx'

// COMPONENTES
import Sidebar from './components/sidebar.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Sidebar />
        <Home />
    </StrictMode>,
)