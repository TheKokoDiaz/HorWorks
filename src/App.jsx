// LIBRERÍA PARA NAVEGACIÓN
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// HOJAS DE ESTILOS GENERAL
import './assets/css/main.css'

// PÁGINAS HTML
import Home from './pages/home'
import Perfil from './pages/perfil'
import CrearEquipo from './pages/crear_equipo'
import Welcome from './pages/welcome'

import Login from './pages/login'

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;