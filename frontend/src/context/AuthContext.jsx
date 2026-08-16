// src/context/AuthContext.jsx
//
// Fuente única de verdad sobre "quién es el usuario logueado" para toda la
// app. Antes no existía nada así: cada página que necesitaba mostrar datos
// del usuario los tenía quemados (nombres/avatares de ejemplo).

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { API_BASE, authFetchJson, getAccessToken, getStoredUser, login as apiLogin, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => getStoredUser());
    // "loading" solo cubre la validación inicial del token contra /api/me,
    // para no parpadear a /login antes de confirmar si la sesión sigue viva.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelado = false;

        async function validarSesion() {
            if (!getAccessToken()) {
                setLoading(false);
                return;
            }
            const data = await authFetchJson('/me');
            if (cancelado) return;
            if (data && !data.error) {
                setUsuario(data);
            } else {
                setUsuario(null);
            }
            setLoading(false);
        }

        validarSesion();
        return () => { cancelado = true; };
    }, []);

    const login = useCallback(async (email, password) => {
        const usuarioLogueado = await apiLogin(email, password);
        setUsuario(usuarioLogueado);
        return usuarioLogueado;
    }, []);

    const logout = useCallback(() => {
        setUsuario(null);
        apiLogout(); // limpia localStorage y redirige a /login
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, loading, isAuthenticated: !!usuario, login, logout, API_BASE }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
