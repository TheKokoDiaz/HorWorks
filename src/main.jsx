// LIBRERÍAS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// HOJAS DE ESTILOS
import './assets/css/main.css'

// COMPONENTES
import Sidebar from './components/sidebar.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Sidebar />
    </StrictMode>,
)
