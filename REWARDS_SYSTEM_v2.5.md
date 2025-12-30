# Sistema de Recompensas Normalizado - v2.5

**Fecha:** 30 de diciembre de 2025

---

## ✅ Resumen de Implementación

Se ha implementado exitosamente un **sistema de recompensas normalizado** con tablas relacionales independientes, permitiendo:

1. **Filtrado por recompensas:** Buscar actividades/eventos que otorgan una recompensa específica
2. **Cantidad específica:** Definir cantidades exactas (ej: 12 gemas normales, 63 gemas vinculadas)
3. **Descripción detallada:** Información adicional sobre cada recompensa
4. **Reutilización:** Una recompensa puede estar vinculada a múltiples actividades/eventos
5. **Escalabilidad:** Fácil agregar nuevas recompensas sin modificar tablas existentes

---

## 📊 Estructura de Base de Datos

### Nueva Tabla: `rewards`
```sql
CREATE TABLE rewards (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**20 Recompensas base:**
- `battle_points` - Puntos de batalla
- `high_quality_equipment` - Equipo de alta calidad
- `gold` - Oro
- `xp` - Experiencia (XP)
- `normal_gems` - Gemas normales (vendibles)
- `normal_gems_bound` - Gemas normales vinculadas
- `rare_crests` - Cimeras raras
- `legendary_crests` - Cimeras legendarias
- `fading_embers` - Brasas debilitadas
- `platinum` - Platino
- `abyssal_essence` - Esencias abisales
- `monster_essence` - Esencias de monstruos
- `terror_essence` - Esencias del Terror
- `battle_pass_points` - Puntos de pase de batalla
- `materials` - Materiales
- `scoria` - Rodolita
- `legendary_items` - Objetos legendarios
- `eternal_legendary` - Legendario eterno excepcional
- `reforge_stones` - Piedras de reforja
- `horadrim_materials` - Materiales del Santuario Horádrim

### Nueva Tabla: `event_rewards` (relación many-to-many)
```sql
CREATE TABLE event_rewards (
  event_id VARCHAR(100) NOT NULL REFERENCES scheduled_events(id) ON DELETE CASCADE,
  reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  cantidad INTEGER,
  PRIMARY KEY (event_id, reward_id)
);
```

**14 relaciones evento-recompensa:**
- Campo de Batalla → battle_points, high_quality_equipment
- Carruaje Poseído → high_quality_equipment, gold, xp
- Asalto a la Cámara → high_quality_equipment, gold, xp
- Reunión de las Sombras → high_quality_equipment, gold, xp
- Arena Ancestral → high_quality_equipment, gold, xp

### Nueva Tabla: `activity_rewards` (relación many-to-many)
```sql
CREATE TABLE activity_rewards (
  activity_id VARCHAR(100) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  cantidad INTEGER,
  PRIMARY KEY (activity_id, reward_id)
);
```

**31 relaciones actividad-recompensa** (ejemplos clave):
- `daily_gemas_party4` → normal_gems (12), normal_gems_bound
- `weekly_gemas_cap_63_63` → normal_gems (63), normal_gems_bound (63)
- `weekly_elder_rift_embers` → fading_embers, battle_pass_points (8)
- `season_pvp_battleground_3` → normal_gems, legendary_crests, reforge_stones
- `weekly_inferlicario` → legendary_crests, materials
- `weekly_terror_rifts` → terror_essence (1), legendary_items, materials

### Cambios en Tablas Existentes
- ❌ **Eliminado:** Campo `recompensas TEXT` de `activities`
- ❌ **Eliminado:** Campo `recompensas TEXT[]` de `scheduled_events`

---

## 🔄 Consultas Mejoradas

### Obtener Actividades con Recompensas
```typescript
// Controller actualizado
const result = await pool.query(`
  SELECT 
    a.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id', r.id,
          'nombre', r.nombre,
          'descripcion', r.descripcion,
          'cantidad', ar.cantidad
        ) ORDER BY r.nombre
      ) FILTER (WHERE r.id IS NOT NULL),
      '[]'::json
    ) as rewards
  FROM activities a
  LEFT JOIN activity_rewards ar ON a.id = ar.activity_id
  LEFT JOIN rewards r ON ar.reward_id = r.id
  GROUP BY a.id
`);
```

### Obtener Eventos con Recompensas
```typescript
// Controller actualizado
const result = await pool.query(`
  SELECT 
    e.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id', r.id,
          'nombre', r.nombre,
          'descripcion', r.descripcion,
          'cantidad', er.cantidad
        ) ORDER BY r.nombre
      ) FILTER (WHERE r.id IS NOT NULL),
      '[]'::json
    ) as rewards
  FROM scheduled_events e
  LEFT JOIN event_rewards er ON e.id = er.event_id
  LEFT JOIN rewards r ON er.reward_id = r.id
  GROUP BY e.id
`);
```

---

## 📁 Archivos Modificados/Creados

### Backend

#### Nuevos Archivos:
- `backend/src/models/Reward.ts` - Interfaces TypeScript para Reward, EventReward, ActivityReward
- `backend/src/database/migrations/migrate_rewards_v2.5.ts` - Script de migración

#### Modificados:
- `backend/src/database/init.ts`
  - Tablas: rewards, event_rewards, activity_rewards
  - Seed de 20 recompensas base
  - 14 event_rewards
  - 31 activity_rewards
  - Verificación de 7 tablas (antes 4)
  - Verificación de rewards en checkBaseData

- `backend/src/controllers/activity.controller.ts`
  - `getAllActivities()` con LEFT JOIN a rewards
  - `getActivityById()` con LEFT JOIN a rewards

- `backend/src/controllers/event.controller.ts`
  - `getAllEvents()` con LEFT JOIN a rewards
  - `getUpcomingEvents()` con LEFT JOIN a rewards

### Frontend

#### Modificados:
- `frontend/src/types/index.ts`
  - Nueva interfaz `Reward`
  - `Activity.rewards?: Reward[]` (antes `recompensas: string`)
  - `ScheduledEvent.rewards?: Reward[]` (antes `recompensas?: string[]`)

---

## 🎯 Casos de Uso

### 1. Filtrar actividades por recompensa
```sql
-- Obtener todas las actividades que dan cimeras legendarias
SELECT a.* 
FROM activities a
JOIN activity_rewards ar ON a.id = ar.activity_id
JOIN rewards r ON ar.reward_id = r.id
WHERE r.id = 'legendary_crests';
```

**Resultado:** 6 actividades encontradas
- season_pvp_battleground_3
- weekly_inferlicario
- season_kion_or_shadows
- season_clan_towers_crests (cantidad: 2)
- season_merchant_crest_platinum (cantidad: 1)
- season_clan_ticket_crest (cantidad: 1)
- season_immortals_shop_crest (cantidad: 1)

### 2. Ver todas las recompensas de un evento
```sql
-- Recompensas del Campo de Batalla
SELECT r.nombre, er.cantidad
FROM event_rewards er
JOIN rewards r ON er.reward_id = r.id
WHERE er.event_id = 'battlefield';
```

**Resultado:**
- Puntos de batalla (cantidad: NULL)
- Equipo de alta calidad (cantidad: NULL)

### 3. Buscar actividades que dan cantidades específicas
```sql
-- Actividades que dan más de 50 gemas normales
SELECT a.nombre, r.nombre, ar.cantidad
FROM activities a
JOIN activity_rewards ar ON a.id = ar.activity_id
JOIN rewards r ON ar.reward_id = r.id
WHERE ar.cantidad > 50;
```

**Resultado:**
- Capeo semanal: 63 gemas normales, 63 gemas vinculadas

### 4. Estadísticas de recompensas
```sql
-- Contar cuántas actividades otorgan cada recompensa
SELECT r.nombre, COUNT(ar.activity_id) as actividades
FROM rewards r
LEFT JOIN activity_rewards ar ON r.id = ar.reward_id
GROUP BY r.id, r.nombre
ORDER BY actividades DESC;
```

---

## 🚀 Migración y Deployment

### Para BD Existentes (Producción)

```bash
# Ejecutar migración
cd backend
npx ts-node src/database/migrations/migrate_rewards_v2.5.ts
```

**La migración hace:**
1. ✅ Crea tabla `rewards`
2. ✅ Crea tablas `event_rewards` y `activity_rewards`
3. ✅ Crea índices para optimizar búsquedas
4. ✅ Seed de 20 recompensas base
5. ✅ Migra 14 relaciones evento-recompensa
6. ✅ Migra 31 relaciones actividad-recompensa
7. ⚠️ NO elimina columnas antiguas (por seguridad)

### Para BD Nuevas (Auto-restore)

El sistema de auto-restore en `init.ts` ahora:
- Verifica 7 tablas (incluyendo rewards, event_rewards, activity_rewards)
- Seed automático de recompensas si no existen
- Seed automático de relaciones si no existen

### Eliminar Columnas Antiguas (Opcional)

Solo cuando estés seguro de que todo funciona:

```sql
ALTER TABLE activities DROP COLUMN IF EXISTS recompensas;
ALTER TABLE scheduled_events DROP COLUMN IF EXISTS recompensas;
```

---

## 📊 Respuesta de API

### Antes (v2.4)
```json
{
  "id": "daily_gemas_party4",
  "nombre": "Hallazgo de gemas normales",
  "recompensas": "Hasta 12 gemas normales NO vinculadas/día"
}
```

### Ahora (v2.5)
```json
{
  "id": "daily_gemas_party4",
  "nombre": "Hallazgo de gemas normales",
  "rewards": [
    {
      "id": "normal_gems",
      "nombre": "Gemas normales",
      "descripcion": "Gemas para mejorar atributos secundarios. Las no vinculadas son vendibles",
      "cantidad": 12
    },
    {
      "id": "normal_gems_bound",
      "nombre": "Gemas normales vinculadas",
      "descripcion": "Gemas normales vinculadas a la cuenta, no vendibles",
      "cantidad": null
    }
  ]
}
```

---

## ✨ Beneficios

### Para el Usuario:
- 🔍 **Filtro por recompensa:** "Mostrar todas las actividades que dan cimeras"
- 📊 **Cantidades claras:** Saber exactamente cuántas recompensas obtener
- 📖 **Descripción detallada:** Entender qué es cada recompensa
- 🎯 **Decisiones informadas:** Priorizar actividades según recompensas deseadas

### Para el Desarrollador:
- 🗄️ **Normalización:** No repetir datos (DRY)
- ⚡ **Performance:** Índices en reward_id para búsquedas rápidas
- 🔧 **Mantenibilidad:** Agregar recompensas sin alterar tablas
- 📈 **Escalabilidad:** Soporte para miles de recompensas sin problemas
- 🧪 **Testing:** Queries más simples y directas

---

## 🎯 Próximos Pasos

### Inmediato:
- [ ] Actualizar UI del Dashboard para mostrar recompensas con cantidad
- [ ] Agregar filtro por recompensa en frontend
- [ ] Mostrar tooltip con descripción de recompensa

### Corto plazo:
- [ ] Endpoint `/api/rewards` para listar todas las recompensas
- [ ] Endpoint `/api/rewards/:id/activities` para buscar por recompensa
- [ ] Agregar iconos a las recompensas
- [ ] Sistema de "favoritos" de recompensas

### Mediano plazo:
- [ ] Estadísticas: "Has obtenido X gemas esta semana"
- [ ] Recomendaciones: "Todavía puedes conseguir N cimeras hoy"
- [ ] Comparador: "Actividad A vs B por recompensas"

---

## 📝 Notas Técnicas

### Rendimiento
- **Índices creados:**
  - `idx_event_rewards_reward_id` en event_rewards(reward_id)
  - `idx_activity_rewards_reward_id` en activity_rewards(reward_id)
- **Queries optimizados:** LEFT JOIN con json_agg para una sola consulta

### Compatibilidad
- ✅ PostgreSQL 12+
- ✅ TypeScript 5.x
- ✅ Frontend actualizado automáticamente por tipo `Reward[]`

### Seguridad
- ✅ ON DELETE CASCADE en foreign keys
- ✅ UNIQUE constraint en rewards.nombre
- ✅ Primary keys compuestas en tablas de relación

---

**Estado:** ✅ Completado y funcionando  
**Versión:** 2.5  
**Migración ejecutada:** 30/12/2025 11:17 AM  
**Datos seeded:**
- 20 rewards
- 14 event_rewards
- 31 activity_rewards

🎉 **Sistema de recompensas normalizado listo para producción!**
