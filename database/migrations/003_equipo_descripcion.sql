-- database/migrations/003_equipo_descripcion.sql
--
-- Agrega EQU_Descripcion y EQU_Organizacion a HOR_Equipo sobre una base de
-- datos que YA existe (con tus datos de prueba), sin necesidad de recrear
-- el volumen de Docker. app/models/home.py y app/routes/equipo_routes.py ya
-- leían/escribían estas columnas (edición de equipo), pero nunca se habían
-- creado en la tabla real. Si ya corriste `docker-compose up` antes,
-- necesitas aplicar esto a mano una sola vez:
--
--   Get-Content "database/migrations/003_equipo_descripcion.sql" | docker exec -i DB_HORWORKS mysql -uroot -pPelusa12! DB_HORWORKS
--
-- (ajusta el nombre de contenedor/usuario/contraseña si los cambiaste en tu .env)
--
-- Nota: si ya corriste este script una vez y lo vuelves a correr, dará
-- error "Duplicate column name" — es normal, significa que ya estaba
-- aplicado; ignóralo.

ALTER TABLE HOR_Equipo ADD COLUMN EQU_Descripcion VARCHAR(255) NULL;
ALTER TABLE HOR_Equipo ADD COLUMN EQU_Organizacion VARCHAR(100) NULL;
