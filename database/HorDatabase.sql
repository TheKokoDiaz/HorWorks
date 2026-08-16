/* 
    DATOS DE CONEXION:
    host     = "127.0.0.1"
    user     = "root"
    password = ""
    database = "DB_HORWORKS"
    port     = 3306
*/

/* BASE DE DATOS */
DROP DATABASE IF EXISTS DB_HORWORKS;
CREATE DATABASE DB_HORWORKS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE DB_HORWORKS;

-- Obligamos a la sesion a hablar en UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

/* =========================================================
   1. CREACION DE TABLAS
========================================================= */

CREATE TABLE HOR_Usuario(
    USU_Id              INT             AUTO_INCREMENT,
    USU_Nombre          VARCHAR(30)     NOT NULL,
    USU_Usuario         VARCHAR(30)     NOT NULL    UNIQUE,
    USU_Correo          VARCHAR(80)     NOT NULL    UNIQUE,
    USU_Contrasenia     VARCHAR(80)     NOT NULL,
    USU_Foto            VARCHAR(255),
    USU_Rol             VARCHAR(20)     NOT NULL    DEFAULT 'Alumno',
    USU_Estado          BOOL            NOT NULL    DEFAULT 1,
    USU_Tickets         INT             DEFAULT 5,

    -- Google Calendar: refresh_token de OAuth (permite pedir nuevos access_token
    -- sin que el usuario vuelva a autorizar) y el correo de Google conectado,
    -- que no siempre es el mismo que USU_Correo.
    USU_Google_RefreshToken TEXT        NULL,
    USU_Google_Email        VARCHAR(120) NULL,

    PRIMARY KEY(USU_Id)
);

CREATE TABLE HOR_Equipo(
    EQU_Id          INT             AUTO_INCREMENT,
    EQU_Nombre      VARCHAR(40)     NOT NULL,
    EQU_Foto        VARCHAR(255),
    EQU_Auditor     INT             NOT NULL,
    
    PRIMARY KEY(EQU_Id)
);

CREATE TABLE HOR_Grupos(
    GRU_Id          INT             AUTO_INCREMENT,
    USU_Id          INT             NOT NULL,
    EQU_Id          INT             NOT NULL,
    GRU_Rol         VARCHAR(40)     DEFAULT 'Colaborador',
    
    PRIMARY KEY(GRU_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id)
);

CREATE TABLE HOR_Tarea(
    TAR_Id              INT             AUTO_INCREMENT,
    TAR_Nombre          VARCHAR(100)    NOT NULL,
    TAR_Icono           VARCHAR(50)     DEFAULT 'folder',
    TAR_Descripcion     TEXT,
    TAR_Completada      BOOL            DEFAULT FALSE,
    TAR_Prioridad       VARCHAR(20)     DEFAULT 'Media',
    TAR_TiempoEstimado  VARCHAR(50),
    TAR_FechaLimite     VARCHAR(50),
    TAR_HoraLimite      VARCHAR(50),
    TAR_Evidencia       VARCHAR(255)    NULL,
    TAR_Bookmarked      BOOL            DEFAULT FALSE,
    TAR_Eliminada       BOOL            DEFAULT FALSE,
    USU_Id              INT             NOT NULL,
    EQU_Id              INT             NULL,

    -- Id del evento creado en Google Calendar cuando la tarea se sincroniza
    -- (NULL si el usuario no tiene Google Calendar conectado, o la tarea no
    -- tiene fecha límite todavía). Sirve para poder actualizar/borrar el
    -- evento correcto después.
    TAR_GoogleEventId   VARCHAR(255)    NULL,
    
    PRIMARY KEY(TAR_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id)
);

CREATE TABLE HOR_Evidencia(
    EVI_Id              INT             AUTO_INCREMENT,
    TAR_Id              INT             NOT NULL,
    EVI_Nombre          VARCHAR(255)    NOT NULL,
    EVI_Tipo            VARCHAR(100),
    EVI_Data            LONGTEXT        NOT NULL,
    EVI_FechaSubida     DATETIME        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(EVI_Id),
    FOREIGN KEY(TAR_Id) REFERENCES HOR_Tarea(TAR_Id) ON DELETE CASCADE
);

