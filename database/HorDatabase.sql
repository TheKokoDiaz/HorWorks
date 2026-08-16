/* 
    DATOS DE CONEXIÓN:
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

-- Obligamos a la sesión a hablar en UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

/* =========================================================
   1. CREACIÓN DE TABLAS
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
    
    PRIMARY KEY(USU_Id)
);

CREATE TABLE HOR_Equipo(
    EQU_Id          INT             AUTO_INCREMENT,
    EQU_Nombre      VARCHAR(40)     NOT NULL,
    EQU_Foto        VARCHAR(255),
    EQU_Descripcion VARCHAR(255),
    EQU_Organizacion VARCHAR(100),
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
   2. INSERCIÓN DE REGISTROS DE PRUEBA
========================================================= */

INSERT INTO HOR_Usuario (USU_Nombre, USU_Usuario, USU_Correo, USU_Contrasenia, USU_Foto, USU_Rol, USU_Estado, USU_Tickets)
VALUES 
('Carlos Mendoza', 'carlos_auditor', 'carlos@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 'Auditor', 1, 5),
('Ana Rodríguez', 'ana_auditora', 'ana@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', 'Auditor', 1, 3),
('Juan Pérez', 'juan_dev', 'juan@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan', 'Alumno', 1, 10),
('Sofía López', 'sofia_design', 'sofia@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', 'Alumno', 1, 2),
('Cliente', 'cliente_prueba', 'cliente@gmail.com', '1234567890', NULL, 'Alumno', 1, 5),
('Koko Díaz', 'kokko70128', 'koko@gmail.com', '1234567890', NULL, 'Alumno', 1, 5);

INSERT INTO HOR_Equipo (EQU_Nombre, EQU_Foto, EQU_Auditor)
VALUES 
('Equipo de Desarrollo Backend', 'https://api.dicebear.com/7.x/identicon/svg?seed=Backend', 1),
('Equipo de Diseño UI/UX', 'https://api.dicebear.com/7.x/identicon/svg?seed=Design', 2);

INSERT INTO HOR_Grupos (USU_Id, EQU_Id, GRU_Rol)
VALUES 
(1, 1, 'Líder de Equipo'),
(3, 1, 'Desarrollador Backend'),
(2, 2, 'Líder de Diseño'),
(4, 2, 'Diseñadora UI/UX');

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
('MVP', 'Crea un mínimo entregable del proyecto', FALSE, 'Alta', '2 horas', '2026-08-10', '18:00', NULL, TRUE, 6, NULL),
('Diseño de FrontEnd', 'Ponte creativo y realiza la interfaz', FALSE, 'Media', '4 horas', '2026-08-15', '23:59', NULL, FALSE, 6, NULL),
('Entrega de reporte de proyecto', 'Redactar y enviar el reporte semanal del Sprint', FALSE, 'Alta', '2 horas',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 6 HOUR), '%Y-%m-%d'), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 6 HOUR), '%H:%i'),
    NULL, TRUE, 1, 1),
('Revisión de Pull Requests', 'Revisar los PRs pendientes del equipo backend', FALSE, 'Media', '1 hora',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 3 DAY), '%Y-%m-%d'), '17:00',
    NULL, FALSE, 1, 1),
('Documentar API', 'Actualizar la documentación de los endpoints nuevos', FALSE, 'Baja', '1 h 30 min',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 7 DAY), '%Y-%m-%d'), '12:00',
    NULL, FALSE, 1, 1),
('Actualizar dependencias', 'Revisar y actualizar librerías con vulnerabilidades', TRUE, 'Media', '45 min',
    DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), '%Y-%m-%d'), '10:00',
    NULL, FALSE, 1, NULL);

