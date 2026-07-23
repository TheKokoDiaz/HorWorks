// LIBRERÍAS
import { useState } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/mis_tareas.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

const INITIAL_TASKS = [
    {
        id: 1,
        title: 'Tarea 1',
        subtitle: 'Supporting line text lorem ipsum dolor sit amet...',
        badgeType: 'time',
        badgeText: 'en 10 min',
        icon: 'dataset',
        priority: 'Media',
        estimatedTime: '45 min',
        description: 'Revision inicial de los requisitos y asignación de actividades.',
        deadlineDate: '22 de mayo 2026',
        deadlineTime: '6:00 PM',
        createdDate: '15 mayo 2026',
        createdTime: '10:00 AM',
        status: 'En Proceso',
        bookmarked: false
    },
    {
        id: 2,
        title: 'Realizar interfaz para TECH',
        subtitle: 'Supporting line text lorem ipsum...',
        badgeType: 'ticket',
        badgeText: 'Pospuesta',
        icon: 'menu_book',
        priority: 'Alta',
        estimatedTime: '1 h 30 min',
        description: 'Realizar un diseño de la interfaz de usuario (páginas principales) de la aplicación WEB propuesta, al menos 6 interfaces.',
        deadlineDate: '22 de mayo 2026',
        deadlineTime: '11:00 PM',
        createdDate: '13 mayo 2026',
        createdTime: '2:00 PM',
        status: 'Pendiente',
        bookmarked: true
    },
    {
        id: 3,
        title: 'Reporte de Arquitectura',
        subtitle: 'Supporting line text lorem ipsum...',
        badgeType: 'time',
        badgeText: 'en 1 hr',
        icon: 'analytics',
        priority: 'Media',
        estimatedTime: '2 h 00 min',
        description: 'Elaboración del diagrama de arquitectura e infraestructura del sistema.',
        deadlineDate: '23 de mayo 2026',
        deadlineTime: '4:00 PM',
        createdDate: '14 mayo 2026',
        createdTime: '11:30 AM',
        status: 'Pendiente',
        bookmarked: false
    },
    {
        id: 4,
        title: 'Realizar integración backend',
        subtitle: 'Supporting line text lorem ipsum...',
        badgeType: 'time',
        badgeText: 'en 1.5 hr',
        icon: 'code',
        priority: 'Alta',
        estimatedTime: '3 h 00 min',
        description: 'Conexión de los endpoints REST de tareas y usuarios con la base de datos SQL.',
        deadlineDate: '23 de mayo 2026',
        deadlineTime: '8:00 PM',
        createdDate: '12 mayo 2026',
        createdTime: '9:00 AM',
        status: 'En Proceso',
        bookmarked: false
    },
    {
        id: 5,
        title: 'Revisión urgente de Bugs',
        subtitle: 'Supporting line text',
        badgeType: 'urgent',
        badgeText: 'Urgente',
        icon: 'warning',
        priority: 'Alta',
        estimatedTime: '1 h 00 min',
        description: 'Corregir fallos críticos reportados en la prueba de login y sesión.',
        deadlineDate: '22 de mayo 2026',
        deadlineTime: '5:00 PM',
        createdDate: '22 mayo 2026',
        createdTime: '1:00 PM',
        status: 'Urgente',
        bookmarked: true
    },
    {
        id: 6,
        title: 'Pruebas de Usabilidad',
        subtitle: 'Supporting line text lorem ipsum...',
        badgeType: 'time',
        badgeText: 'mañana',
        icon: 'fact_check',
        priority: 'Baja',
        estimatedTime: '2 h 30 min',
        description: 'Ejecución de pruebas A/B con usuarios de prueba y recolección de feedback.',
        deadlineDate: '24 de mayo 2026',
        deadlineTime: '12:00 PM',
        createdDate: '16 mayo 2026',
        createdTime: '3:15 PM',
        status: 'Pendiente',
        bookmarked: false
    },
    {
        id: 7,
        title: 'Documentación API',
        subtitle: 'Supporting line text lorem ipsum...',
        badgeType: 'time',
        badgeText: 'mañana',
        icon: 'description',
        priority: 'Baja',
        estimatedTime: '1 h 15 min',
        description: 'Redacción de la documentación Swagger/Postman de la API.',
        deadlineDate: '24 de mayo 2026',
        deadlineTime: '6:00 PM',
        createdDate: '17 mayo 2026',
        createdTime: '10:00 AM',
        status: 'Pendiente',
        bookmarked: false
    }
];

