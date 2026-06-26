// LIBRERÍAS
import { useState, useRef } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/crear_equipo.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

function CrearEquipo() {
    // --- ESTADOS ---
    const [imagePreview, setImagePreview] = useState(null);
    const [members, setMembers] = useState([{ id: 1, name: 'Nombre del Usuario' }]);
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef(null);

    // --- LÓGICA DE IMAGEN ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    // --- LÓGICA DE INTEGRANTES ---
    const handleAddMember = () => {
        if (inputValue.trim() !== '') {
            setMembers([...members, { id: Date.now(), name: inputValue }]);
            setInputValue('');
        }
    };

    const handleRemoveMember = (id) => {
        setMembers(members.filter(member => member.id !== id));
    };

    return (
        <SidebarLayout>
            <div className="crear-equipo-bg-full-gray"> {/* Añadí un contenedor para tu fondo gris */}
                <div className="crear-equipo-wrapper">
                    <div className="crear-equipo-header-close">
                        <a href="/equipos" className="crear-equipo-close-btn">X</a>
                    </div>

                    <h1 className="crear-equipo-page-title">Crear nuevo equipo</h1>

                    <form onSubmit={(e) => e.preventDefault()} className="crear-equipo-form-layout">
                        
                        <div className="crear-equipo-left-col">
                            <div className="crear-equipo-image-box" id="image-preview-container" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Equipo" />
                                ) : (
                                    <span className="crear-equipo-icon-image">image</span>
                                )}
                            </div>
                            <label className="crear-equipo-upload-link" onClick={() => fileInputRef.current.click()}>
                                Agregar foto al equipo
                            </label>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }}/>
                        </div>

                        <div className="crear-equipo-right-col">
                            <div className="crear-equipo-input-group">
                                <label>Nombre del equipo</label>
                                <input type="text" name="nombre_equipo" placeholder="Ej: Equipo 1" className="crear-equipo-custom-input" required/>
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
                                    />
                                    <button type="button" className="crear-equipo-btn-add-circle" id="btn-add-member" onClick={handleAddMember}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>

                            <div className="crear-equipo-members-list" id="members-container">
                                {members.map((member, index) => (
                                    <div key={member.id} className="crear-equipo-member-row">
                                        <span className="material-symbols-outlined crear-equipo-icon-star">stars</span>
                                        <div className="crear-equipo-member-data">
                                            <span className="crear-equipo-m-role">Usuario {index + 1}</span>
                                            <span className="crear-equipo-m-name">{member.name}</span>
                                        </div>
                                        {/* Aquí está el onClick corregido usando la función */}
                                        <button type="button" className="crear-equipo-btn-remove" onClick={() => handleRemoveMember(member.id)}>
                                            <span className="material-symbols-outlined">arrow_right</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions-bottom">
                            <a href="/equipos" className="crear-equipo-btn-cancelar">Cancelar</a>
                            <button type="submit" className="crear-equipo-btn-crear">Crear</button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default CrearEquipo