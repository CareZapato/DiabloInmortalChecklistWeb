# Actualización v2.3 - Modalidades y Horarios de Eventos

## Cambios Implementados

### 1. Sistema de Modalidades de Actividades

**Backend:**
- ✅ Agregadas columnas `modo` y `preferencia` a la tabla `activities`
- ✅ Tipos TypeScript: `ActivityMode` ('individual' | 'grupal' | 'ambas')
- ✅ Tipos TypeScript: `ActivityPreference` ('individual' | 'grupal' | null)
- ✅ Migración SQL ejecutada: `add_activity_mode.sql`

**Datos:**
- ✅ 27 actividades clasificadas:
  - 9 Individual puras
  - 2 Grupal puras  
  - 16 Ambas (con preferencias)

**Frontend:**
- ✅ Filtro de modalidad en Dashboard (Todas | Individual | Grupal | Ambas)
- ✅ Indicadores visuales en tarjetas de actividades
- ✅ Panel de detalles con información de modo y preferencia

### 2. Horarios de Eventos Corregidos

Basándose en la imagen del juego:

**Campo de Batalla:**
- Antes: 9 horarios (06:00-22:00 cada 2h)
- Ahora: 4 horarios → `['08:00', '12:00', '18:00', '22:00']`

**Pesadilla Ancestral:**
- Mantenido: `['12:00', '20:30', '22:30']`

**Puertas Demoníacas:**
- Antes: `['08:30', '12:00', '20:30']`
- Ahora: `['12:00', '20:30', '22:00']`

**Asalto a la Cámara:**
- Antes: `['07:00', '12:00', '19:00']`
- Ahora: `['12:00', '19:00']`

**Reunión de las Sombras:**
- Mantenido: `['19:00']`

### 3. Auto-Restauración de Base de Datos

**Archivos Actualizados:**

1. **backend/src/database/init.ts**
   - Schema actualizado con columnas modo y preferencia
   - Eventos con horarios corregidos
   - Query de inserción usa defaults para retrocompatibilidad

2. **backend/src/database/seed.ts**
   - Todas las actividades con modo y preferencia
   - Todos los eventos con horarios correctos
   - ON CONFLICT DO UPDATE para idempotencia

## Archivos Modificados

```
backend/src/
├── models/Activity.ts                    (tipos ActivityMode y ActivityPreference)
├── database/
│   ├── init.ts                          (schema y eventos actualizados)
│   ├── seed.ts                          (datos completos con modo/preferencia)
│   └── migrations/
│       ├── add_activity_mode.sql        (migración SQL)
│       └── run_add_mode.ts              (script de migración)
│
frontend/src/
├── types/index.ts                        (tipos ActivityMode y ActivityPreference)
└── pages/Dashboard.tsx                   (filtro de modalidad e indicadores)
```

## Instrucciones de Deploy en Producción

### Opción 1: Deploy Automático en Render

1. **Commit y Push:**
   ```bash
   git add .
   git commit -m "feat: Add activity modes and fix event schedules"
   git push origin main
   ```

2. **Deploy Automático:**
   - Render detectará el push y ejecutará el build automáticamente
   - El backend ejecutará `initializeDatabase()` al iniciar
   - Si las tablas existen pero faltan columnas, el sistema usará defaults
   
3. **Migración Manual (si es necesario):**
   Si hay errores, ejecutar desde shell de Render:
   ```bash
   npm run db:seed
   ```

### Opción 2: Migración Manual Controlada

Si prefieres mayor control:

1. **Conectar a la Base de Datos de Render:**
   ```bash
   psql -h <RENDER_DB_HOST> -U <RENDER_DB_USER> -d <RENDER_DB_NAME>
   ```

2. **Ejecutar Migración SQL:**
   ```sql
   ALTER TABLE activities 
   ADD COLUMN IF NOT EXISTS modo VARCHAR(20) DEFAULT 'individual' 
   CHECK (modo IN ('individual', 'grupal', 'ambas'));
   
   ALTER TABLE activities 
   ADD COLUMN IF NOT EXISTS preferencia VARCHAR(20) 
   CHECK (preferencia IN ('individual', 'grupal') OR preferencia IS NULL);
   ```

3. **Push y Deploy:**
   ```bash
   git add .
   git commit -m "feat: Add activity modes and fix event schedules"
   git push origin main
   ```

4. **Ejecutar Seed desde Render Shell:**
   ```bash
   npm run db:seed
   ```

## Verificación Post-Deploy

1. **Backend API:**
   - `GET /api/activities` debe devolver actividades con campos `modo` y `preferencia`
   - `GET /api/events/upcoming` debe mostrar horarios correctos

2. **Frontend:**
   - Filtro de modalidad visible en Dashboard
   - Indicadores de modo en cada actividad
   - Eventos con horarios correctos

3. **Base de Datos:**
   ```sql
   -- Verificar columnas
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'activities' 
   AND column_name IN ('modo', 'preferencia');
   
   -- Verificar datos
   SELECT id, nombre, modo, preferencia 
   FROM activities 
   LIMIT 5;
   
   -- Verificar eventos
   SELECT nombre, horarios 
   FROM scheduled_events;
   ```

## Rollback (si es necesario)

Si algo falla, el sistema es retrocompatible:

1. **Backend:** Los campos `modo` y `preferencia` tienen defaults
2. **Frontend:** El código verifica existencia antes de mostrar
3. **Query:** Usa `activity.modo || 'individual'` como fallback

Para volver completamente atrás:
```bash
git revert HEAD
git push origin main
```

## Notas Importantes

✅ **Cambio Transparente:** 
- El sistema es 100% retrocompatible
- Si las columnas no existen, usará defaults
- Si los datos no están, el auto-restore los crea

✅ **Idempotencia:**
- Seed usa ON CONFLICT DO UPDATE
- Init usa ON CONFLICT DO NOTHING
- Múltiples ejecuciones son seguras

✅ **Sin Downtime:**
- La migración es aditiva (no destructiva)
- Los defaults previenen errores
- El frontend maneja datos faltantes

## Próximos Pasos Sugeridos

1. **Agregar estadísticas por modalidad:**
   - Actividades completadas individual vs grupal
   - Tiempo invertido por modo
   
2. **Notificaciones de eventos:**
   - Alertas 10 min antes de eventos
   - Filtro por tipo de evento (PvP, World, Faction)

3. **Historial de actividades:**
   - Ver qué actividades se hacen más
   - Identificar patrones de juego

---

**Fecha:** 29 de diciembre de 2025  
**Versión:** 2.3  
**Estado:** ✅ Listo para producción
