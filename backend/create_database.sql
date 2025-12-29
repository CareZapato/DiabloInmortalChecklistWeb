-- Script para crear la base de datos DiabloInmortalChecklist
-- Ejecutar con: psql -U postgres -f create_database.sql

-- Crear la base de datos si no existe
CREATE DATABASE "DiabloInmortalChecklist"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Chile.1252'
    LC_CTYPE = 'Spanish_Chile.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE "DiabloInmortalChecklist"
    IS 'Base de datos para Diablo Immortal Checklist';