CREATE TABLE HOR_Ajustes(
    USU_Id              INT,
    AJU_Tema            VARCHAR(20) DEFAULT 'azul',
    AJU_Idioma          VARCHAR(10) DEFAULT 'es-MX',
    AJU_ZonaHoraria     VARCHAR(30) DEFAULT 'GMT-06:00',
    AJU_FormatoHora     INT DEFAULT 24,
    AJU_NotiPersistente BOOL DEFAULT 1,
    AJU_NotiSonido      BOOL DEFAULT 1,
    AJU_NotiDesvio      BOOL DEFAULT 1,
    AJU_NotiCorreo      BOOL DEFAULT 1,
    
    PRIMARY KEY(USU_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id)
);

CREATE TABLE HOR_Actividad(
    ACT_Id                  INT             AUTO_INCREMENT,
    USU_Id                  INT             NOT NULL,
    TAR_Id                  INT             NULL,
    ACT_Tipo                VARCHAR(20)     NOT NULL,
    ACT_Titulo              VARCHAR(80)     NOT NULL,
    ACT_Descripcion         VARCHAR(255),
    ACT_SegundosAntesLimite INT             NULL,
    ACT_Fecha               DATETIME        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(ACT_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id),
    FOREIGN KEY(TAR_Id) REFERENCES HOR_Tarea(TAR_Id) ON DELETE SET NULL
);

/* =========================================================
   2. INSERCION DE REGISTROS DE PRUEBA
========================================================= */

INSERT INTO HOR_Usuario (USU_Nombre, USU_Usuario, USU_Correo, USU_Contrasenia, USU_Foto, USU_Rol, USU_Estado, USU_Tickets)
VALUES 
('Carlos Mendoza', 'carlos_auditor', 'carlos@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 'Auditor', 1, 5),
('Ana Rodriguez', 'ana_auditora', 'ana@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', 'Auditor', 1, 3),
('Juan Perez', 'juan_dev', 'juan@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan', 'Alumno', 1, 10),
('Sofia Lopez', 'sofia_design', 'sofia@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', 'Alumno', 1, 2),
('Cliente', 'cliente_prueba', 'cliente@gmail.com', '1234567890', NULL, 'Alumno', 1, 5),
('Koko Diaz', 'kokko70128', 'koko@gmail.com', '1234567890', NULL, 'Alumno', 1, 5);

INSERT INTO HOR_Equipo (EQU_Nombre, EQU_Foto, EQU_Auditor)
VALUES 
('Equipo de Desarrollo Backend', 'https://api.dicebear.com/7.x/identicon/svg?seed=Backend', 1),
('Equipo de Diseno UI/UX', 'https://api.dicebear.com/7.x/identicon/svg?seed=Design', 2);

INSERT INTO HOR_Grupos (USU_Id, EQU_Id, GRU_Rol)
VALUES 
(1, 1, 'Lider de Equipo'),
(3, 1, 'Desarrollador Backend'),
(2, 2, 'Lider de Diseno'),
(4, 2, 'Disenadora UI/UX');

INSERT INTO HOR_Ajustes (USU_Id, AJU_Tema, AJU_Idioma, AJU_ZonaHoraria, AJU_FormatoHora, AJU_NotiPersistente, AJU_NotiSonido, AJU_NotiDesvio, AJU_NotiCorreo)
VALUES 
(1, 'verde', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(2, 'azul', 'es-MX', 'GMT-06:00', 12, 1, 1, 1, 1),
(3, 'azul', 'en-US', 'GMT-05:00', 24, 0, 1, 0, 0),
(4, 'naranja', 'es-MX', 'GMT-06:00', 12, 1, 1, 1, 1),
(5, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(6, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1);

INSERT INTO HOR_Tarea (TAR_Nombre, TAR_Descripcion, TAR_Completada, TAR_Prioridad, TAR_TiempoEstimado, TAR_FechaLimite, TAR_HoraLimite, TAR_Evidencia, TAR_Bookmarked, USU_Id, EQU_Id) 
VALUES
('MVP', 'Crea un minimo entregable del proyecto', FALSE, 'Alta', '2 horas', '2026-08-10', '18:00', NULL, TRUE, 6, NULL),
('Diseno de FrontEnd', 'Ponte creativo y realiza la interfaz', FALSE, 'Media', '4 horas', '2026-08-15', '23:59', NULL, FALSE, 6, NULL),
('Entrega de reporte de proyecto', 'Redactar y enviar el reporte semanal del Sprint', FALSE, 'Alta', '2 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 6 HOUR), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 6 HOUR), '%H:%i'),
    NULL, TRUE, 1, 1),
('Revision de Pull Requests', 'Revisar los PRs pendientes del equipo backend', FALSE, 'Media', '1 hora',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 3 DAY), '%Y-%m-%d'), '17:00',
    NULL, FALSE, 1, 1),
('Documentar API', 'Actualizar la documentacion de los endpoints nuevos', FALSE, 'Baja', '1 h 30 min',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 7 DAY), '%Y-%m-%d'), '12:00',
    NULL, FALSE, 1, 1),
