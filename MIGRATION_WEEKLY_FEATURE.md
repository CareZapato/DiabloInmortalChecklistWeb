# Migración: Agregar Actividad de Mazmorras Aleatorias y Funcionalidad Semanal

## Fecha: 2 de enero de 2026

## Cambios Implementados

### 1. Nueva Actividad: "3 mazmorras al azar"
- **ID**: `weekly_random_dungeons_set`
- **Tipo**: Semanal
- **Prioridad**: A
- **Descripción**: Completa 3 mazmorras aleatorias cada semana para obtener una parte garantizada de equipo de set.

### 2. Funcionalidad de Marcado Semanal
Cuando se marca una actividad semanal como completada, ahora se marca automáticamente para toda la semana (lunes a domingo).

## Archivos Modificados

### Backend
- `backend/src/database/seed.ts` - Agregada nueva actividad
- `backend/src/controllers/progress.controller.ts` - Implementada lógica de marcado semanal
- `backend/src/database/migrations/add_random_dungeons_activity.sql` - Script SQL de migración
- `backend/src/database/migrations/run_add_random_dungeons.ts` - Script TypeScript de migración

### Frontend
- `frontend/src/pages/Dashboard.tsx` - Actualizado para manejar el marcado semanal

## Instrucciones de Despliegue

### Opción 1: Ejecutar Migración con TypeScript (Recomendado)

```bash
cd backend
npm run build
node dist/database/migrations/run_add_random_dungeons.js
```

### Opción 2: Ejecutar SQL Directamente

Conectarse a la base de datos y ejecutar:
```bash
psql -U <usuario> -d <nombre_bd> -f backend/src/database/migrations/add_random_dungeons_activity.sql
```

### Opción 3: Re-seed completo (Solo en desarrollo)

```bash
cd backend
npm run seed
```

**⚠️ Advertencia**: Esta opción sobrescribirá todos los datos de actividades. Solo usar en desarrollo.

## Verificación Post-Migración

1. Verificar que la nueva actividad aparece en la lista:
```sql
SELECT * FROM activities WHERE id = 'weekly_random_dungeons_set';
```

2. Probar el marcado semanal:
   - Marcar una actividad semanal en cualquier día
   - Navegar por los diferentes días de la semana
   - Verificar que la actividad aparece marcada en todos los días de lunes a domingo

## Comportamiento Esperado

### Actividades Diarias
- Se marcan solo para el día seleccionado
- Desmarcar funciona normalmente

### Actividades Semanales
- **Marcar**: Se marca automáticamente para toda la semana (lunes-domingo)
- **Desmarcar**: Se desmarca solo el día seleccionado
- La semana se calcula considerando lunes como primer día

### Actividades de Temporada
- Se marcan solo para el día seleccionado
- Comportamiento igual a las diarias

## Notas Técnicas

- La lógica de marcado semanal se ejecuta en el backend
- El frontend recarga el progreso después de marcar una actividad semanal
- La migración es idempotente (puede ejecutarse múltiples veces sin causar errores)
- Usa `ON CONFLICT` para actualizar si la actividad ya existe

## Rollback

Si necesitas revertir la nueva actividad:

```sql
DELETE FROM user_progress WHERE activity_id = 'weekly_random_dungeons_set';
DELETE FROM activities WHERE id = 'weekly_random_dungeons_set';
```

Para revertir la funcionalidad de marcado semanal, sería necesario restaurar las versiones anteriores de los archivos modificados.
