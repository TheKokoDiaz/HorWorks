// src/api/client.js
//
// Punto único para hablar con el backend Flask. Antes, cada página hacía
// fetch() directo y el access_token que regresa /api/login se tiraba a la
// basura (nunca se guardaba en ningún lado) => todas las rutas protegidas
// con @jwt_required() regresaban 401, aunque el login hubiera sido exitoso.
//
// Este módulo:
//   1. Guarda access_token / refresh_token / usuario en localStorage al
//      hacer login, para que la sesión sobreviva un F5.
//   2. Expone `authFetch`, que agrega automáticamente el header
//      "Authorization: Bearer <access_token>" a cada request.
//   3. Si el backend responde 401 por token expirado, intenta refrescarlo
//      una vez contra /api/refresh y reintenta la petición original antes
//      de rendirse.

export const API_BASE = 'http://localhost:5000/api';

const ACCESS_KEY = 'hw_access_token';
const REFRESH_KEY = 'hw_refresh_token';
const USER_KEY = 'hw_user';

// ---------- Almacenamiento local de la sesión ----------
export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setSession({ access_token, refresh_token, usuario }) {
    if (access_token) localStorage.setItem(ACCESS_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
    if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
}

// ---------- Login / Logout ----------
export async function login(email, password) {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
    }

    setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        usuario: data.usuario
    });

    return data.usuario;
}

export async function register({ nombre, usuario, email, password }) {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, usuario, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear la cuenta');
    }

    // Igual que login(): deja la sesión iniciada de una vez, para no
    // obligar a la persona a volver a escribir sus credenciales.
    setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        usuario: data.usuario
    });

    return data.usuario;
}

export function logout() {
    clearSession();
    window.location.href = '/login';
}

// ---------- Refresh ----------
let refreshPromise = null;

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    // Si ya hay un refresh en curso, reutilizamos la misma promesa en vez de
    // disparar varias peticiones de refresh en paralelo (puede pasar cuando
    // varias llamadas fallan con 401 casi al mismo tiempo).
    if (!refreshPromise) {
        refreshPromise = fetch(`${API_BASE}/refresh`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${refreshToken}` }
        })
            .then(async (res) => {
                if (!res.ok) return null;
                const data = await res.json();
                setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
                return data.access_token;
            })
            .catch(() => null)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

// ---------- Fetch autenticado ----------
/**
 * Igual que fetch(), pero:
 *  - antepone API_BASE si `path` empieza con "/"
 *  - agrega el Authorization header con el access_token guardado
 *  - si el backend responde 401, intenta refrescar el token UNA vez y
 *    reintenta la petición original
 *  - si sigue sin poder (refresh_token también vencido), limpia la sesión
 *    y manda al usuario de vuelta a /login
 */
export async function authFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const doFetch = (token) => {
        const headers = { ...(options.headers || {}) };
        if (token) headers.Authorization = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    };

    let response = await doFetch(getAccessToken());

    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await doFetch(newToken);
        } else {
            clearSession();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
    }

    return response;
}

/** Igual que authFetch pero ya regresa el JSON parseado (o null en 204/errores de red). */
export async function authFetchJson(path, options = {}) {
    const res = await authFetch(path, options);
    if (res.status === 204) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}
