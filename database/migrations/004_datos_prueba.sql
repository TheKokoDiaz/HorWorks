-- database/migrations/004_datos_prueba.sql
--
-- Datos de prueba adicionales para TODAS las tablas excepto HOR_Usuario
-- (ya tienes 26 usuarios de HorDatabase.sql, con Ids 1..26). No toca
-- HOR_Ajustes porque esa tabla ya viene completa para los 26 usuarios y
-- su PK es USU_Id (correría "Duplicate entry" si se repite).
--
-- Requiere que 002_google_calendar.sql y 003_equipo_descripcion.sql ya
-- estén aplicados (usa EQU_Descripcion/EQU_Organizacion y
-- USU_Google_RefreshToken/USU_Google_Email/TAR_GoogleEventId).
--
-- Aplícalo igual que las otras migraciones:
--   Get-Content "database/migrations/004_datos_prueba.sql" | docker exec -i DB_HORWORKS mysql -uroot -pPelusa12! DB_HORWORKS
--
-- Si lo corres dos veces vas a duplicar filas (no hay UNIQUE que lo
-- impida, salvo en HOR_GoogleToken e HOR_InvitacionAuditor). Es un script
-- de datos de prueba, no una migración idempotente.

-- =========================================================
-- HOR_Equipo — 2 equipos nuevos
-- =========================================================
INSERT INTO HOR_Equipo (EQU_Nombre, EQU_Foto, EQU_Descripcion, EQU_Organizacion, EQU_Auditor)
VALUES
('Equipo de Marketing Digital', 'https://api.dicebear.com/7.x/identicon/svg?seed=Marketing', 'Campañas, contenido y redes sociales del ciclo actual', 'HorWorks Academy', 19),
('Equipo de QA / Testing',      'https://api.dicebear.com/7.x/identicon/svg?seed=QA',        'Pruebas funcionales y de regresión antes de cada release', 'HorWorks Academy', 20);

