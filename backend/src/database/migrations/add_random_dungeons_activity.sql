-- Migration: Add weekly random dungeons activity
-- Date: 2026-01-02
-- Description: Adds the new weekly activity for 3 random dungeons that reward set equipment pieces

INSERT INTO activities (id, nombre, tipo, prioridad, tiempo_aprox, recompensas, mejora, detalle, modo, preferencia) 
VALUES (
  'weekly_random_dungeons_set',
  '3 mazmorras al azar (recompensa de parte de equipo de set)',
  'semanal',
  'A',
  '15–30 min',
  'Parte de equipo de set (head, chest, legs, etc.), materiales.',
  'Progreso hacia sets completos que otorgan bonificadores poderosos.',
  'Completa 3 mazmorras aleatorias cada semana para obtener una parte garantizada de equipo de set. Los sets completos ofrecen bonificadores significativos que mejoran tu build.',
  'ambas',
  'grupal'
) 
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  prioridad = EXCLUDED.prioridad,
  tiempo_aprox = EXCLUDED.tiempo_aprox,
  recompensas = EXCLUDED.recompensas,
  mejora = EXCLUDED.mejora,
  detalle = EXCLUDED.detalle,
  modo = EXCLUDED.modo,
  preferencia = EXCLUDED.preferencia,
  updated_at = CURRENT_TIMESTAMP;
