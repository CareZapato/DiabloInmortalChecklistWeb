-- Script para crear usuario demo si no existe
-- Ejecutar con: psql -U postgres -d diablo_checklist_db -f create_demo_user.sql

-- Verificar si el usuario demo existe
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE username = 'demo';
    
    IF user_count = 0 THEN
        -- Crear usuario demo
        -- Password: demo123
        -- Hash generado con bcrypt rounds=10
        INSERT INTO users (username, email, password_hash)
        VALUES (
            'demo',
            'demo@example.com',
            '$2a$10$YourHashHere' -- Esto será generado por el backend
        );
        
        RAISE NOTICE 'Usuario demo creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario demo ya existe';
    END IF;
END $$;
