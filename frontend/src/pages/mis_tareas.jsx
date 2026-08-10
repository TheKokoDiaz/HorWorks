// LIBRERÍAS
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';

// HOJAS DE ESTILOS
import '../assets/css/mis_tareas.css';

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);  
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

    const [editForm, setEditForm] = useState({
        title: '', description: '', priority: 'Media', estimatedTime: '', deadlineDate: '', deadlineTime: '', icon: 'folder'
    });
    const [postponeOption, setPostponeOption] = useState('30 min');
    const [newTaskForm, setNewTaskForm] = useState({
        title: '', description: '', priority: 'Alta', estimatedTime: '1 h 00 min', deadlineDate: '', deadlineTime: '', icon: 'folder'
    });

    // Archivos de evidencia elegidos ANTES de crear la tarea (se suben justo después de crearla)
    const [pendingEvidenceFiles, setPendingEvidenceFiles] = useState([]);

    // Animaciones: id de la tarjeta que se está deslizando fuera (borrado definitivo)
    // y id de la tarjeta que acaba de recibir un pulso (bookmark / enviar a papelera)
    const [removingId, setRemovingId] = useState(null);
    const [pulseId, setPulseId] = useState(null);
    const [pulseType, setPulseType] = useState(null); // 'bookmark' | 'trash'

    const listRef = useRef(null);
    const prevPositions = useRef({});

    useEffect(() => {
        fetch('http://localhost:5000/api/tareas/')
            .then(response => response.json())
            .then(data => {
                setTasks(data);
                if (data.length > 0) setSelectedTaskId(data[0].id);
            })
            .catch(error => console.error("Error al cargar las tareas:", error));
    }, []);

    const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

    // --- ORDEN AUTOMÁTICO ANTES DE DIBUJAR ---
    // 1. Con bookmark  2. Normales  3. En papelera (soft delete)
    const sortedTasks = useMemo(() => {
        const conBookmark = tasks.filter(t => t.bookmarked && !t.deleted);
        const normales = tasks.filter(t => !t.bookmarked && !t.deleted);
        const enPapelera = tasks.filter(t => t.deleted);
        return [...conBookmark, ...normales, ...enPapelera];
    }, [tasks]);

    // --- ANIMACIÓN FLIP: cuando el orden cambia, las tarjetas se deslizan a su nueva posición ---
    useLayoutEffect(() => {
        const container = listRef.current;
        if (!container) return;
        const cards = container.querySelectorAll('[data-task-id]');
        const newPositions = {};

        cards.forEach(card => {
            newPositions[card.dataset.taskId] = card.getBoundingClientRect().top;
        });

        cards.forEach(card => {
            const id = card.dataset.taskId;
            const prevTop = prevPositions.current[id];
            const newTop = newPositions[id];
            if (prevTop !== undefined && prevTop !== newTop) {
                const deltaY = prevTop - newTop;
                card.style.transition = 'none';
                card.style.transform = `translateY(${deltaY}px)`;
                requestAnimationFrame(() => {
                    card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
                    card.style.transform = '';
                });
            }
        });

        prevPositions.current = newPositions;
    }, [sortedTasks]);

    // --- 1. LÓGICA DE TIEMPO RESTANTE ---
    const getTimeStatus = (dateStr, timeStr) => {
        if (!dateStr) return { text: 'Sin fecha', class: '' };
        
        const deadline = new Date(`${dateStr}T${timeStr || '23:59'}:00`);
        const now = new Date();
        const diffMs = deadline - now;

        if (isNaN(diffMs)) return { text: 'Fecha inválida', class: '' };
        if (diffMs < 0) return { text: 'Expirada', class: 'time-expired' };

        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHrs = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHrs / 24);

        let text = '';
        let colorClass = '';

        if (diffDays >= 7) {
            text = `En ${diffDays} días`;
            colorClass = 'time-green';
        } else if (diffDays >= 1) {
            text = `En ${diffDays} días`;
            colorClass = 'time-orange';
        } else if (diffHrs >= 1) {
            text = `En ${diffHrs}h ${diffMins % 60}m`;
            colorClass = 'time-red';
        } else {
            text = `En ${diffMins} min`;
            colorClass = 'time-red';
        }

        return { text, class: colorClass };
    };

    // --- 2. MARCADOR PERSISTENTE ---
    const toggleBookmark = async (id) => {
        const targetTask = tasks.find(t => t.id === id);
        if (!targetTask) return;

        const nuevoEstado = !targetTask.bookmarked;
        setTasks(prev => prev.map(task => task.id === id ? { ...task, bookmarked: nuevoEstado } : task));

        if (nuevoEstado) {
            setPulseId(id);
            setPulseType('bookmark');
            setTimeout(() => setPulseId(null), 700);
        }

        try {
            await fetch(`http://localhost:5000/api/tareas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookmarked: nuevoEstado })
            });
        } catch (err) { console.error(err); }
    };

    // --- 3. SUBIR Y ELIMINAR EVIDENCIA (ahora soporta varios archivos con vista previa real) ---
    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleEvidenceUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !activeTask) return;

        try {
            const payload = await Promise.all(files.map(async (file) => ({
                name: file.name,
                type: file.type,
                data: await fileToDataUrl(file)
            })));

            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}/evidencias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: payload })
            });
            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(t => t.id === activeTask.id ? tareaActualizada : t));
            }
        } catch (err) { console.error(err); }

        e.target.value = '';
    };

    const handleRemoveEvidence = async (evidenciaId) => {
        if (!activeTask) return;
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}/evidencias/${evidenciaId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(t => t.id === activeTask.id ? tareaActualizada : t));
            }
        } catch (err) { console.error(err); }
    };

    // --- Evidencia elegida en el modal de "Nueva Tarea" (aún no existe la tarea) ---
    const handlePendingFilesChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const converted = await Promise.all(files.map(async (file) => ({
            name: file.name,
            type: file.type,
            data: await fileToDataUrl(file)
        })));
        setPendingEvidenceFiles(prev => [...prev, ...converted]);
        e.target.value = '';
    };

    const removePendingFile = (index) => {
        setPendingEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    // --- 4. MARCAR COMPLETADA PERSISTENTE ---
    const toggleCompleted = async () => {
        if (!activeTask) return;
        const nuevoEstado = !activeTask.completed;
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: nuevoEstado })
            });
            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(t => t.id === activeTask.id ? tareaActualizada : t));
            }
        } catch (err) { console.error(err); }
    };

    // --- 5. LÓGICA DE POSPONER (Sumar tiempo matemático) ---
    const handleSavePostpone = async (e) => {
        e.preventDefault();
        if (!activeTask.deadlineDate) {
            alert("No se puede posponer una tarea sin fecha límite.");
            return;
        }

        const dt = new Date(`${activeTask.deadlineDate}T${activeTask.deadlineTime || '00:00'}:00`);
        let addMs = 0;
        if (postponeOption === '15 min') addMs = 15 * 60 * 1000;
        if (postponeOption === '30 min') addMs = 30 * 60 * 1000;
        if (postponeOption === '1 hora') addMs = 60 * 60 * 1000;
        if (postponeOption === '2 horas') addMs = 2 * 60 * 60 * 1000;
        if (postponeOption === '1 día') addMs = 24 * 60 * 60 * 1000;

        const newDt = new Date(dt.getTime() + addMs);
        const newDate = newDt.toISOString().split('T')[0];
        const newTime = newDt.toTimeString().substring(0, 5);

        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${selectedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deadlineDate: newDate, deadlineTime: newTime })
            });
            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(t => t.id === selectedTaskId ? tareaActualizada : t));
                setIsPostponeModalOpen(false);
            }
        } catch (err) { console.error(err); }
    };

    // --- 6. ELIMINACIÓN EN DOS PASOS (Soft Delete / Hard Delete) ---
    const handleDeleteTask = async () => {
        if (!activeTask.deleted) {
            // Paso 1: Soft Delete (mover a papelera) — pulso gris, baja al final de la lista
            try {
                const res = await fetch(`http://localhost:5000/api/tareas/${selectedTaskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deleted: true })
                });
                if (res.ok) {
                    const tareaActualizada = await res.json();
                    setTasks(prev => prev.map(t => t.id === selectedTaskId ? tareaActualizada : t));
                    setIsDeleteModalOpen(false);
                    setPulseId(selectedTaskId);
                    setPulseType('trash');
                    setTimeout(() => setPulseId(null), 700);
                }
            } catch (err) { console.error(err); }
        } else {
            // Paso 2: Hard Delete (Destruir permanentemente) — swipe a la izquierda + rojo, y luego se quita
            setIsDeleteModalOpen(false);
            const idToRemove = selectedTaskId;
            setRemovingId(idToRemove);

            setTimeout(async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/tareas/${idToRemove}`, { method: 'DELETE' });
                    if (res.ok) {
                        const remaining = tasks.filter(t => t.id !== idToRemove);
                        setTasks(remaining);
                        setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
                    }
                } catch (err) { console.error(err); }
                setRemovingId(null);
            }, 380);
        }
    };

    // --- 6b. RESTAURAR TAREA DESDE LA PAPELERA (revertir el soft delete) ---
    const handleRestoreTask = async () => {
        if (!activeTask) return;
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${activeTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleted: false })
            });
            if (res.ok) {
                const tareaActualizada = await res.json();
                setTasks(prev => prev.map(t => t.id === activeTask.id ? tareaActualizada : t));
            }
        } catch (err) { console.error(err); }
    };

    // --- CREAR Y EDITAR (Iguales a los que ya teníamos) ---
    const openEditModal = () => {
        if (!activeTask || activeTask.completed || activeTask.deleted) return;
        setEditForm({
            title: activeTask.title || '', description: activeTask.description || '', priority: activeTask.priority || 'Media',
            estimatedTime: activeTask.estimatedTime || '', deadlineDate: activeTask.deadlineDate || '', deadlineTime: activeTask.deadlineTime || '', icon: activeTask.icon || 'folder'
        });
        setIsEditModalOpen(true);
    };

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
                setTasks(prev => prev.map(t => t.id === selectedTaskId ? tareaActualizada : t));
                setIsEditModalOpen(false);
            }
        } catch (err) { console.error(err); }
    };

    const handleCreateNewTask = async (e) => {
        e.preventDefault();
        const tareaData = {
            title: newTaskForm.title, description: newTaskForm.description, priority: newTaskForm.priority, estimatedTime: newTaskForm.estimatedTime,
            deadlineDate: newTaskForm.deadlineDate, deadlineTime: newTaskForm.deadlineTime, icon: newTaskForm.icon
        };
        try {
            const res = await fetch('http://localhost:5000/api/tareas/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tareaData)
            });
            let nuevaTarea = await res.json();

            // Si el usuario ya adjuntó evidencias antes de crear la tarea, se suben ahora
            if (pendingEvidenceFiles.length > 0) {
                const evRes = await fetch(`http://localhost:5000/api/tareas/${nuevaTarea.id}/evidencias`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: pendingEvidenceFiles })
                });
                if (evRes.ok) nuevaTarea = await evRes.json();
            }

            setTasks([nuevaTarea, ...tasks]);
            setSelectedTaskId(nuevaTarea.id);
            setIsNewTaskModalOpen(false);
            setNewTaskForm({ title: '', description: '', priority: 'Alta', estimatedTime: '1 h 00 min', deadlineDate: '', deadlineTime: '', icon: 'folder' });
            setPendingEvidenceFiles([]);
        } catch (error) { console.error(error); }
    };

    const getPriorityClass = (task) => {
        if (task.deleted) return 'eliminada';
        if (task.completed) return 'completada';
        const p = (task.priority || '').toLowerCase();
        if (p === 'alta') return 'prioridad-alta';
        if (p === 'baja') return 'prioridad-baja';
        return 'prioridad-media';
    };

    return (
        <SidebarLayout>
            <main className="tareas-main-layout">
                {/* COLUMNA IZQUIERDA */}
                <aside className="tareas-list-column">
                    <div className="tareas-list-header">
                        <h2>Tareas por hacer</h2>
                        <button className="btn-add-task-icon" onClick={() => setIsNewTaskModalOpen(true)}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    <div className="tareas-cards-container" ref={listRef}>
                        {sortedTasks.map((task) => {
                            const isSelected = task.id === selectedTaskId;
                            const priorityClass = getPriorityClass(task);
                            const timeStatus = getTimeStatus(task.deadlineDate, task.deadlineTime);
                            const isAlta = (task.priority || '').toLowerCase() === 'alta' && !task.completed && !task.deleted;

                            const animClass = [
                                task.id === removingId ? 'removing' : '',
                                task.id === pulseId && pulseType === 'bookmark' ? 'just-bookmarked' : '',
                                task.id === pulseId && pulseType === 'trash' ? 'just-trashed' : ''
                            ].filter(Boolean).join(' ');

                            return (
                                <div
                                    key={task.id}
                                    data-task-id={task.id}
                                    className={`task-item-card ${priorityClass} ${isSelected ? 'selected' : ''} ${animClass}`}
                                    onClick={() => setSelectedTaskId(task.id)}
                                >
                                    <div className="task-item-left">
                                        <div className="task-item-avatar">
                                            <span className="material-symbols-outlined">{task.icon || 'folder'}</span>
                                        </div>
                                        <div className="task-item-info">
                                            <h4 className="task-item-title">
                                                {isAlta && (
                                                    <span className="material-symbols-outlined priority-flag-alta" title="Prioridad alta">flag</span>
                                                )}{' '}
                                                {task.title}
                                            </h4>
                                            <p className="task-item-sub">{task.description ? task.description.substring(0, 30) + '...' : ''}</p>
                                        </div>
                                    </div>

                                    <div className="task-item-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {task.bookmarked && !task.deleted && (
                                            <span className="material-symbols-outlined" style={{ color: '#000000', fontSize: '20px' }}>bookmark</span>
                                        )}
                                        {task.deleted ? (
                                            <span className="task-trash-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
                                                En papelera
                                            </span>
                                        ) : (
                                            <span className={`task-time-badge ${timeStatus.class}`}>
                                                {task.completed ? 'Terminada' : timeStatus.text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* COLUMNA DERECHA */}
                <section className="tarea-detail-column">
                    {activeTask ? (
                        <div className="tarea-detail-card">
                            <div className="tarea-detail-header">
                                <div className="tarea-header-title-group">
                                    {/* BOTÓN REGRESAR FUNCIONAL */}
                                    <button className="btn-back-arrow" title="Regresar al inicio" onClick={() => window.location.href = '/home'}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <h1>Lista de Tareas</h1>
                                </div>

                                <div className="tarea-header-actions">
                                    {/* BOOKMARK */}
                                    <button
                                        className={`btn-icon-action ${activeTask.bookmarked ? 'bookmarked-black' : ''}`}
                                        onClick={() => toggleBookmark(activeTask.id)}
                                    >
                                        <span className="material-symbols-outlined">{activeTask.bookmarked ? 'bookmark' : 'bookmark_border'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="tarea-main-hero">
                                <div className="tarea-big-icon-box">
                                    <span className="material-symbols-outlined">{activeTask.icon || 'folder'}</span>
                                </div>
                                <div className="tarea-hero-details">
                                    <h2 className="tarea-hero-title" style={(activeTask.completed || activeTask.deleted) ? { textDecoration: 'line-through', color: '#64748b' } : {}}>
                                        {activeTask.title}
                                    </h2>
                                    <div className="tarea-badges-row">
                                        <span className="badge-pill-priority">{activeTask.priority}</span>
                                        {activeTask.deleted ? (
                                            <span className="badge-pill-time" style={{ backgroundColor: '#fecaca', color: '#991b1b' }}>Eliminada</span>
                                        ) : activeTask.completed ? (
                                            <span className="badge-pill-time" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Completada</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <p className="tarea-description-text">{activeTask.description || 'Sin descripción.'}</p>

                            {!activeTask.deleted && (() => {
                                const ts = getTimeStatus(activeTask.deadlineDate, activeTask.deadlineTime);
                                const icon = activeTask.completed ? 'task_alt'
                                    : ts.class === 'time-expired' ? 'event_busy'
                                    : ts.class === 'time-red' ? 'alarm'
                                    : 'schedule';
                                return (
                                    <div className={`tarea-countdown-card ${activeTask.completed ? 'time-green' : ts.class}`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                        <div className="tarea-countdown-text">
                                            <span className="tarea-countdown-label">Tiempo restante</span>
                                            <span className="tarea-countdown-value">{activeTask.completed ? 'Tarea completada' : ts.text}</span>
                                        </div>
                                    </div>
                                );
                            })()}

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
                            </div>

                            <div className="tarea-evidence-card">
                                <h4>Evidencia y Entrega</h4>
                                <p>Sube una o varias evidencias para validar la tarea (imágenes con vista previa, PDFs, u otros archivos).</p>

                                {activeTask.evidences && activeTask.evidences.length > 0 && (
                                    <div className="evidence-grid">
                                        {activeTask.evidences.map(ev => {
                                            const isImage = (ev.type || '').startsWith('image/');
                                            const isPdf = (ev.type || '') === 'application/pdf';
                                            return (
                                                <div key={ev.id} className="evidence-item">
                                                    <button
                                                        type="button"
                                                        className="evidence-item-remove"
                                                        onClick={() => handleRemoveEvidence(ev.id)}
                                                        title="Quitar evidencia"
                                                    >
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                    {isImage ? (
                                                        <img src={ev.data} alt={ev.name} />
                                                    ) : isPdf ? (
                                                        <iframe src={ev.data} title={ev.name} />
                                                    ) : (
                                                        <div className="evidence-item-generic">
                                                            <span className="material-symbols-outlined">description</span>
                                                            <span className="evidence-item-name">{ev.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <label className="tarea-evidence-dropzone">
                                    <input type="file" multiple style={{ display: 'none' }} onChange={handleEvidenceUpload} />
                                    <div className="tarea-evidence-icon"><span className="material-symbols-outlined">upload_file</span></div>
                                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Clic para añadir evidencia (puedes elegir varias)</span>
                                </label>

                                <div style={{ marginTop: '15px' }}>
                                    <button
                                        type="button" className="btn-primary-blue"
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            backgroundColor: activeTask.deleted ? '#94a3b8' : (activeTask.completed ? '#475569' : '#0284c7'),
                                            cursor: activeTask.deleted ? 'not-allowed' : 'pointer'
                                        }}
                                        onClick={toggleCompleted}
                                        disabled={activeTask.deleted}
                                    >
                                        <span className="material-symbols-outlined">{activeTask.completed ? 'undo' : 'task_alt'}</span>
                                        <span>{activeTask.completed ? 'Reabrir Tarea' : 'Marcar como Completada'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="tarea-actions-grid">
                                {activeTask.deleted ? (
                                    <button className="tarea-action-card-btn btn-pastel-restore" onClick={handleRestoreTask}>
                                        <span className="material-symbols-outlined">restore_from_trash</span> <span className="btn-label">Restaurar</span>
                                    </button>
                                ) : (
                                    <button className="tarea-action-card-btn btn-pastel-edit" onClick={openEditModal} disabled={activeTask.completed}>
                                        <span className="material-symbols-outlined">edit</span> <span className="btn-label">Editar</span>
                                    </button>
                                )}
                                <button className="tarea-action-card-btn btn-pastel-postpone" onClick={() => setIsPostponeModalOpen(true)} disabled={activeTask.completed || activeTask.deleted}>
                                    <span className="material-symbols-outlined">alarm</span> <span className="btn-label">Posponer</span>
                                </button>
                                <button className="tarea-action-card-btn btn-pastel-delete" onClick={() => setIsDeleteModalOpen(true)}>
                                    <span className="material-symbols-outlined">delete</span> <span className="btn-label">{activeTask.deleted ? 'Eliminar def.' : 'Eliminar'}</span>
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

                            <label>Evidencia (opcional, puedes elegir varias)</label>
                            <label className="tarea-evidence-dropzone" style={{ padding: '14px' }}>
                                <input type="file" multiple style={{ display: 'none' }} onChange={handlePendingFilesChange} />
                                <div className="tarea-evidence-icon"><span className="material-symbols-outlined">upload_file</span></div>
                                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Clic para seleccionar archivos</span>
                            </label>
                            {pendingEvidenceFiles.length > 0 && (
                                <div className="evidence-pending-list">
                                    {pendingEvidenceFiles.map((f, idx) => (
                                        <div key={idx} className="evidence-pending-chip">
                                            <span>{f.name}</span>
                                            <button type="button" onClick={() => removePendingFile(idx)}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => { setIsNewTaskModalOpen(false); setPendingEvidenceFiles([]); }}>Cancelar</button>
                                <button type="submit" className="btn-primary-blue">Crear Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
            
            {isPostponeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3>Posponer Tarea</h3>
                            <button className="modal-close-btn" onClick={() => setIsPostponeModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSavePostpone} className="modal-body">
                            <p>Sumar tiempo exacto a la fecha actual de entrega:</p>
                            <select className="modal-select" value={postponeOption} onChange={e => setPostponeOption(e.target.value)}>
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

            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-box">
                        <div className="modal-header">
                            <h3 style={{ color: '#dc2626' }}>{activeTask?.deleted ? 'Eliminar Permanentemente' : 'Mover a Papelera'}</h3>
                            <button className="modal-close-btn" onClick={() => setIsDeleteModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="modal-body">
                            <p>
                                {activeTask?.deleted 
                                    ? `¿Deseas destruir permanentemente la tarea "${activeTask?.title}"? Esto borrará el registro de la base de datos.`
                                    : `¿Mover la tarea "${activeTask?.title}" a la papelera? Podrás recuperarla cambiando su estado.`}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                            <button type="button" className="btn-danger-red" onClick={handleDeleteTask}>
                                {activeTask?.deleted ? 'Eliminar Definitivo' : 'Mover a Papelera'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

export default MisTareas;