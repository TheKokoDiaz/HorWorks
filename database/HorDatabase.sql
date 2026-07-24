/* 
	DATOS DE CONEXIÓN:
    host     = "127.0.0.1"
	user     = "root"
	password = ""
	database = "DB_HORWORKS"
	port     = 3306
*/

/* BASE DE DATOS */
-- DROP DATABASE DB_HORWORKS;
CREATE DATABASE DB_HORWORKS;
USE DB_HORWORKS;

/* TABLAS */
CREATE TABLE HOR_Usuario(
	USU_Id				INT				AUTO_INCREMENT,
    USU_Nombre			NVARCHAR(30)	NOT NULL,
    USU_Usuario			NVARCHAR(30)	NOT NULL,
    USU_Correo			NVARCHAR(80)	NOT NULL,
    USU_Contrasenia		NVARCHAR(80)	NOT NULL,
    USU_Foto			NVARCHAR(255),
    USU_Estado			BOOL			NOT NULL	DEFAULT 1,
    USU_Tickets			INT(1),
    
    PRIMARY KEY(USU_Id)
);

CREATE TABLE HOR_Equipo(
	EQU_Id			INT		 		AUTO_INCREMENT,
    EQU_Nombre		NVARCHAR(40)	NOT NULL,
    EQU_Foto		NVARCHAR(255),
    EQU_Auditor		INT				NOT NULL,
    
    PRIMARY KEY(EQU_Id)
);

CREATE TABLE HOR_Grupos(
	USU_Id			INT,
    EQU_Id			INT,
    
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id),
    FOREIGN KEY(EQU_Id) REFERENCES HOR_Equipo(EQU_Id)
);

CREATE TABLE HOR_Ajustes(
    USU_Id			    INT,
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

CREATE TABLE HOR_Tareas(
    TAR_Id INT AUTO_INCREMENT,
    TAR_Titulo NVARCHAR(100) NOT NULL,
    TAR_Descripcion TEXT,
    TAR_Prioridad NVARCHAR(20),
    TAR_TiempoEstimado NVARCHAR(50),
    TAR_FechaLimite NVARCHAR(50),
    TAR_HoraLimite NVARCHAR(50),
    TAR_Estado NVARCHAR(20) DEFAULT 'Pendiente',
    TAR_Bookmarked BOOL DEFAULT 0,
    USU_Id INT NOT NULL, /* Para saber de quién es la tarea */
    PRIMARY KEY(TAR_Id),
    FOREIGN KEY(USU_Id) REFERENCES HOR_Usuario(USU_Id)
);

/* REGISTROS */
-- HOR_Usuario
-- Nota: Insertamos 4 usuarios. Los dos primeros actuarán como auditores.
INSERT INTO HOR_Usuario (USU_Nombre, USU_Usuario, USU_Correo, USU_Contrasenia, USU_Foto, USU_Estado, USU_Tickets)
VALUES 
('Carlos Mendoza', 'carlos_auditor', 'carlos@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 1, 5),
('Ana Rodríguez', 'ana_auditora', 'ana@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', 1, 3),
('Juan Pérez', 'juan_dev', 'juan@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan', 1, 10),
('Sofía López', 'sofia_design', 'sofia@horworks.com', '1234', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', 1, 2);

-- EN HOR_Equipo
-- Enlazamos EQU_Auditor con los IDs de Carlos (1) y Ana (2)
INSERT INTO HOR_Equipo (EQU_Nombre, EQU_Foto, EQU_Auditor)
VALUES 
('Equipo de Desarrollo Backend', 'https://api.dicebear.com/7.x/identicon/svg?seed=Backend', 1),
('Equipo de Diseño UI/UX', 'https://api.dicebear.com/7.x/identicon/svg?seed=Design', 2);

-- HOR_Grupos
-- Asociación Usuario-Equipo
INSERT INTO HOR_Grupos (USU_Id, EQU_Id)
VALUES 
(1, 1), -- Carlos en el Equipo Backend
(3, 1), -- Juan en el Equipo Backend
(2, 2), -- Ana en el Equipo de Diseño
(4, 2); -- Sofía en el Equipo de Diseño

-- HOR_Ajustes
INSERT INTO HOR_Ajustes (USU_Id, AJU_Tema, AJU_Idioma, AJU_ZonaHoraria, AJU_FormatoHora, AJU_NotiPersistente, AJU_NotiSonido, AJU_NotiDesvio, AJU_NotiCorreo)
VALUES 
(1, 'verde', 'es-MX', 'GMT-06:00', 24, 1, 1, 1, 1),
(2, 'azul', 'es-MX', 'GMT-06:00', 12, 1, 1, 1, 1),
(3, 'azul', 'en-US', 'GMT-05:00', 24, 0, 1, 0, 0),
(4, 'naranja', 'es-MX', 'GMT-06:00', 12, 1, 1, 1, 1);

/* PROCEDIMIENTOS ALMACENADOS */
DELIMITER $$
CREATE PROCEDURE SP_IniciarSesion(
	IN INI_Correo 		VARCHAR(30),
    IN INI_Contrasenia	VARCHAR(80)
)
BEGIN
	IF EXISTS(SELECT 1 FROM HOR_Usuario WHERE USU_Correo = INI_Correo) THEN
		SELECT 
			USU_Id			Id,
			USU_Nombre 		Nombre,
			USU_Usuario		Usuario,
			USU_Foto 		Foto,
			USU_Estado 		Estado,
			USU_Tickets 	Tickets
		FROM HOR_Usuario WHERE USU_Correo = INI_Correo AND USU_Contrasenia = INI_Contrasenia;
	ELSE
		SELECT 0 Id;
	END IF;
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
END$$
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
    UPDATE HOR_Usuario 
    SET 
        USU_Tema = p_tema,
        USU_Idioma = p_idioma,
        USU_FormatoHora = p_formato,
        USU_NotiPersistente = p_persistente,
        USU_NotiSonido = p_sonido,
        USU_NotiDesvio = p_desvio,
        USU_NotiCorreo = p_correo
    WHERE USU_Id = p_usuario_id;
END$$
DELIMITER ;