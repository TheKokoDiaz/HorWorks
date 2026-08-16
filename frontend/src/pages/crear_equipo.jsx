// LIBRERÍAS
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// HOJAS DE ESTILOS
import '../assets/css/crear_equipo.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// CLIENTE HTTP
import { authFetchJson } from '../api/client';

function CrearEquipo() {
    const navigate = useNavigate();

    // --- ESTADOS DEL FORMULARIO ---
    const [fotoUrl, setFotoUrl] = useState('');
    const [imagenInvalida, setImagenInvalida] = useState(false);
    const [nombreEquipo, setNombreEquipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [organizacion, setOrganizacion] = useState('');
    const [members, setMembers] = useState([]); // { id, value } — se invitan tras crear el equipo
    const [inputValue, setInputValue] = useState('');

    // --- ESTADOS DE ENVÍO ---
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [avisosInvitacion, setAvisosInvitacion] = useState([]); // invitaciones que fallaron

    // --- LÓGICA DE IMAGEN ---
    // Nota: HOR_Equipo.EQU_Foto es un VARCHAR(255) en la base de datos, así que
    // -igual que la foto de perfil en perfil.jsx- se guarda como URL de una
    // imagen ya alojada en algún lado (no como archivo subido / data-URL: un
    // data-URL de imagen real nunca cabe en 255 caracteres, por eso antes la
    // "vista previa" nunca se guardaba de verdad).
    const handleImageUrlChange = (e) => {
        setFotoUrl(e.target.value);
        setImagenInvalida(false);
    };

    // --- LÓGICA DE INTEGRANTES ---
    const handleAddMember = () => {
        const valor = inputValue.trim();
        if (!valor) return;
        if (members.some((m) => m.value.toLowerCase() === valor.toLowerCase())) {
            setInputValue('');
            return;
        }
        setMembers([...members, { id: Date.now(), value: valor }]);
        setInputValue('');
    };

    const handleRemoveMember = (id) => {
        setMembers(members.filter((member) => member.id !== id));
    };

    // --- ENVÍO DEL FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;

        const nombre = nombreEquipo.trim();
        if (!nombre) {
            setError('El nombre del equipo es obligatorio.');
            return;
        }

        setEnviando(true);
        setError(null);
        setAvisosInvitacion([]);

        try {
            const equipo = await authFetchJson('/proyectos/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nombre,
                    description: descripcion.trim() || undefined,
                    organization: organizacion.trim() || undefined,
                    photo: fotoUrl.trim() || undefined
                })
            });

            if (!equipo || equipo.error) {
                setError(equipo?.error || 'No se pudo crear el equipo.');
                setEnviando(false);
                return;
            }

            // Invitar a cada integrante agregado (uno por uno, ya que el
            // backend solo acepta invitaciones individuales por username/correo).
            const fallos = [];
            for (const member of members) {
                const resultado = await authFetchJson(`/proyectos/${equipo.id}/invitar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador: member.value })
                });
                if (!resultado || resultado.error) {
                    fallos.push(`${member.value}: ${resultado?.error || 'no se pudo invitar'}`);
                }
            }

            if (fallos.length > 0) {
                setAvisosInvitacion(fallos);
                setEnviando(false);
            } else {
                navigate('/equipos');
            }
        } catch (err) {
            console.error('Error al crear el equipo:', err);
            setError('Ocurrió un error al crear el equipo. Intenta de nuevo.');
            setEnviando(false);
        }
    };

    return (
        <SidebarLayout>
            <div className="crear-equipo-bg-full-gray">
                <div className="crear-equipo-wrapper">
                    <div className="crear-equipo-header-close">
                        <Link to="/equipos" className="crear-equipo-close-btn">X</Link>
                    </div>

                    <h1 className="crear-equipo-page-title">Crear nuevo equipo</h1>

                    <form onSubmit={handleSubmit} className="crear-equipo-form-layout">

                        <div className="crear-equipo-left-col">
                            <div className="crear-equipo-image-box" id="image-preview-container">
                                {fotoUrl && !imagenInvalida ? (
                                    <img
                                        src={fotoUrl}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt="Equipo"
                                        onError={() => setImagenInvalida(true)}
                                    />
                                ) : (
                                    <span className="material-symbols-outlined crear-equipo-icon-image">image</span>
                                )}
                            </div>
                            <div className="crear-equipo-input-group">
                                <label>URL de la foto del equipo (opcional)</label>
                                <input
                                    type="url"
                                    placeholder="https://…"
                                    className="crear-equipo-custom-input"
                                    value={fotoUrl}
                                    onChange={handleImageUrlChange}
                                />
                                {imagenInvalida && <p className="crear-equipo-error">No se pudo cargar esa imagen; revisa el link.</p>}
                            </div>
                        </div>

                        <div className="crear-equipo-right-col">
                            <div className="crear-equipo-input-group">
                                <label>Nombre del equipo</label>
                                <input
                                    type="text"
                                    name="nombre_equipo"
                                    placeholder="Ej: Equipo 1"
                                    className="crear-equipo-custom-input"
                                    value={nombreEquipo}
                                    onChange={(e) => setNombreEquipo(e.target.value)}
                                    maxLength={40}
                                    required
                                />
                            </div>

                            <div className="crear-equipo-input-group">
                                <label>Organización (opcional)</label>
                                <input
                                    type="text"
                                    name="organizacion_equipo"
                                    placeholder="Ej: Facultad de Ingeniería"
                                    className="crear-equipo-custom-input"
                                    value={organizacion}
                                    onChange={(e) => setOrganizacion(e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            <div className="crear-equipo-input-group">
                                <label>Descripción (opcional)</label>
                                <textarea
                                    name="descripcion_equipo"
                                    placeholder="¿De qué trata este equipo?"
                                    className="crear-equipo-custom-input crear-equipo-textarea"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    maxLength={255}
                                />
                            </div>

                            <div className="crear-equipo-input-group">
                                <label>Agregar integrantes</label>
                                <div className="crear-equipo-add-member-row">
                                    <input
                                        type="text"
                                        id="member-input"
                                        placeholder="Nombre de usuario o Correo electrónico"
                                        className="crear-equipo-custom-input"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMember();
                                            }
                                        }}
                                    />
                                    <button type="button" className="crear-equipo-btn-add-circle" id="btn-add-member" onClick={handleAddMember}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                <p className="crear-equipo-hint">
                                    Se les enviará una invitación exacta por username o correo; deben tener cuenta en HorWorks.
                                </p>
                            </div>

                            {members.length > 0 && (
                                <div className="crear-equipo-members-list" id="members-container">
                                    {members.map((member, index) => (
                                        <div key={member.id} className="crear-equipo-member-row">
                                            <span className="material-symbols-outlined crear-equipo-icon-star">stars</span>
                                            <div className="crear-equipo-member-data">
                                                <span className="crear-equipo-m-role">Invitación {index + 1}</span>
                                                <span className="crear-equipo-m-name">{member.value}</span>
                                            </div>
                                            <button type="button" className="crear-equipo-btn-remove" onClick={() => handleRemoveMember(member.id)}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="crear-equipo-error">{error}</p>}

                            {avisosInvitacion.length > 0 && (
                                <div className="crear-equipo-avisos">
                                    <p>El equipo se creó, pero algunas invitaciones fallaron:</p>
                                    <ul>
                                        {avisosInvitacion.map((texto, i) => <li key={i}>{texto}</li>)}
                                    </ul>
                                    <button type="button" className="crear-equipo-btn-crear" onClick={() => navigate('/equipos')}>
                                        Ir a Equipos
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="crear-equipo-form-actions-bottom">
                            <Link to="/equipos" className="crear-equipo-btn-cancelar">Cancelar</Link>
                            <button type="submit" className="crear-equipo-btn-crear" disabled={enviando}>
                                {enviando ? 'Creando…' : 'Crear'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default CrearEquipo;