INSERT INTO HOR_Actividad (USU_Id, TAR_Id, ACT_Tipo, ACT_Titulo, ACT_Descripcion, ACT_SegundosAntesLimite, ACT_Fecha)
VALUES
(1, NULL, 'completada', 'Completaste', 'Actualizar dependencias', NULL, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, NULL, 'pospuesta', 'Pospusiste', 'Reunión con el equipo', 900, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(1, NULL, 'evidencia', 'Evidencia subida', 'Gym.png', NULL, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(1, NULL, 'alerta', 'Alerta de desvío', 'Detectamos inactividad', NULL, DATE_SUB(NOW(), INTERVAL 55 MINUTE));

DELIMITER //

CREATE PROCEDURE SP_IniciarSesion(
    IN INI_Correo VARCHAR(80),
    IN INI_Contrasenia VARCHAR(80)
)
BEGIN
    IF EXISTS(SELECT 1 FROM HOR_Usuario WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia) THEN
        SELECT 
            USU_Id AS Id,
            USU_Nombre AS Nombre,
            USU_Usuario AS Usuario,
            USU_Correo AS Correo,
            USU_Foto AS Foto,
            USU_Rol AS Rol,
            USU_Estado AS Estado,
            USU_Tickets AS Tickets
        FROM HOR_Usuario 
        WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia;
    ELSE
        SELECT 0 AS Id;
    END IF;
END //

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE SP_VerTareasPendientes(
    IN p_Usuario_Id INT
)
BEGIN
    SELECT 
        TAR_Id              Id,
        TAR_Nombre          Nombre,
        TAR_Descripcion     Descripcion,
        TAR_Prioridad       Prioridad,
        TAR_TiempoEstimado  TiempoEstimado,
        TAR_FechaLimite     FechaLimite,
        TAR_HoraLimite      HoraLimite,
        TAR_Evidencia       Evidencia,
        TAR_Bookmarked      Bookmarked,
        EQU_Id              EquipoId
    FROM HOR_Tarea 
    WHERE USU_Id = p_Usuario_Id AND TAR_Completada = FALSE;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE SP_VerTareasCompletas(
    IN p_Usuario_Id INT
)
BEGIN
    SELECT 
        TAR_Id              Id,
        TAR_Nombre          Nombre,
        TAR_Descripcion     Descripcion,
        TAR_Prioridad       Prioridad,
        TAR_TiempoEstimado  TiempoEstimado,
        TAR_FechaLimite     FechaLimite,
        TAR_HoraLimite      HoraLimite,
        TAR_Evidencia       Evidencia,
        TAR_Bookmarked      Bookmarked,
        EQU_Id              EquipoId
    FROM HOR_Tarea 
    WHERE USU_Id = p_Usuario_Id AND TAR_Completada = TRUE;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE SP_CrearTarea(
    IN p_Usuario_Id         INT,
    IN p_Nombre             VARCHAR(100),
    IN p_Descripcion        TEXT,
    IN p_Prioridad          VARCHAR(20),
    IN p_TiempoEstimado     VARCHAR(50),
    IN p_FechaLimite        VARCHAR(50),
    IN p_HoraLimite         VARCHAR(50),
    IN p_Evidencia          VARCHAR(255),
    IN p_Bookmarked         BOOL,
    IN p_Equipo_Id          INT
)
BEGIN
    INSERT INTO HOR_Tarea (
        TAR_Nombre, 
        TAR_Descripcion, 
        TAR_Completada, 
        TAR_Prioridad, 
        TAR_TiempoEstimado, 
        TAR_FechaLimite, 
        TAR_HoraLimite,
        TAR_Evidencia, 
        TAR_Bookmarked, 
        USU_Id, 
        EQU_Id
    ) VALUES (
        p_Nombre, 
        p_Descripcion, 
        FALSE, 
        IFNULL(p_Prioridad, 'Media'), 
        p_TiempoEstimado, 
        p_FechaLimite, 
        p_HoraLimite,
        p_Evidencia, 
        IFNULL(p_Bookmarked, FALSE), 
        p_Usuario_Id, 
        p_Equipo_Id
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE SP_ObtenerAjustesUsuario(IN p_usuario_id INT)
BEGIN
    SELECT 
        u.USU_Nombre, u.USU_Correo, u.USU_Foto, u.USU_Tickets,
        a.AJU_Tema, a.AJU_Idioma, a.AJU_ZonaHoraria, a.AJU_FormatoHora,
        a.AJU_NotiPersistente, a.AJU_NotiSonido, a.AJU_NotiDesvio, a.AJU_NotiCorreo,
        aud.USU_Nombre AS Auditor_Nombre, aud.USU_Correo AS Auditor_Correo, aud.USU_Foto AS Auditor_Foto
    FROM HOR_Usuario u
    LEFT JOIN HOR_Ajustes a ON u.USU_Id = a.USU_Id
    LEFT JOIN HOR_Grupos g ON u.USU_Id = g.USU_Id
    LEFT JOIN HOR_Equipo e ON g.EQU_Id = e.EQU_Id
    LEFT JOIN HOR_Usuario aud ON e.EQU_Auditor = aud.USU_Id
    WHERE u.USU_Id = p_usuario_id;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE SP_ActualizarPreferencias(
    IN p_usuario_id INT,
    IN p_tema VARCHAR(20),
    IN p_idioma VARCHAR(10),
    IN p_formato INT,
    IN p_persistente BOOL,
    IN p_sonido BOOL,
    IN p_desvio BOOL,
    IN p_correo BOOL
)
BEGIN
    UPDATE HOR_Ajustes 
    SET 
        AJU_Tema = p_tema,
        AJU_Idioma = p_idioma,
        AJU_FormatoHora = p_formato,
        AJU_NotiPersistente = p_persistente,
        AJU_NotiSonido = p_sonido,
        AJU_NotiDesvio = p_desvio,
        AJU_NotiCorreo = p_correo
    WHERE USU_Id = p_usuario_id;
END $$

DELIMITER ;

-- =========================================================
-- ROADMAP (gantt por proyecto) Y TOKENS DE GOOGLE CALENDAR
-- Agregado junto con la capa de servicios (services/) del backend.
-- Si tu contenedor de MySQL ya existía de antes, este archivo NO se
-- vuelve a ejecutar solo (docker-entrypoint-initdb.d solo corre en un
-- volumen vacio). Corre esto a mano una vez, o mata el volumen con (PowerShell):
--     docker-compose down -v
--     docker-compose up --build
-- (perderas los datos de prueba que ya tengas).
-- =========================================================

ALTER TABLE HOR_Tarea
    ADD COLUMN TAR_GoogleEventId VARCHAR(255) NULL;

CREATE TABLE HOR_RoadmapItem(
    RMI_Id              INT             AUTO_INCREMENT,
    EQU_Id              INT             NOT NULL,
    TAR_Id              INT             NULL,
    RMI_Nombre          VARCHAR(120)    NOT NULL,
    RMI_Seccion         VARCHAR(60)     NOT NULL DEFAULT 'General',
    RMI_Estado          VARCHAR(20)     NOT NULL DEFAULT 'sin_iniciar',
    RMI_FechaInicio     DATE            NOT NULL,
    RMI_FechaFin        DATE            NOT NULL,
    RMI_EsHito          BOOL            NOT NULL DEFAULT FALSE,
    RMI_Etiqueta        VARCHAR(120),
    RMI_GoogleEventId   VARCHAR(255),

    PRIMARY KEY(RMI_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id) ON DELETE CASCADE,
    FOREIGN KEY(TAR_Id) REFERENCES HOR_Tarea(TAR_Id) ON DELETE SET NULL
);

CREATE TABLE HOR_GoogleToken(
    USU_Id              INT             NOT NULL,
    GTK_AccessToken     TEXT            NOT NULL,
    GTK_RefreshToken    TEXT,
    GTK_TokenExpiry     DATETIME,
    GTK_Scopes          VARCHAR(255),
    GTK_Correo          VARCHAR(120),

    PRIMARY KEY(USU_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id) ON DELETE CASCADE
);


-- =========================================================
-- SISTEMA DE AUDITOR + EQUIPOS/PROYECTOS COMPLETOS
-- Igual que el bloque anterior: si tu volumen de MySQL ya existia, corre
-- esto a mano una vez, o "docker-compose down -v" para reiniciar limpio.
-- =========================================================

ALTER TABLE HOR_Usuario
    ADD COLUMN USU_AuditorId INT NULL,
    ADD FOREIGN KEY (USU_AuditorId) REFERENCES HOR_Usuario(USU_Id) ON DELETE SET NULL;

-- EQU_Descripcion y EQU_Organizacion ya se definen en el CREATE TABLE
-- HOR_Equipo de arriba (líneas 37-45); este ALTER quedó duplicado de
-- cuando esas columnas se agregaron por primera vez y hacía que todo el
-- script abortara aquí con "Duplicate column name 'EQU_Descripcion'",
-- por lo que NINGUNA instrucción posterior se llegaba a ejecutar: ni la
-- tabla de invitaciones ni los 20 usuarios de ejemplo (Mariana, Diego,
-- Valeria, Emiliano, etc.) que aparecen más abajo en este mismo archivo.

CREATE TABLE HOR_InvitacionEquipo(
    INV_Id          INT             AUTO_INCREMENT,
    EQU_Id          INT             NOT NULL,
    USU_Id          INT             NOT NULL,
    INV_Estado      VARCHAR(20)     NOT NULL DEFAULT 'pendiente',
    INV_Fecha       DATETIME        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(INV_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id) ON DELETE CASCADE,
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id) ON DELETE CASCADE
);

CREATE TABLE HOR_InvitacionAuditor(
    INV_Id              INT             AUTO_INCREMENT,
    INV_RemitenteId     INT             NOT NULL,
    INV_CorreoDestino   VARCHAR(120)    NOT NULL,
    INV_Token           VARCHAR(64)     NOT NULL UNIQUE,
    INV_Estado          VARCHAR(20)     NOT NULL DEFAULT 'pendiente',
    INV_FechaCreacion   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    INV_FechaRespuesta  DATETIME        NULL,

    PRIMARY KEY(INV_Id),
    FOREIGN KEY(INV_RemitenteId) REFERENCES HOR_Usuario(USU_Id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 20 usuarios de ejemplo (quedan con USU_Id 7..26, porque ya
-- existian 6 usuarios antes de este bloque)
-- ---------------------------------------------------------
INSERT INTO HOR_Usuario (USU_Nombre, USU_Usuario, USU_Correo, USU_Contrasenia, USU_Foto, USU_Rol, USU_Estado, USU_Tickets)
VALUES
('Mariana Torres',    'mariana_t',    'mariana.torres@horworks.com',  '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana',  'Alumno',  1, 5),
('Diego Ramírez',     'diego_ram',    'diego.ramirez@horworks.com',   '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',    'Alumno',  1, 5),
('Valeria Cruz',      'vale_cruz',    'valeria.cruz@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valeria',  'Alumno',  1, 5),
('Emiliano Flores',   'emi_flores',   'emiliano.flores@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emiliano', 'Alumno',  1, 5),
('Renata Gómez',      'renata_g',     'renata.gomez@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Renata',   'Alumno',  1, 5),
('Sebastián Ortiz',   'seba_ortiz',   'sebastian.ortiz@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian','Alumno',  1, 5),
('Ximena Reyes',      'xime_reyes',   'ximena.reyes@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ximena',   'Alumno',  1, 5),
('Iker Morales',      'iker_mo',      'iker.morales@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iker',     'Alumno',  1, 5),
('Fernanda Castro',   'fer_castro',   'fernanda.castro@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda', 'Alumno',  1, 5),
('Leonardo Vargas',   'leo_vargas',   'leonardo.vargas@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leonardo', 'Alumno',  1, 5),
('Camila Rojas',      'cami_rojas',   'camila.rojas@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camila',   'Alumno',  1, 5),
('Máximo Herrera',    'maxi_h',       'maximo.herrera@horworks.com',  '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maximo',   'Alumno',  1, 5),
('Regina Salazar',    'regina_s',     'regina.salazar@horworks.com',  '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Regina',   'Alumno',  1, 5),
('Adrián Navarro',    'adrian_nav',   'adrian.navarro@horworks.com',  '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adrian',   'Alumno',  1, 5),
('Paula Jiménez',     'paula_j',      'paula.jimenez@horworks.com',   '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula',    'Alumno',  1, 5),
('Rodrigo Vega',      'rodri_vega',   'rodrigo.vega@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rodrigo',  'Alumno',  1, 5),
('Isabela Domínguez', 'isa_dom',      'isabela.dominguez@horworks.com','1234','https://api.dicebear.com/7.x/avataaars/svg?seed=Isabela',  'Alumno',  1, 5),
('Gael Espinoza',     'gael_esp',     'gael.espinoza@horworks.com',   '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gael',     'Alumno',  1, 5),
('Profe. Laura Núñez','laura_nunez',  'laura.nunez@horworks.com',     '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',    'Auditor', 1, 5),
('Tutor Ricardo Peña','ricardo_pena', 'ricardo.pena@horworks.com',    '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo',  'Auditor', 1, 5);

INSERT INTO HOR_Ajustes (USU_Id, AJU_Tema, AJU_Idioma, AJU_ZonaHoraria, AJU_FormatoHora, AJU_NotiPersistente, AJU_NotiSonido, AJU_NotiDesvio, AJU_NotiCorreo)
VALUES
(7,  'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(8,  'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(9,  'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(10, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(11, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(12, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(13, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(14, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(15, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(16, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(17, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(18, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(19, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(20, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(21, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(22, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(23, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(24, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(25, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(26, 'azul', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1);

-- Metemos a algunos de los usuarios nuevos como miembros de los 2 equipos
-- de ejemplo que ya existian, para que se vea el roster lleno de una vez
INSERT INTO HOR_Grupos (USU_Id, EQU_Id, GRU_Rol)
VALUES
(7, 1, 'Desarrolladora Frontend'),
(8, 1, 'QA / Testing'),
(9, 2, 'Diseñadora de Producto'),
(10, 2, 'Ilustrador');
