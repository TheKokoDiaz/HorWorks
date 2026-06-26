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
            <div className="bg-full-gray"> {/* Añadí un contenedor para tu fondo gris */}
                <div className="crear-equipo-wrapper">
                    <div className="header-close">
                        <a href="/equipos" className="close-btn">X</a>
                    </div>

                    <h1 className="page-title">Crear nuevo equipo</h1>

                    <form onSubmit={(e) => e.preventDefault()} className="form-layout">
                        
                        <div className="left-col">
                            <div className="image-box" id="image-preview-container" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Equipo" />
                                ) : (
                                    <span className="material-symbols-outlined icon-image">image</span>
                                )}
                            </div>
                            <label className="upload-link" onClick={() => fileInputRef.current.click()}>
                                Agregar foto al equipo
                            </label>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }}/>
                        </div>

                        <div className="right-col">
                            <div className="input-group">
                                <label>Nombre del equipo</label>
                                <input type="text" name="nombre_equipo" placeholder="Ej: Equipo 1" className="custom-input" required/>
                            </div>

                            <div className="input-group">
                                <label>Agregar integrantes</label>
                                <div className="add-member-row">
                                    <input 
                                        type="text" 
                                        id="member-input" 
                                        placeholder="Nombre de usuario o Correo electrónico" 
                                        className="custom-input"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <button type="button" className="btn-add-circle" id="btn-add-member" onClick={handleAddMember}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>

                            <div className="members-list" id="members-container">
                                {members.map((member, index) => (
                                    <div key={member.id} className="member-row">
                                        <span className="material-symbols-outlined icon-star">stars</span>
                                        <div className="member-data">
                                            <span className="m-role">Usuario {index + 1}</span>
                                            <span className="m-name">{member.name}</span>
                                        </div>
                                        {/* Aquí está el onClick corregido usando la función */}
                                        <button type="button" className="btn-remove" onClick={() => handleRemoveMember(member.id)}>
                                            <span className="material-symbols-outlined">arrow_right</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions-bottom">
                            <a href="/equipos" className="btn-cancelar">Cancelar</a>
                            <button type="submit" className="btn-crear">Crear</button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default CrearEquipo