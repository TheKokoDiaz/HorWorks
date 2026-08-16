// src/context/AjustesContext.jsx
//
// Antes, ajustes.jsx cargaba las preferencias solo para pintarlas en su propia
// pantalla: el "tema" nunca se aplicaba a ningún lado más, así que elegir un
// color en Ajustes no cambiaba nada en el resto de la app.
//
// Este contexto:
//   1. Carga /api/ajustes/ UNA vez que hay sesión iniciada.
//   2. Pone el tema elegido como atributo data-theme en <html>, para que las
//      variables CSS definidas en main.css/sidebar.css (--sidebar-bg,
//      --bg-primary, --link-color, --btn-bg...) cambien de valor al vuelo.
//   3. Expone `ajustes` + `actualizarAjustes` para que ajustes.jsx (y quien
//      más lo necesite) lea/escriba sin duplicar el fetch.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authFetchJson } from '../api/client';
import { useAuth } from './AuthContext';

const AjustesContext = createContext(null);

export function AjustesProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [ajustes, setAjustes] = useState(null);
    const [loading, setLoading] = useState(true);

    const cargarAjustes = useCallback(() => {
        setLoading(true);
        return authFetchJson('/ajustes/')
            .then((data) => { if (data && !data.error) setAjustes(data); })
            .catch((err) => console.error('Error al cargar ajustes:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            cargarAjustes();
        } else {
            setAjustes(null);
            setLoading(false);
        }
    }, [isAuthenticated, cargarAjustes]);

    // Aplica el tema al documento completo cada vez que cambia.
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', ajustes?.theme || 'azul');
    }, [ajustes?.theme]);

    const actualizarAjustes = useCallback((cambios) => {
        setAjustes((prev) => (prev ? { ...prev, ...cambios } : prev));
        return authFetchJson('/ajustes/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cambios)
        }).then((data) => {
            if (data && !data.error) setAjustes(data);
            return data;
        });
    }, []);

    return (
        <AjustesContext.Provider value={{ ajustes, loading, actualizarAjustes }}>
            {children}
        </AjustesContext.Provider>
    );
}

export function useAjustes() {
    const ctx = useContext(AjustesContext);
    if (!ctx) throw new Error('useAjustes debe usarse dentro de <AjustesProvider>');
    return ctx;
}
