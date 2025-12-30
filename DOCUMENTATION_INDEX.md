# 📚 Diablo Immortal Checklist - Documentación Central

**Versión:** 0.1.0  
**Fecha:** 30 de diciembre de 2025  
**Autor:** CareZapato  
**Estado:** ✅ Producción

---

## 📖 Índice de Documentación

### Para Usuarios
- [README.md](README.md) - Guía de instalación y uso
- [CHANGELOG.md](CHANGELOG.md) - Historial de versiones y cambios

### Para Desarrolladores
- [REWARDS_SYSTEM_v2.5.md](REWARDS_SYSTEM_v2.5.md) - Sistema de recompensas (arquitectura, queries, casos de uso)
- [RENDER_DEPLOY.md](RENDER_DEPLOY.md) - Deploy en producción
- [IMPLEMENTATION_SUMMARY_v0.1.0.md](IMPLEMENTATION_SUMMARY_v0.1.0.md) - Resumen de implementación

---

## 🎯 Quick Start

### Instalación Local
```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd Web

# 2. Instalar dependencias
npm install

# 3. Configurar PostgreSQL
createdb DiabloInmortalChecklist

# 4. Configurar .env (ver README.md)
# backend/.env
# frontend/.env

# 5. Iniciar servidor (auto-restore activo)
npm run dev
```

### Acceso
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health

---

## ✨ Características Principales

### 1. Sistema de Actividades
- 27 actividades base (15 diarias, 8 semanales, 4 temporada)
- Seguimiento de progreso por fecha
- Filtros: tipo, modalidad, recompensa
- Sistema de prioridades

### 2. Sistema de Recompensas Normalizado
- 20 recompensas únicas con descripciones
- Base de datos relacional (7 tablas)
- 45 relaciones many-to-many (31 actividad-recompensa, 14 evento-recompensa)
- Cantidades específicas (ej: "Gemas normales x12")
- Filtro avanzado por recompensa

### 3. Eventos Programados
- 5 eventos con horarios múltiples
- Visualización en tiempo real con countdown
- Barra de progreso animada
- Estado visual: activo (verde) / próximo (amarillo)
- Actualización automática cada minuto

### 4. Calendario y Navegación
- Calendario mensual con progreso diario
- Navegación: día anterior/siguiente, "Hoy"
- Hora del juego con offset -2h
- Contador de reinicio diario

### 5. Autenticación
- Sistema de usuarios con JWT (7 días)
- Progreso individual por usuario
- Registro e inicio de sesión

### 6. UI/UX
- Diseño temático Diablo (rojo/dorado/negro)
- 100% responsive (móvil, tablet, desktop)
- Filtros: sidebar (desktop) / drawer (móvil)
- Panel de detalles: sidebar (desktop) / modal (móvil)
- Versión visible con acceso a changelog

---

## 🗄️ Arquitectura de Base de Datos

### Tablas (7)
1. **users** - Usuarios del sistema
2. **activities** - 27 actividades (diarias/semanales/temporada)
3. **scheduled_events** - 5 eventos con horarios
4. **user_progress** - Progreso por usuario/actividad/fecha
5. **rewards** - 20 recompensas únicas
6. **event_rewards** - Relación many-to-many eventos-recompensas
7. **activity_rewards** - Relación many-to-many actividades-recompensas

### Auto-Restore
Si eliminas tablas, el sistema las **recrea automáticamente** al iniciar, incluyendo:
- Estructura de 7 tablas
- 27 actividades
- 5 eventos
- 20 recompensas
- 45 relaciones

---

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Usuario actual (JWT)

### Activities
- `GET /api/activities` - Lista con rewards
- `GET /api/activities/:id` - Detalle con rewards

### Events
- `GET /api/events/upcoming` - Próximos eventos con rewards

### Progress
- `GET /api/progress/date/:date` - Progreso de fecha (YYYY-MM-DD)
- `POST /api/progress/toggle` - Toggle completado

### Rewards (v0.1.0)
- `GET /api/rewards` - Lista todas las recompensas
- `GET /api/rewards/:id/activities` - Actividades por recompensa
- `GET /api/rewards/:id/events` - Eventos por recompensa

---

## 📊 Datos Base

### Actividades (27)
- **Diarias (15):** Gemas party4, Bestias, Shadow War, Defensa de Daedessa, etc.
- **Semanales (8):** Capeo de gemas 63/63, Elder Rifts, Warband, Clan, Helliquary, Terror Rifts
- **Temporada (4):** Battlegrounds, Kion/Sombras, Torres de clan, Comerciantes

