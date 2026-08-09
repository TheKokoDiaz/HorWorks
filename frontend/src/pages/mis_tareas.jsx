// LIBRERÍAS
import { useState, useEffect } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/mis_tareas.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// CATÁLOGO DE 12 ÍCONOS MATERIAL SYMBOLS
const TASK_ICONS = [
    { id: 'folder', name: 'Carpeta / General' },
    { id: 'menu_book', name: 'Estudio / Lectura' },
    { id: 'code', name: 'Programación' },
    { id: 'design_services', name: 'Diseño UI/UX' },
    { id: 'bug_report', name: 'Corrección de Bugs' },
    { id: 'terminal', name: 'Consola / Servidores' },
    { id: 'dataset', name: 'Base de Datos' },
    { id: 'science', name: 'Investigación' },
    { id: 'event', name: 'Reunión / Evento' },
    { id: 'school', name: 'Académico / Escuela' },
    { id: 'work', name: 'Trabajo / Proyecto' },
    { id: 'build', name: 'Mantenimiento / Config' }
];

function MisTareas() {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // Estados para Modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);  
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

    // Formulario de edición (incluye icon)
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        priority: 'Media',
        estimatedTime: '',
        deadlineDate: '',
        deadlineTime: '',
        icon: 'folder'
    });

    // Formulario de posponer
    const [postponeOption, setPostponeOption] = useState('30 min');

    // Formulario de nueva tarea (incluye icon)
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Alta',
        estimatedTime: '1 h 00 min',
        deadlineDate: '',
        deadlineTime: '',
        icon: 'folder'
    });

    // Cargar tareas al iniciar
    useEffect(() => {
        fetch('http://localhost:5000/api/tareas/')
            .then(response => response.json())
            .then(data => {
                setTasks(data);
                if (data.length > 0) {
                    setSelectedTaskId(data[0].id);
                }
            })
            .catch(error => console.error("Error al cargar las tareas:", error));
    }, []);

    const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

    // Alternar Bookmark en Backend y Frontend
    const toggleBookmark = async (id) => {
        const targetTask = tasks.find(t => t.id === id);
        if (!targetTask) return;

        const nuevoEstado = !targetTask.bookmarked;

        // Actualización inmediata visual
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, bookmarked: nuevoEstado } : task
        ));

        // Persistencia en BD
        try {
            await fetch(`http://localhost:5000/api/tareas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookmarked: nuevoEstado })
            });
        } catch (err) {
            console.error("Error al guardar marcador en BD:", err);
        }
    };

    // Subir evidencia
    const handleEvidenceUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeTask) return;

        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence: file.name })
            });

            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(task =>
                    task.id === activeTask.id ? tareaActualizada : task
                ));
            }
        } catch (err) {
            console.error("Error al guardar la evidencia:", err);
        }
    };

    // Eliminar evidencia
    const handleRemoveEvidence = async () => {
        if (!activeTask) return;
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence: null })
            });

            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(task =>
                    task.id === activeTask.id ? tareaActualizada : task
                ));
            }
        } catch (err) {
            console.error("Error al eliminar evidencia:", err);
        }
    };

    // Abrir Modal de Edición
    const openEditModal = () => {
        if (!activeTask || activeTask.completed) return;
        setEditForm({
            title: activeTask.title || '',
            description: activeTask.description || '',
            priority: activeTask.priority || 'Media',
            estimatedTime: activeTask.estimatedTime || '',
            deadlineDate: activeTask.deadlineDate || '',
            deadlineTime: activeTask.deadlineTime || '',
            icon: activeTask.icon || 'folder'
        });
        setIsEditModalOpen(true);
    };

    // Guardar Edición en la Base de Datos (PUT)
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${selectedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(task =>
                    task.id === selectedTaskId ? tareaActualizada : task
                ));
                setIsEditModalOpen(false);
            }
        } catch (err) {
            console.error("Error al editar tarea:", err);
        }
    };

    // Guardar Posponer
    const handleSavePostpone = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${selectedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: `Pospuesta +${postponeOption}` })
            });

            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(task =>
                    task.id === selectedTaskId ? tareaActualizada : task
                ));
                setIsPostponeModalOpen(false);
            }
        } catch (err) {
            console.error("Error al posponer tarea:", err);
        }
    };

    // Confirmar Eliminar
    const handleDeleteTask = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${selectedTaskId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const remaining = tasks.filter(t => t.id !== selectedTaskId);
                setTasks(remaining);
                setIsDeleteModalOpen(false);
                setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error("Error al eliminar tarea:", err);
        }
    };

    // Crear Nueva Tarea
    const handleCreateNewTask = (e) => {
        e.preventDefault();
        
        const tareaData = {
            title: newTaskForm.title,
            description: newTaskForm.description,
            priority: newTaskForm.priority,
            estimatedTime: newTaskForm.estimatedTime,
            deadlineDate: newTaskForm.deadlineDate,
            deadlineTime: newTaskForm.deadlineTime,
            icon: newTaskForm.icon,
            status: 'Pendiente'
        };

        fetch('http://localhost:5000/api/tareas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tareaData)
        })
        .then(response => response.json())
        .then(nuevaTarea => {
            setTasks([nuevaTarea, ...tasks]);
            setSelectedTaskId(nuevaTarea.id);
            setIsNewTaskModalOpen(false);
            
            setNewTaskForm({
                title: '',
                description: '',
                priority: 'Alta',
                estimatedTime: '1 h 00 min',
                deadlineDate: '',
                deadlineTime: '',
                icon: 'folder'
            });
        })
        .catch(error => console.error("Error al crear la tarea:", error));
    };

    // Auxiliar para asignar color de clase CSS según prioridad
    const getPriorityClass = (task) => {
        if (task.completed) return 'completada';
        const p = (task.priority || '').toLowerCase();
        if (p === 'alta') return 'prioridad-alta';
        if (p === 'baja') return 'prioridad-baja';
        return 'prioridad-media';
    };

    return (
        <SidebarLayout>
            <main className="tareas-main-layout">
                {/* COLUMNA IZQUIERDA: LISTA DE TAREAS */}
                <aside className="tareas-list-column">
                    <div className="tareas-list-header">
                        <h2>Tareas por hacer</h2>
                        <button
                            className="btn-add-task-icon"
                            title="Agregar nueva tarea"
                            onClick={() => setIsNewTaskModalOpen(true)}
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    <div className="tareas-cards-container">
                        {tasks.map((task) => {
                            const isSelected = task.id === selectedTaskId;
                            const priorityClass = getPriorityClass(task);

                            let cardClassName = `task-item-card ${priorityClass}`;
                            if (isSelected) cardClassName += ' selected';

                            return (
                                <div
                                    key={task.id}
                                    className={cardClassName}
                                    onClick={() => setSelectedTaskId(task.id)}
                                >
                                    <div className="task-item-left">
                                        <div className="task-item-avatar">
                                            <span className="material-symbols-outlined">{task.icon || 'folder'}</span>
                                        </div>
                                        <div className="task-item-info">
                                            <h4 className="task-item-title">{task.title}</h4>
                                            <p className="task-item-sub">{task.description ? task.description.substring(0, 35) + '...' : ''}</p>
                                        </div>
                                    </div>

                                    <div className="task-item-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {/* ÍCONO NEGRO DE MARCADOR SI ES IMPORTANTE */}
                                        {task.bookmarked && (
                                            <span 
                                                className="material-symbols-outlined" 
                                                style={{ color: '#000000', fontSize: '20px' }} 
                                                title="Tarea importante"
                                            >
                                                bookmark
                                            </span>
                                        )}
                                        <span className="task-time-badge">{task.estimatedTime || 'Sin tiempo'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* COLUMNA DERECHA: DETALLE DE TAREA */}
                <section className="tarea-detail-column">
                    {activeTask ? (
                        <div className="tarea-detail-card">
                            {/* ENCABEZADO */}
                            <div className="tarea-detail-header">
                                <div className="tarea-header-title-group">
                                    <button className="btn-back-arrow" title="Regresar">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <h1>Lista de Tareas</h1>
                                </div>

                                <div className="tarea-header-actions">
                                    {/* BOTÓN DE BOOKMARK NEGRO SÓLIDO Y SIN LOS 3 PUNTOS */}
                                    <button
                                        className={`btn-icon-action ${activeTask.bookmarked ? 'bookmarked-black' : ''}`}
                                        onClick={() => toggleBookmark(activeTask.id)}
                                        title={activeTask.bookmarked ? 'Marcada como importante' : 'Guardar como importante'}
                                    >
                                        <span className="material-symbols-outlined">
                                            {activeTask.bookmarked ? 'bookmark' : 'bookmark_border'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* BLOQUE PRINCIPAL TAREA */}
                            <div className="tarea-main-hero">
                                <div className="tarea-big-icon-box">
                                    <span className="material-symbols-outlined">{activeTask.icon || 'folder'}</span>
                                </div>
                                <div className="tarea-hero-details">
                                    <h2 className="tarea-hero-title" style={activeTask.completed ? { textDecoration: 'line-through', color: '#64748b' } : {}}>
                                        {activeTask.title}
                                    </h2>
                                    <div className="tarea-badges-row">
                                        <span className="badge-pill-priority">{activeTask.priority}</span>
                                        <span className="badge-pill-time">{activeTask.estimatedTime}</span>
                                        {activeTask.completed && (
                                            <span className="badge-pill-time" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
                                                Completada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <p className="tarea-description-text">
                                {activeTask.description || 'Sin descripción disponible.'}
                            </p>

                            {/* METADATA GRID */}
                            <div className="tarea-metadata-grid">
                                <div className="tarea-meta-card">
                                    <h4>Fecha Límite</h4>
                                    <p className="tarea-meta-value">{activeTask.deadlineDate || 'Sin fecha'}</p>
                                    <p className="tarea-meta-subvalue">{activeTask.deadlineTime || ''}</p>
                                </div>

                                <div className="tarea-meta-card">
                                    <h4>Tiempo Estimado</h4>
                                    <p className="tarea-meta-value">{activeTask.estimatedTime || 'N/A'}</p>
                                </div>

                                <div className="tarea-meta-card">
                                    <h4>Estado</h4>
                                    <p className="tarea-meta-value">{activeTask.status || 'Pendiente'}</p>
                                </div>
                            </div>

                            {/* SECCIÓN EVIDENCIA Y COMPLETAR TAREA */}
                            <div className="tarea-evidence-card">
                                <h4>Evidencia y Entrega</h4>
                                <p>Sube tu evidencia para validar la tarea o márcala como terminada.</p>

                                {activeTask.evidence ? (
                                    <div className="evidence-file-active">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-symbols-outlined" style={{ color: '#10b981' }}>check_circle</span>
                                            <span>{activeTask.evidence}</span>
                                        </div>
                                        <button
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                                            onClick={handleRemoveEvidence}
                                            title="Eliminar evidencia"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="tarea-evidence-dropzone">
                                        <input
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={handleEvidenceUpload}
                                        />
                                        <div className="tarea-evidence-icon">
                                            <span className="material-symbols-outlined">upload_file</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                            Haz clic para seleccionar archivo de evidencia
                                        </span>
                                    </label>
                                )}

                                {/* BOTÓN DE COMPLETAR TAREA (NO ELIMINA, SOLO CAMBIA ESTADO) */}
                                <div style={{ marginTop: '15px' }}>
                                    <button
                                        type="button"
                                        className="btn-primary-blue"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            backgroundColor: activeTask.completed ? '#475569' : '#0284c7'
                                        }}
                                        onClick={async () => {
                                            const nuevoEstado = !activeTask.completed;
                                            try {
                                                const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        completed: nuevoEstado,
                                                        status: nuevoEstado ? 'Completada' : 'Pendiente'
                                                    })
                                                });
                                                if (res.ok) {
                                                    const tareaActualizada = await res.json();
                                                    setTasks(prev => prev.map(t => t.id === activeTask.id ? tareaActualizada : t));
                                                }
                                            } catch (err) {
                                                console.error("Error al completar la tarea:", err);
                                            }
                                        }}
                                    >
                                        <span className="material-symbols-outlined">
                                            {activeTask.completed ? 'undo' : 'task_alt'}
                                        </span>
                                        <span>{activeTask.completed ? 'Reabrir Tarea' : 'Marcar como Completada'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* BOTONES INFERIORES: EDITAR Y POSPONER SE DESACTIVAN SI ESTÁ COMPLETADA */}
                            <div className="tarea-actions-grid">
                                <button 
                                    className="tarea-action-card-btn btn-pastel-edit" 
                                    onClick={openEditModal}
                                    disabled={activeTask.completed}
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                    <span className="btn-label">Editar</span>
                                </button>

                                <button 
                                    className="tarea-action-card-btn btn-pastel-postpone" 
                                    onClick={() => setIsPostponeModalOpen(true)}
                                    disabled={activeTask.completed}
                                >
                                    <span className="material-symbols-outlined">alarm</span>
                                    <span className="btn-label">Posponer</span>
                                </button>

                                <button className="tarea-action-card-btn btn-pastel-delete" onClick={() => setIsDeleteModalOpen(true)}>
                                    <span className="material-symbols-outlined">delete</span>
                                    <span className="btn-label">Eliminar</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="tarea-detail-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <h3>No hay tareas seleccionadas.</h3>
                        </div>
                    )}
                </section>
            </main>

            {/* MODAL EDITAR (Ahora incluye Selector de Ícono) */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3>Editar Tarea</h3>
                            <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="modal-body">
                            <label>Título de la Tarea</label>
                            <input
                                className="modal-input"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                required
                            />

                            <label>Ícono de la Tarea</label>
                            <select
                                className="modal-select"
                                value={editForm.icon}
                                onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                            >
                                {TASK_ICONS.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>

                            <label>Descripción</label>
                            <textarea
                                className="modal-textarea"
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                required
                            />

                            <label>Prioridad</label>
                            <select
                                className="modal-select"
                                value={editForm.priority}
                                onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>

                            <label>Tiempo Estimado</label>
                            <input
                                className="modal-input"
                                placeholder="Ej. 2 horas"
                                value={editForm.estimatedTime}
                                onChange={e => setEditForm({ ...editForm, estimatedTime: e.target.value })}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label>Fecha Límite</label>
                                    <input
                                        type="date"
                                        className="modal-input"
                                        value={editForm.deadlineDate}
                                        onChange={e => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Hora Límite</label>
                                    <input
                                        type="time"
                                        className="modal-input"
                                        value={editForm.deadlineTime}
                                        onChange={e => setEditForm({ ...editForm, deadlineTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary-blue">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL POSPONER */}
            {isPostponeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3>Posponer Tarea</h3>
                            <button className="modal-close-btn" onClick={() => setIsPostponeModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSavePostpone} className="modal-body">
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                                Selecciona cuánto tiempo deseas aplazar la tarea <strong>"{activeTask?.title}"</strong>:
                            </p>
                            <select
                                className="modal-select"
                                value={postponeOption}
                                onChange={e => setPostponeOption(e.target.value)}
                            >
                                <option value="15 min">15 Minutos</option>
                                <option value="30 min">30 Minutos</option>
                                <option value="1 hora">1 Hora</option>
                                <option value="2 horas">2 Horas</option>
                                <option value="1 día">1 Día</option>
                            </select>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsPostponeModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary-blue">Posponer Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3 style={{ color: '#dc2626' }}>Eliminar Tarea</h3>
                            <button className="modal-close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                                ¿Estás seguro de que deseas eliminar la tarea <strong>"{activeTask?.title}"</strong>? Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                            <button type="button" className="btn-danger-red" onClick={handleDeleteTask}>Eliminar Tarea</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NUEVA TAREA (Ahora con Selector de Ícono) */}
            {isNewTaskModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3>Nueva Tarea</h3>
                            <button className="modal-close-btn" onClick={() => setIsNewTaskModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateNewTask} className="modal-body">
                            <label>Título</label>
                            <input
                                className="modal-input"
                                placeholder="Ej. Realizar mockups"
                                value={newTaskForm.title}
                                onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                required
                            />

                            <label>Ícono de la Tarea</label>
                            <select
                                className="modal-select"
                                value={newTaskForm.icon}
                                onChange={e => setNewTaskForm({ ...newTaskForm, icon: e.target.value })}
                            >
                                {TASK_ICONS.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>

                            <label>Descripción</label>
                            <textarea
                                className="modal-textarea"
                                placeholder="Detalles de la tarea..."
                                value={newTaskForm.description}
                                onChange={e => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                                required
                            />

                            <label>Prioridad</label>
                            <select
                                className="modal-select"
                                value={newTaskForm.priority}
                                onChange={e => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>

                            <label>Tiempo Estimado</label>
                            <input
                                className="modal-input"
                                placeholder="Ej. 1 h 30 min"
                                value={newTaskForm.estimatedTime}
                                onChange={e => setNewTaskForm({ ...newTaskForm, estimatedTime: e.target.value })}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label>Fecha Límite</label>
                                    <input
                                        type="date"
                                        className="modal-input"
                                        value={newTaskForm.deadlineDate}
                                        onChange={e => setNewTaskForm({ ...newTaskForm, deadlineDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Hora Límite</label>
                                    <input
                                        type="time"
                                        className="modal-input"
                                        value={newTaskForm.deadlineTime}
                                        onChange={e => setNewTaskForm({ ...newTaskForm, deadlineTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsNewTaskModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary-blue">Crear Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

export default MisTareas;