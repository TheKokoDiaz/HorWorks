import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Reutilizamos las mismas hojas de estilo del login (misma tarjeta centrada,
// mismos inputs) para que no se sienta como una pantalla aparte.
import '../assets/css/login.css';

function Registro() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleRegistro = async (event) => {
        event.preventDefault();

        const form = event.target;
        const nombre = form.nombre.value.trim();
        const usuario = form.usuario.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmar = form.confirmar.value;

        if (password !== confirmar) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            // register() llama a /api/register y, si es exitoso, deja la
            // sesión iniciada de una vez (igual que login()).
            await register({ nombre, usuario, email, password });
            navigate('/home');
        } catch (err) {
            setError(err.message || 'No se pudo crear la cuenta.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <main className="login-card">
                <h1 className="login-title">Crea tu cuenta</h1>

                <form id="registroForm" autoComplete="on" onSubmit={handleRegistro}>
                    <div className="login-form-group">
                        <label htmlFor="nombre" className="login-form-label">Nombre completo</label>
                        <div className="login-input-wrapper">
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className="login-form-input"
                                required
                                maxLength={30}
                                placeholder="Tu nombre"
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="usuario" className="login-form-label">Nombre de usuario</label>
                        <div className="login-input-wrapper">
                            <input
                                type="text"
                                id="usuario"
                                name="usuario"
                                className="login-form-input"
                                required
                                maxLength={30}
                                pattern="[A-Za-z0-9_.]+"
                                title="Solo letras, números, punto y guion bajo"
                                placeholder="usuario123"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="email" className="login-form-label">Correo electrónico</label>
                        <div className="login-input-wrapper">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="login-form-input"
                                required
                                placeholder="tu@correo.com"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password" className="login-form-label">Contraseña</label>
                        <div className="login-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className="login-form-input login-form-input-password"
                                required
                                minLength={4}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    {showPassword ? (
                                        <>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </>
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="confirmar" className="login-form-label">Confirmar contraseña</label>
                        <div className="login-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmar"
                                name="confirmar"
                                className="login-form-input"
                                required
                                minLength={4}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {error && <p className="login-error" style={{ color: '#c0392b', marginTop: '-0.5rem', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="login-btn-submit" disabled={submitting}>
                        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="login-signup-container">
                    <a href="/login" className="login-signup-link">¿Ya tienes cuenta? Inicia sesión</a>
                </div>
            </main>
        </div>
    );
}

export default Registro;
