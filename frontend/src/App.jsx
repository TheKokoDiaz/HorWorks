// LIBRERÍA PARA NAVEGACIÓN
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// HOJAS DE ESTILOS GENERAL
import './assets/css/main.css'

// SESIÓN
import { AuthProvider } from './context/AuthContext'
import { AjustesProvider } from './context/AjustesContext'
import ProtectedRoute from './components/ProtectedRoute'

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
import Registro from './pages/registro'
import InvitacionAuditor from './pages/invitacion_auditor'

function App() {
    return (
        <AuthProvider>
            <AjustesProvider>
            <BrowserRouter>
                <Routes>
                    {/* 1. Al abrir la app en la raíz (/), mandamos directo al Login */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Pública a propósito: quien la recibe puede no tener cuenta todavía */}
                    <Route path="/invitacion-auditor/:token" element={<InvitacionAuditor />} />

                    {/* Páginas que requieren sesión */}
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/tareas" element={<ProtectedRoute><MisTareas /></ProtectedRoute>} />
                    <Route path="/calendario" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
                    <Route path="/equipos" element={<ProtectedRoute><Equipos /></ProtectedRoute>} />
                    <Route path="/crear_equipo" element={<ProtectedRoute><CrearEquipo /></ProtectedRoute>} />
                    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                    <Route path="/ajustes" element={<ProtectedRoute><Ajustes /></ProtectedRoute>} />

                    {/* Páginas para invitados */}
                    <Route path="/bienvenida" element={<Welcome />} />
                </Routes>
            </BrowserRouter>
            </AjustesProvider>
        </AuthProvider>
    )
}

export default App;
