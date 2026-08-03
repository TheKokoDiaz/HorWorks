// LIBRERÍA PARA NAVEGACIÓN
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// HOJAS DE ESTILOS GENERAL
import './assets/css/main.css'

// PÁGINAS HTML
import Home from './pages/home'
import MisTareas from './pages/mis_tareas'
import Perfil from './pages/perfil'
import Roadmap from './pages/roadmap'
import Equipos from './pages/equipos'
import CrearEquipo from './pages/crear_equipo'
import Ajustes from './pages/ajustes'

import Welcome from './pages/welcome'
import Login from './pages/login'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Al abrir la app en la raíz (/), mandamos directo al Login */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                {/* 2. Pantalla principal del sistema después del Login */}
                <Route path="/home" element={<Home />} />

                {/* Páginas que requieren sesión */}
                <Route path="/tareas" element={<MisTareas />} />
                <Route path="/calendario" element={<Roadmap />} />
                <Route path="/equipos" element={<Equipos />} />
                <Route path="/crear_equipo" element={<CrearEquipo />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/ajustes" element={<Ajustes />} />

                {/* Páginas para invitados */}
                <Route path="/bienvenida" element={<Welcome />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;