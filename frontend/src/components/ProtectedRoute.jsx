// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    // Mientras se valida el token contra /api/me no sabemos aún si hay
    // sesión o no; evita un flash hacia /login en cada F5.
    if (loading) return null;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}

export default ProtectedRoute;
