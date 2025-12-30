-- Migración para agregar campo recompensas a scheduled_events
-- Ejecutar con: psql -U postgres -d diablo_checklist_db -f add_event_rewards.sql

-- Agregar columna recompensas si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'scheduled_events' 
        AND column_name = 'recompensas'
    ) THEN
        ALTER TABLE scheduled_events 
        ADD COLUMN recompensas TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Columna recompensas agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna recompensas ya existe';
    END IF;
END $$;

-- Actualizar datos de eventos con la información correcta
UPDATE scheduled_events SET 
    nombre = 'Campo de Batalla',
    horarios = ARRAY['08:00', '12:00', '18:00', '22:00'],
    duracion_minutos = 60,
    recompensas = ARRAY['Puntos de batalla', 'Equipo de alta calidad']
WHERE id = 'battlefield';

-- Eliminar eventos antiguos que ya no existen
DELETE FROM scheduled_events WHERE id IN ('ancient_nightmare', 'demonic_gates');

-- Actualizar o insertar Carruaje Poseído
INSERT INTO scheduled_events (id, nombre, horarios, duracion_minutos, descripcion, tipo, recompensas)
VALUES (
    'haunted_carriage',
    'Carruaje Poseído',
    ARRAY['12:00', '20:30', '22:00'],
    30,
    'Escolta el carruaje hasta su destino mientras defiendes contra oleadas de enemigos.',
    'world_event',
    ARRAY['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    horarios = EXCLUDED.horarios,
    duracion_minutos = EXCLUDED.duracion_minutos,
    descripcion = EXCLUDED.descripcion,
    tipo = EXCLUDED.tipo,
    recompensas = EXCLUDED.recompensas;

-- Actualizar Asalto a la Cámara
UPDATE scheduled_events SET 
    horarios = ARRAY['12:00', '19:00'],
    recompensas = ARRAY['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
WHERE id = 'vault_raid';

-- Actualizar Reunión de las Sombras
UPDATE scheduled_events SET 
    recompensas = ARRAY['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
WHERE id = 'shadow_assembly';

-- Insertar Arena Ancestral
INSERT INTO scheduled_events (id, nombre, horarios, duracion_minutos, descripcion, tipo, recompensas)
VALUES (
    'ancient_arena',
    'Arena Ancestral',
    ARRAY['21:30'],
    30,
    'Combate PvP en la arena ancestral. Demuestra tu habilidad contra otros jugadores.',
    'pvp',
    ARRAY['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    horarios = EXCLUDED.horarios,
    duracion_minutos = EXCLUDED.duracion_minutos,
    descripcion = EXCLUDED.descripcion,
    tipo = EXCLUDED.tipo,
    recompensas = EXCLUDED.recompensas;

-- Mostrar resultados
SELECT id, nombre, horarios, recompensas FROM scheduled_events ORDER BY id;