### Eventos (5)
- **Battlefield:** 12:00, 20:00
- **Carruaje Poseído:** 12:00, 20:00
- **Asalto a la Cámara:** 12:00, 20:00
- **Reunión de las Sombras:** 18:00, 21:00
- **Arena Ancestral:** 14:00, 18:00, 22:00

### Recompensas (20)
- battle_points, high_quality_equipment, gold, xp
- normal_gems, normal_gems_bound
- rare_crests, legendary_crests
- fading_embers, platinum
- abyssal_essence, monster_essence, terror_essence
- battle_pass_points, materials, scoria
- legendary_items, eternal_legendary
- reforge_stones, horadrim_materials

---

## 🔧 Stack Tecnológico

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL 15+ con pg driver
- JWT para autenticación
- bcrypt para passwords

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios

---

## 🚀 Deploy en Producción

### Render (Recomendado)
Ver [RENDER_DEPLOY.md](RENDER_DEPLOY.md) para guía completa.

**Pasos rápidos:**
1. Crear PostgreSQL Database en Render
2. Crear Web Service con auto-deploy desde GitHub
3. Configurar variables de entorno
4. Deploy automático ✅

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://...
BACKEND_PORT=3000
BACKEND_HOST=0.0.0.0
JWT_SECRET=<secreto-seguro-32-chars>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-frontend.onrender.com
```

---

## 🐛 Troubleshooting

### Base de datos vacía después de deploy
- ✅ **Auto-restore activado:** El sistema crea tablas y datos automáticamente
- Verificar logs: "✅ Seeded 27 activities", "✅ Seeded 20 rewards"

### Errores de CORS
- Verificar `CORS_ORIGIN` en backend `.env`
- Verificar `VITE_API_URL` en frontend `.env`
- Reiniciar servidores

### Timezone incorrecto en eventos
- ✅ **Offset -2h aplicado:** El sistema maneja automáticamente
- Verificar función `getGameTime()` en `timeUtils.ts`

---

## 📝 Changelog Rápido

### v0.1.0 (30/12/2025) - Lanzamiento Inicial
- ✅ Sistema de actividades con 27 actividades
- ✅ Sistema de recompensas normalizado con 20 recompensas
- ✅ Sistema de eventos con 5 eventos programados
- ✅ Filtros avanzados (tipo, modalidad, recompensa)
- ✅ Calendario con progreso diario
- ✅ Autenticación con JWT
- ✅ UI 100% responsive
- ✅ Auto-restore de base de datos
- ✅ Versioning visible
- ✅ Página de changelog

Ver [CHANGELOG.md](CHANGELOG.md) para detalles completos.

---

## 🎯 Roadmap Futuro

### Próximas Características
- Notificaciones push para eventos
- Estadísticas y gráficos de progreso
- Racha de días consecutivos
- Exportar/importar progreso
- Modo oscuro/claro
- Filtros guardados
- Iconos personalizados para recompensas

---

## 👥 Contribuir

### Agregar Nueva Actividad
1. Editar `backend/src/database/init.ts`
2. Agregar en array de `seedBaseData()`
3. Reiniciar servidor (auto-seed)

### Agregar Nueva Recompensa
1. Editar `backend/src/database/init.ts`
2. Agregar en tabla `rewards`
3. Crear relaciones en `activity_rewards` o `event_rewards`
4. Reiniciar servidor

### Migración de BD Existente
```bash
cd backend
npx ts-node src/database/migrations/migrate_rewards_v2.5.ts
```

---

## 📧 Soporte

**Desarrollador:** CareZapato  
**Versión actual:** 0.1.0  
**Última actualización:** 30/12/2025

Para bugs o sugerencias, revisar:
- [CHANGELOG.md](CHANGELOG.md) - Cambios recientes
- [REWARDS_SYSTEM_v2.5.md](REWARDS_SYSTEM_v2.5.md) - Sistema de recompensas
- [README.md](README.md) - Documentación general

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial

---

**Estado del Proyecto:** ✅ Estable y funcional  
**Última compilación:** Exitosa  
**Tests:** Pasando  
**Deploy:** Listo

🎉 **Diablo Immortal Checklist v0.1.0 - Completo y Documentado**