function MisTareas() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [selectedTaskId, setSelectedTaskId] = useState(2); // Inicia con Tarea 2 como en el mockup

    // Estado para Evidencia subida
    const [evidenceFile, setEvidenceFile] = useState(null);

    // Estados para Modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

    // Formulario de edición
    const [editForm, setEditForm] = useState({ title: '', description: '', priority: '', deadlineDate: '' });

    // Formulario de posponer
    const [postponeOption, setPostponeOption] = useState('30 min');

    // Formulario de nueva tarea
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Alta',
        estimatedTime: '1 h 00 min',
        deadlineDate: '25 de mayo 2026',
        deadlineTime: '11:00 PM'
    });

    const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

    // Alternar Bookmark
    const toggleBookmark = (id) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, bookmarked: !task.bookmarked } : task
        ));
    };

    // Subir evidencia simulada
    const handleEvidenceUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setEvidenceFile(file.name);
        } else {
            setEvidenceFile('Evidencia_Interfaz_TECH.pdf');
        }
    };

    // Abrir Modal de Edición
    const openEditModal = () => {
        if (!activeTask) return;
        setEditForm({
            title: activeTask.title,
            description: activeTask.description,
            priority: activeTask.priority,
            deadlineDate: activeTask.deadlineDate
        });
        setIsEditModalOpen(true);
    };

    // Guardar Edición
    const handleSaveEdit = (e) => {
        e.preventDefault();
        setTasks(prev => prev.map(task =>
            task.id === selectedTaskId
                ? { ...task, title: editForm.title, description: editForm.description, priority: editForm.priority, deadlineDate: editForm.deadlineDate }
                : task
        ));
        setIsEditModalOpen(false);
    };

    // Guardar Posponer
    const handleSavePostpone = (e) => {
        e.preventDefault();
        setTasks(prev => prev.map(task =>
            task.id === selectedTaskId
                ? { ...task, status: 'Pospuesta', badgeType: 'ticket', badgeText: `Pospuesta +${postponeOption}` }
                : task
        ));
        setIsPostponeModalOpen(false);
    };

    // Confirmar Eliminar
    const handleDeleteTask = () => {
        const remaining = tasks.filter(t => t.id !== selectedTaskId);
        setTasks(remaining);
        setIsDeleteModalOpen(false);
        if (remaining.length > 0) {
            setSelectedTaskId(remaining[0].id);
        }
    };

    // Crear Nueva Tarea
    const handleCreateNewTask = (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            title: newTaskForm.title || 'Nueva Tarea',
            subtitle: 'Tarea agregada recientemente...',
            badgeType: 'time',
            badgeText: 'en 2 hrs',
            icon: 'assignment',
            priority: newTaskForm.priority,
            estimatedTime: newTaskForm.estimatedTime,
            description: newTaskForm.description || 'Sin descripción.',
            deadlineDate: newTaskForm.deadlineDate,
            deadlineTime: newTaskForm.deadlineTime,
            createdDate: 'Hoy',
            createdTime: 'Ahora',
            status: 'Pendiente',
            bookmarked: false
        };
        setTasks([newTask, ...tasks]);
        setSelectedTaskId(newTask.id);
        setIsNewTaskModalOpen(false);
        setNewTaskForm({
            title: '',
            description: '',
            priority: 'Alta',
            estimatedTime: '1 h 00 min',
            deadlineDate: '25 de mayo 2026',
            deadlineTime: '11:00 PM'
        });
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
                            const isUrgent = task.badgeType === 'urgent';

                            let cardClassName = 'task-item-card';
                            if (isSelected) cardClassName += ' selected';
                            if (isUrgent && !isSelected) cardClassName += ' urgent';

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
                                            <p className="task-item-sub">{task.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="task-item-right">
                                        {task.badgeType === 'ticket' ? (
                                            <div className="task-status-ticket">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>confirmation_number</span>
                                                {task.badgeText}
                                            </div>
                                        ) : task.badgeType === 'urgent' ? (
                                            <div className="task-status-urgent-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                                                {task.badgeText}
                                            </div>
                                        ) : (
                                            <span className="task-time-badge">{task.badgeText}</span>
                                        )}
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
                                    <button
                                        className={`btn-icon-action ${activeTask.bookmarked ? 'bookmarked' : ''}`}
                                        onClick={() => toggleBookmark(activeTask.id)}
                                        title={activeTask.bookmarked ? 'Guardada' : 'Guardar tarea'}
                                    >
                                        <span className="material-symbols-outlined">
                                            {activeTask.bookmarked ? 'bookmark' : 'bookmark_border'}
                                        </span>
                                    </button>
                                    <button className="btn-icon-action" title="Más opciones">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>

                            {/* BLOQUE PRINCIPAL TAREA (ÍCONO, TÍTULO, BADGES) */}
                            <div className="tarea-main-hero">
                                <div className="tarea-big-icon-box">
                                    <span className="material-symbols-outlined">{activeTask.icon || 'menu_book'}</span>
                                </div>
                                <div className="tarea-hero-details">
                                    <h2 className="tarea-hero-title">{activeTask.title}</h2>
                                    <div className="tarea-badges-row">
                                        <span className="badge-pill-priority">{activeTask.priority}</span>
                                        <span className="badge-pill-time">{activeTask.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <p className="tarea-description-text">
                                {activeTask.description}
                            </p>

                            {/* METADATA GRID (3 TARJETAS) */}
                            <div className="tarea-metadata-grid">
                                <div className="tarea-meta-card">
                                    <h4>Fecha Límite</h4>
                                    <p className="tarea-meta-value">{activeTask.deadlineDate}</p>
                                    <p className="tarea-meta-subvalue">{activeTask.deadlineTime}</p>
                                </div>

                                <div className="tarea-meta-card">
                                    <h4>Creada</h4>
                                    <p className="tarea-meta-value">{activeTask.createdDate}</p>
                                    <p className="tarea-meta-subvalue">{activeTask.createdTime}</p>
                                </div>

                                <div className="tarea-meta-card">
                                    <h4>Estado</h4>
                                    <p className="tarea-meta-value">{activeTask.status}</p>
                                </div>
                            </div>

                            {/* SECCIÓN EVIDENCIA */}
                            <div className="tarea-evidence-card">
                                <h4>Evidencia</h4>
                                <p>Sube tu evidencia de la tarea o haz un resumen de la tarea que elaboraste</p>

                                {evidenceFile ? (
                                    <div className="evidence-file-active">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-symbols-outlined">task</span>
                                            <span>{evidenceFile}</span>
                                        </div>
                                        <button
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1' }}
                                            onClick={() => setEvidenceFile(null)}
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
                                            <span className="material-symbols-outlined">folder</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>Clic para seleccionar archivo</span>
                                    </label>
                                )}
                            </div>

                            {/* BOTONES INFERIORES PASTEL */}
                            <div className="tarea-actions-grid">
                                <button className="tarea-action-card-btn btn-pastel-edit" onClick={openEditModal}>
                                    <span className="material-symbols-outlined">edit</span>
                                    <span className="btn-label">Editar</span>
                                </button>

                                <button className="tarea-action-card-btn btn-pastel-postpone" onClick={() => setIsPostponeModalOpen(true)}>
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

            {/* MODAL EDITAR */}
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

                            <label>Fecha Límite</label>
                            <input
                                className="modal-input"
                                value={editForm.deadlineDate}
                                onChange={e => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                            />

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

            {/* MODAL NUEVA TAREA */}
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