('Actualizar dependencias', 'Revisar y actualizar librerias con vulnerabilidades', TRUE, 'Media', '45 min',
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), '%Y-%m-%d'), '10:00',
    NULL, FALSE, 1, NULL);

INSERT INTO HOR_Actividad (USU_Id, TAR_Id, ACT_Tipo, ACT_Titulo, ACT_Descripcion, ACT_SegundosAntesLimite, ACT_Fecha)
VALUES
(1, NULL, 'completada', 'Completaste', 'Actualizar dependencias', NULL, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, NULL, 'pospuesta', 'Pospusiste', 'Reunion con el equipo', 900, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(1, NULL, 'evidencia', 'Evidencia subida', 'Gym.png', NULL, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, NULL, 'alerta', 'Alerta de desvio', 'Detectamos inactividad', NULL, DATE_SUB(NOW(), INTERVAL 55 MINUTE));

/* =========================================================
   3. PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES)
========================================================= */

/* =========================================================
   3. PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES)
========================================================= */

-- 1. AUTENTICACIÓN (Condensado usando funciones de agregación para simular el IF/ELSE)
CREATE PROCEDURE SP_IniciarSesion(IN INI_Correo VARCHAR(80), IN INI_Contrasenia VARCHAR(80))
    SELECT 
        IFNULL(MAX(USU_Id), 0) AS Id,
        MAX(USU_Nombre) AS Nombre,
        MAX(USU_Usuario) AS Usuario,
        MAX(USU_Correo) AS Correo,
        MAX(USU_Foto) AS Foto,
        MAX(USU_Rol) AS Rol,
        MAX(USU_Estado) AS Estado,
        MAX(USU_Tickets) AS Tickets
    FROM HOR_Usuario 
    WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia;

-- 2. TAREAS PENDIENTES
CREATE PROCEDURE SP_VerTareasPendientes(IN p_Usuario_Id INT)
    SELECT 
        TAR_Id AS Id, TAR_Nombre AS Nombre, TAR_Descripcion AS Descripcion, 
        TAR_Prioridad AS Prioridad, TAR_TiempoEstimado AS TiempoEstimado, 
        TAR_FechaLimite AS FechaLimite, TAR_HoraLimite AS HoraLimite, 
        TAR_Evidencia AS Evidencia, TAR_Bookmarked AS Bookmarked, EQU_Id AS EquipoId
    FROM HOR_Tarea 
    WHERE USU_Id = p_Usuario_Id AND TAR_Completada = FALSE;

-- 3. TAREAS COMPLETAS
CREATE PROCEDURE SP_VerTareasCompletas(IN p_Usuario_Id INT)
    SELECT 
        TAR_Id AS Id, TAR_Nombre AS Nombre, TAR_Descripcion AS Descripcion, 
        TAR_Prioridad AS Prioridad, TAR_TiempoEstimado AS TiempoEstimado, 
        TAR_FechaLimite AS FechaLimite, TAR_HoraLimite AS HoraLimite, 
        TAR_Evidencia AS Evidencia, TAR_Bookmarked AS Bookmarked, EQU_Id AS EquipoId
    FROM HOR_Tarea 
    WHERE USU_Id = p_Usuario_Id AND TAR_Completada = TRUE;

-- 4. CREAR TAREA
CREATE PROCEDURE SP_CrearTarea(
    IN p_Usuario_Id INT, IN p_Nombre VARCHAR(100), IN p_Descripcion TEXT, 
    IN p_Prioridad VARCHAR(20), IN p_TiempoEstimado VARCHAR(50), 
    IN p_FechaLimite VARCHAR(50), IN p_HoraLimite VARCHAR(50), 
    IN p_Evidencia VARCHAR(255), IN p_Bookmarked BOOL, IN p_Equipo_Id INT
)
    INSERT INTO HOR_Tarea (
        TAR_Nombre, TAR_Descripcion, TAR_Completada, TAR_Prioridad, 
        TAR_TiempoEstimado, TAR_FechaLimite, TAR_HoraLimite, 
        TAR_Evidencia, TAR_Bookmarked, USU_Id, EQU_Id
    ) VALUES (
        p_Nombre, p_Descripcion, FALSE, IFNULL(p_Prioridad, 'Media'), 
        p_TiempoEstimado, p_FechaLimite, p_HoraLimite, 
        p_Evidencia, IFNULL(p_Bookmarked, FALSE), p_Usuario_Id, p_Equipo_Id
    );

-- 5. OBTENER AJUSTES (Usando subconsultas con WHERE exclusivas)
CREATE PROCEDURE SP_ObtenerAjustesUsuario(IN p_usuario_id INT)
    SELECT 
        u.USU_Nombre, u.USU_Correo, u.USU_Foto, u.USU_Tickets,
        (SELECT AJU_Tema FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_Tema,
        (SELECT AJU_Idioma FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_Idioma,
        (SELECT AJU_ZonaHoraria FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_ZonaHoraria,
        (SELECT AJU_FormatoHora FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_FormatoHora,
        (SELECT AJU_NotiPersistente FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_NotiPersistente,
        (SELECT AJU_NotiSonido FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_NotiSonido,
        (SELECT AJU_NotiDesvio FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_NotiDesvio,
        (SELECT AJU_NotiCorreo FROM HOR_Ajustes WHERE USU_Id = u.USU_Id LIMIT 1) AS AJU_NotiCorreo,
        (SELECT aud.USU_Nombre FROM HOR_Usuario aud, HOR_Equipo e, HOR_Grupos g WHERE g.USU_Id = u.USU_Id AND g.EQU_Id = e.EQU_Id AND e.EQU_Auditor = aud.USU_Id LIMIT 1) AS Auditor_Nombre,
        (SELECT aud.USU_Correo FROM HOR_Usuario aud, HOR_Equipo e, HOR_Grupos g WHERE g.USU_Id = u.USU_Id AND g.EQU_Id = e.EQU_Id AND e.EQU_Auditor = aud.USU_Id LIMIT 1) AS Auditor_Correo,
        (SELECT aud.USU_Foto FROM HOR_Usuario aud, HOR_Equipo e, HOR_Grupos g WHERE g.USU_Id = u.USU_Id AND g.EQU_Id = e.EQU_Id AND e.EQU_Auditor = aud.USU_Id LIMIT 1) AS Auditor_Foto
    FROM HOR_Usuario u
    WHERE u.USU_Id = p_usuario_id;

-- 6. ACTUALIZAR PREFERENCIAS
CREATE PROCEDURE SP_ActualizarPreferencias(
    IN p_usuario_id INT, IN p_tema VARCHAR(20), IN p_idioma VARCHAR(10), 
    IN p_formato INT, IN p_persistente BOOL, IN p_sonido BOOL, 
    IN p_desvio BOOL, IN p_correo BOOL
)
    UPDATE HOR_Ajustes 
    SET AJU_Tema = p_tema, AJU_Idioma = p_idioma, AJU_FormatoHora = p_formato, 
        AJU_NotiPersistente = p_persistente, AJU_NotiSonido = p_sonido, 
        AJU_NotiDesvio = p_desvio, AJU_NotiCorreo = p_correo
    WHERE USU_Id = p_usuario_id;