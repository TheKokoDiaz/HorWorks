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
    USU_Nombre          NVARCHAR(30)    NOT NULL,
    USU_Usuario         NVARCHAR(30)    NOT NULL    UNIQUE,
    USU_Correo          NVARCHAR(80)    NOT NULL    UNIQUE,
    USU_Contrasenia     NVARCHAR(80)    NOT NULL,
    USU_Foto            NVARCHAR(255),
    USU_Rol             NVARCHAR(20)    NOT NULL    DEFAULT 'Alumno',
    USU_Estado          BOOL            NOT NULL    DEFAULT 1,
    USU_Tickets         INT             DEFAULT 5,
    
    PRIMARY KEY(USU_Id)
);

CREATE TABLE HOR_Equipo(
    EQU_Id          INT             AUTO_INCREMENT,
    EQU_Nombre      NVARCHAR(40)    NOT NULL,
    EQU_Foto        NVARCHAR(255),
    EQU_Auditor     INT             NOT NULL,
    
    PRIMARY KEY(EQU_Id)
);

CREATE TABLE HOR_Grupos(
    USU_Id          INT     NOT NULL,
    EQU_Id          INT     NOT NULL,
    
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id)
);

CREATE TABLE HOR_Tarea(
    TAR_Id              INT             AUTO_INCREMENT,
    TAR_Nombre          NVARCHAR(100)   NOT NULL,
    TAR_Icono           NVARCHAR(50)    DEFAULT 'folder',
    TAR_Descripcion     TEXT,
    TAR_Completada      BOOL            DEFAULT FALSE,
    TAR_Prioridad       NVARCHAR(20)    DEFAULT 'Media',
    TAR_TiempoEstimado  NVARCHAR(50),
    TAR_FechaLimite     NVARCHAR(50),
    TAR_HoraLimite      NVARCHAR(50),
    TAR_Evidencia       NVARCHAR(255)   NULL,
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
    EVI_Nombre          NVARCHAR(255)   NOT NULL,
    EVI_Tipo            NVARCHAR(100),
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

INSERT INTO HOR_Grupos (USU_Id, EQU_Id)
VALUES 
(1, 1),
(3, 1),
(2, 2),
(4, 2);

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
('Diseño de FrontEnd', 'Ponte creativo y realiza la interfaz', FALSE, 'Media', '4 horas', '2026-08-15', '23:59', NULL, FALSE, 6, NULL);

/* =========================================================
   3. PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES)
========================================================= */

DELIMITER $$

CREATE PROCEDURE SP_IniciarSesion(
    IN INI_Correo       VARCHAR(80),
    IN INI_Contrasenia  VARCHAR(80)
)
BEGIN
    IF EXISTS(SELECT 1 FROM HOR_Usuario WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia) THEN
        SELECT 
            USU_Id          Id,
            USU_Nombre      Nombre,
            USU_Usuario     Usuario,
            USU_Correo      Correo,
            USU_Foto        Foto,
            USU_Rol         Rol,
            USU_Estado      Estado,
            USU_Tickets     Tickets
        FROM HOR_Usuario 
        WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia;
    ELSE
        SELECT 0 Id;
    END IF;
END$$

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
END$$

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
END$$

CREATE PROCEDURE SP_CrearTarea(
    IN p_Usuario_Id         INT,
    IN p_Nombre             NVARCHAR(100),
    IN p_Descripcion         TEXT,
    IN p_Prioridad           NVARCHAR(20),
    IN p_TiempoEstimado     NVARCHAR(50),
    IN p_FechaLimite        NVARCHAR(50),
    IN p_HoraLimite         NVARCHAR(50),
    IN p_Evidencia          NVARCHAR(255),
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
END$$

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
END$$

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
END$$

DELIMITER ;