-- =========================================================
-- HOR_Grupos — miembros de los equipos nuevos (y algunos extra
-- en los equipos ya existentes: 1=Backend, 2=Diseño)
-- =========================================================
INSERT INTO HOR_Grupos (USU_Id, EQU_Id, GRU_Rol)
VALUES
(11, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital'), 'Líder de Marketing'),
(12, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital'), 'Community Manager'),
(13, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital'), 'Diseñadora de Contenido'),
(14, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing'), 'Líder de QA'),
(15, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing'), 'Tester'),
(16, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing'), 'Tester'),
(17, 1, 'Desarrollador Backend Jr.'),
(18, 2, 'Ilustradora');

-- =========================================================
-- HOR_Tarea — variedad de prioridades, plazos y dueños
-- (algunas vencidas, algunas próximas <24h, algunas lejanas,
-- algunas ya completadas, una eliminada)
-- =========================================================
INSERT INTO HOR_Tarea (TAR_Nombre, TAR_Descripcion, TAR_Completada, TAR_Prioridad, TAR_TiempoEstimado, TAR_FechaLimite, TAR_HoraLimite, TAR_Evidencia, TAR_Bookmarked, TAR_Eliminada, USU_Id, EQU_Id)
VALUES
('Campaña de lanzamiento', 'Planear el calendario de contenido para el lanzamiento del producto', FALSE, 'Alta', '3 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 4 HOUR), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 4 HOUR), '%H:%i'),
    NULL, TRUE, FALSE, 11, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital')),
('Diseñar posts para Instagram', 'Set de 5 piezas gráficas para la semana', FALSE, 'Media', '2 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 2 DAY), '%Y-%m-%d'), '15:00',
    NULL, FALSE, FALSE, 13, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital')),
('Redactar copy para newsletter', 'Boletín mensual con novedades del equipo', FALSE, 'Baja', '1 hora',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 10 DAY), '%Y-%m-%d'), '12:00',
    NULL, FALSE, FALSE, 12, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital')),
('Ejecutar pruebas de regresión', 'Suite completa antes del release 2.3', FALSE, 'Alta', '5 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 20 HOUR), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 20 HOUR), '%H:%i'),
    NULL, TRUE, FALSE, 14, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing')),
('Reportar bugs del sprint', 'Documentar bugs encontrados en Jira', FALSE, 'Media', '1 h 30 min',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 5 DAY), '%Y-%m-%d'), '17:00',
    NULL, FALSE, FALSE, 15, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing')),
('Pruebas de carga', 'Simular 500 usuarios concurrentes en staging', TRUE, 'Alta', '4 horas',
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 2 DAY), '%Y-%m-%d'), '18:00',
    NULL, FALSE, FALSE, 16, (SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing')),
('Refactor de autenticación', 'Migrar el login a JWT con refresh tokens', FALSE, 'Media', '6 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 4 DAY), '%Y-%m-%d'), '20:00',
    NULL, FALSE, FALSE, 17, 1),
('Ilustrar íconos del onboarding', 'Set de 8 íconos estilo line-art', FALSE, 'Baja', '3 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 6 DAY), '%Y-%m-%d'), '13:00',
    NULL, FALSE, FALSE, 18, 2),
('Preparar demo para el cliente', 'Ensayar el flujo completo antes de la presentación', FALSE, 'Alta', '1 hora',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 45 MINUTE), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 45 MINUTE), '%H:%i'),
    NULL, TRUE, FALSE, 1, 1),
('Tarea vieja archivada', 'Ya no aplica, se descartó en retro', FALSE, 'Baja', '30 min',
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 15 DAY), '%Y-%m-%d'), '09:00',
    NULL, FALSE, TRUE, 1, NULL);

-- =========================================================
-- HOR_Evidencia — evidencias adjuntas a un par de tareas
-- (EVI_Data es un data URL base64 recortado, solo para pruebas visuales)
-- =========================================================
INSERT INTO HOR_Evidencia (TAR_Id, EVI_Nombre, EVI_Tipo, EVI_Data)
VALUES
((SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Pruebas de carga' AND USU_Id = 16 LIMIT 1),
    'reporte_carga.png', 'image/png',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
((SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'MVP' AND USU_Id = 6 LIMIT 1),
    'evidencia_mvp.pdf', 'application/pdf',
    'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+');

-- =========================================================
-- HOR_Actividad — historial variado (completadas, pospuestas,
-- evidencias subidas, alertas) para varios usuarios
-- =========================================================
INSERT INTO HOR_Actividad (USU_Id, TAR_Id, ACT_Tipo, ACT_Titulo, ACT_Descripcion, ACT_SegundosAntesLimite, ACT_Fecha)
VALUES
(16, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Pruebas de carga' AND USU_Id = 16 LIMIT 1),
    'completada', 'Completaste', 'Pruebas de carga', NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(11, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Campaña de lanzamiento' AND USU_Id = 11 LIMIT 1),
    'pospuesta', 'Pospusiste', 'Campaña de lanzamiento', 1800, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(14, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Ejecutar pruebas de regresión' AND USU_Id = 14 LIMIT 1),
    'alerta', 'Alerta de desvío', 'Detectamos inactividad en Ejecutar pruebas de regresión', NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Pruebas de carga' AND USU_Id = 16 LIMIT 1),
    'evidencia', 'Evidencia subida', 'reporte_carga.png', NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(17, NULL, 'pospuesta', 'Pospusiste', 'Refactor de autenticación', 3600, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, NULL, 'completada', 'Completaste', 'Revisión de moodboard', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =========================================================
-- HOR_RoadmapItem — gantt de ejemplo para 2 equipos
-- =========================================================
INSERT INTO HOR_RoadmapItem (EQU_Id, TAR_Id, RMI_Nombre, RMI_Seccion, RMI_Estado, RMI_FechaInicio, RMI_FechaFin, RMI_EsHito, RMI_Etiqueta)
VALUES
(1, NULL, 'Planificación de Sprint 4', 'Planificación', 'completado', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY), FALSE, 'Backend'),
(1, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Refactor de autenticación' AND USU_Id = 17 LIMIT 1),
    'Refactor de autenticación', 'Desarrollo', 'en_progreso', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 4 DAY), FALSE, 'Backend'),
(1, NULL, 'Entrega Sprint 4', 'Entrega', 'sin_iniciar', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), TRUE, 'Hito'),
(2, NULL, 'Investigación de usuarios', 'Estrategia', 'completado', DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 9 DAY), FALSE, 'Diseño'),
(2, (SELECT TAR_Id FROM HOR_Tarea WHERE TAR_Nombre = 'Ilustrar íconos del onboarding' AND USU_Id = 18 LIMIT 1),
    'Ilustrar íconos del onboarding', 'Producción', 'en_progreso', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 DAY), FALSE, 'Diseño');

-- =========================================================
-- HOR_GoogleToken — tokens ficticios para 2 usuarios ya
-- "conectados" a Google Calendar
-- =========================================================
INSERT INTO HOR_GoogleToken (USU_Id, GTK_AccessToken, GTK_RefreshToken, GTK_TokenExpiry, GTK_Scopes, GTK_Correo)
VALUES
(1, 'ya29.FAKE_ACCESS_TOKEN_CARLOS', '1//FAKE_REFRESH_TOKEN_CARLOS', DATE_ADD(NOW(), INTERVAL 1 HOUR), 'https://www.googleapis.com/auth/calendar.events', 'carlos@horworks.com'),
(6, 'ya29.FAKE_ACCESS_TOKEN_KOKO',   '1//FAKE_REFRESH_TOKEN_KOKO',   DATE_ADD(NOW(), INTERVAL 1 HOUR), 'https://www.googleapis.com/auth/calendar.events', 'koko@gmail.com');

-- =========================================================
-- HOR_InvitacionEquipo — invitaciones pendientes/aceptadas
-- para unirse a un equipo
-- =========================================================
INSERT INTO HOR_InvitacionEquipo (EQU_Id, USU_Id, INV_Estado, INV_Fecha)
VALUES
((SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de Marketing Digital'), 5, 'pendiente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
((SELECT EQU_Id FROM HOR_Equipo WHERE EQU_Nombre = 'Equipo de QA / Testing'), 3, 'pendiente', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 4, 'rechazada', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =========================================================
-- HOR_InvitacionAuditor — invitaciones para volverse auditor
-- de un equipo/organización
-- =========================================================
INSERT INTO HOR_InvitacionAuditor (INV_RemitenteId, INV_CorreoDestino, INV_Token, INV_Estado, INV_FechaCreacion, INV_FechaRespuesta)
VALUES
(1, 'nuevo.auditor1@horworks.com', 'tok_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'pendiente', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL),
(11, 'auditora.marketing@horworks.com', 'tok_f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3', 'aceptada', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));
