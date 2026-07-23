// LIBRERÍA
import { useState } from 'react'

// LAYOUT DE LA BARRA LATERAL
import SidebarLayout from '../layouts/SidebarLayout';

// HOJAS DE ESTILOS
import '../assets/css/roadmap.css'

function Roadmap() {
    return (
        <SidebarLayout>
            <div className="roadmap-container">
                {/* Encabezado y Leyenda */}
                <header className="roadmap-header">
                    <div className="header-title">
                        <h2>CLAVE DE DEPARTAMENTO</h2>
                        <p>REFERENCIA DE ESTADO</p>
                    </div>
                    <div className="color-legend">
                        <div className="legend-item"><span className="badge color-1"></span> SIN INICIAR</div>
                        <div className="legend-item"><span className="badge color-2"></span> EN PROGRESO</div>
                        <div className="legend-item"><span className="badge color-3"></span> COMPLETADO</div>
                        <div className="legend-item"><span className="badge color-4"></span> RETRASO</div>
                        <div className="legend-item"><span className="badge color-5"></span> PENDIENTE</div>
                        <div className="legend-item"><span className="badge color-6"></span> CANCELADO</div>
                    </div>
                </header>

                {/* Cuadrícula de Tiempo (Meses) */}
                <div className="timeline-grid header-grid">
                    <div className="row-label-blank"></div>
                    <div className="months-container">
                        <div className="quarter-col">
                            <div className="quarter-title">T1</div>
                            <div className="months-subgrid">
                                <div>ENE</div><div>FEB</div><div>MAR</div>
                            </div>
                        </div>
                        <div className="quarter-col">
                            <div className="quarter-title-current">T2 <span class="hoy-tag">HOY</span></div>
                            <div className="months-subgrid">
                                <div>ABR</div><div>MAY</div><div>JUN</div>
                            </div>
                        </div>
                        <div className="quarter-col">
                            <div className="quarter-title">T3</div>
                            <div className="months-subgrid">
                                <div>JUL</div><div>AGO</div><div>SEP</div>
                            </div>
                        </div>
                        <div className="quarter-col">
                            <div className="quarter-title">T4</div>
                            <div className="months-subgrid">
                                <div>OCT</div><div>NOV</div><div>DIC</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Línea vertical "Hoy" */}
                <div className="today-line" style={{ left: 'calc(18% + (82% / 12) * 3)' }}></div>

                {/* SECCIÓN 1: PLANIFICACIÓN */}
                <section className="roadmap-section">
                    <div className="timeline-grid">
                        <div className="row-label">PLANIFICACIÓN</div>
                        <div className="tasks-space">
                            <div className="bg-grid-lines">
                                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                            </div>
                            
                            <div className="task color-1" style={{ gridColumn: '1 / 3', gridRow: '1' }}>TAREA 1</div>
                            <div className="task color-2" style={{ gridColumn: '2 / 4', gridRow: '1' }}>TAREA 2</div>
                            <div className="task color-3" style={{ gridColumn: '4 / 8', gridRow: '1' }}>TAREA 3</div>
                            <div className="task color-5" style={{ gridColumn: '8 / 9', gridRow: '1' }}>TAREA 4</div>
                            
                            <div className="task flag color-2" style={{ gridColumn: '1 / 3', gridRow: '2' }}>VERSIÓN DE ACTUALIZACIÓN 02/01</div>
                            <div className="task color-6" style={{ gridColumn: '4 / 6', gridRow: '2' }}>TAREA 5</div>
                            <div className="milestone" style={{ gridColumn: '6 / 7', gridRow: '2' }}>HITO UNO</div>
                            <div className="task color-3" style={{ gridColumn: '8 / 12', gridRow: '2' }}>TAREA 6</div>
                            
                            <div className="task color-4" style={{ gridColumn: '8 / 10', gridRow: '3' }}>TAREA 7</div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 2: ESTRATEGIA */}
                <section className="roadmap-section">
                    <div className="timeline-grid">
                        <div className="row-label">ESTRATEGIA</div>
                        <div className="tasks-space">
                            <div className="bg-grid-lines">
                                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                            </div>
                            
                            <div className="task color-1" style={{ gridColumn: '1 / 3', gridRow: '1' }}>TAREA 2</div>
                            <div className="task color-3" style={{ gridColumn: '3 / 10', gridRow: '1' }}>TAREA 1</div>
                            
                            <div className="task color-5" style={{ gridColumn: '4 / 6', gridRow: '2' }}>TAREA 3</div>
                            <div className="task color-4" style={{ gridColumn: '8 / 10', gridRow: '2' }}>TAREA 4</div>
                            <div className="milestone" style={{ gridColumn: '10 / 11', gridRow: '2' }}>HITO DOS</div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 3: DESARROLLO DE SERVICIOS */}
                <section className="roadmap-section">
                    <div className="timeline-grid">
                        <div className="row-label">DESARROLLO DE SERVICIOS</div>
                        <div className="tasks-space">
                            <div className="bg-grid-lines">
                                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                            </div>
                            
                            <div className="task color-1" style={{ gridColumn: '5 / 11', gridRow: '1' }}>TAREA 1</div>
                            <div className="task flag color-6" style={{ gridColumn: '5 / 7', gridRow: '2' }}>INFORME PREVISTO 20/05</div>
                            <div className="task color-6" style={{ gridColumn: '9 / 11', gridRow: '2' }}>TAREA 2</div>
                        </div>
                    </div>
                </section>

                {/* SECCIÓN 4: OTRO */}
                <section className="roadmap-section">
                    <div className="timeline-grid">
                        <div className="row-label">OTRO</div>
                        <div className="tasks-space">
                            <div className="bg-grid-lines">
                                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                            </div>
                            
                            <div className="task color-1" style={{ gridColumn: '1 / 3', gridRow: '1' }}>TAREA 1</div>
                            <div className="task color-5" style={{ gridColumn: '5 / 6', gridRow: '1' }}>TAREA 3</div>
                            <div className="task color-3" style={{ gridColumn: '6 / 10', gridRow: '1' }}>TAREA 4</div>
                            <div className="task color-4" style={{ gridColumn: '10 / 11', gridRow: '1' }}>TAREA 5</div>
                            
                            <div className="task flag color-green" style={{ gridColumn: '7 / 9', gridRow: '2' }}>LANZAMIENTO 01/07</div>
                            <div className="task color-6" style={{ gridColumn: '8 / 10', gridRow: '2' }}>TAREA 2</div>
                            <div className="task color-2" style={{ gridColumn: '6 / 8', gridRow: '3' }}>TAREA 6</div>
                        </div>
                    </div>
                </section>
            </div>
        </SidebarLayout>
    );
}

export default Roadmap;