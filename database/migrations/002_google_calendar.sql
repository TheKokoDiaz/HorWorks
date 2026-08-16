-- database/migrations/002_google_calendar.sql
--
-- Agrega el soporte de Google Calendar sobre una base de datos que YA
-- existe (con tus datos de prueba), sin necesidad de recrear el volumen
-- de Docker. HorDatabase.sql solo se ejecuta la primera vez que se crea el
-- volumen de MySQL, así que si ya corriste `docker-compose up` antes,
-- necesitas aplicar esto a mano una sola vez:
--
--   Get-Content "database/migrations/002_google_calendar.sql" | docker exec -i DB_HORWORKS mysql -uroot -pPelusa12! DB_HORWORKS
--
-- (ajusta el nombre de contenedor/usuario/contraseña si los cambiaste en tu .env)
--
-- Nota: si ya corriste este script una vez y lo vuelves a correr, dará
-- error "Duplicate column name" — es normal, significa que ya estaba
-- aplicado; ignóralo.

ALTER TABLE HOR_Usuario ADD COLUMN USU_Google_RefreshToken TEXT NULL;
ALTER TABLE HOR_Usuario ADD COLUMN USU_Google_Email VARCHAR(120) NULL;
ALTER TABLE HOR_Tarea ADD COLUMN TAR_GoogleEventId VARCHAR(255) NULL;
