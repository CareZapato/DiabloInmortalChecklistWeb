# Changelog - Diablo Immortal Checklist

Todos los cambios notables de este proyecto serán documentados en este archivo.

---

## [0.1.0] - 2025-01-30

### 🎉 Lanzamiento Inicial

**Desarrollador:** CareZapato

### ✨ Características Principales

#### Sistema de Actividades
- **Gestión completa de actividades diarias, semanales y de temporada**
  - Seguimiento de progreso por fecha
  - Checkbox optimizado para móvil (sin abrir modal al marcar)
  - Filtros por tipo: diaria, semanal, temporada
  - Filtros por modalidad: individual, grupal, ambas
  - Sistema de prioridades: crítica, alta, media, baja
  - Información detallada: tiempo estimado, recompensas, mejora que aporta, detalles

#### Sistema de Eventos Programados
- **Visualización de próximos eventos del día**
  - Muestra hasta 8 próximos eventos
  - Estado visual: activo (verde) o próximo (amarillo)
  - Barra de progreso animada que indica el tiempo transcurrido entre horarios
  - Countdown en tiempo real (minutos u horas)
  - Actualización automática cada minuto
  - Sección expandible en móvil, fija en escritorio
  - 5 eventos incluidos: Battlefield, Poseído, Asalto, Sombras, Arena

#### Sistema de Recompensas Normalizado
- **Base de datos relacional con 20 recompensas únicas**
  - Cada recompensa tiene: id, nombre, descripción
  - Cantidades específicas (ej: "Gemas normales x12")
  - Relaciones many-to-many con actividades y eventos
  - 31 relaciones actividad-recompensa
  - 14 relaciones evento-recompensa
  
- **Filtro por recompensas**
  - Buscar actividades que otorguen una recompensa específica
  - Visualización en badges con cantidad
  - Tooltips con descripciones
  - Filtros disponibles en sidebar (desktop) y drawer (móvil)

- **Recompensas incluidas:**
  - Puntos de batalla
  - Equipo de alta calidad
  - Oro y XP
  - Gemas normales (vendibles y vinculadas)
  - Cimeras raras y legendarias
  - Brasas debilitadas
  - Platino
  - Esencias (abisales, monstruos, terror)
  - Materiales del Santuario Horádrim
  - Legendarios eternos excepcionales
  - Piedras de reforja
  - Y más...

#### Calendario y Navegación de Fechas
- **Sistema de calendario integrado**
  - Visualización mensual con progreso diario
  - Navegación rápida: día anterior/siguiente
  - Botón "Hoy" para volver a la fecha actual
  - Indicadores visuales de progreso completado

#### Hora del Juego y Timezone
- **Sincronización correcta con el servidor**
  - Offset de -2 horas aplicado consistentemente
  - Muestra "Hora del Juego" en el header
  - Contador de tiempo hasta reinicio diario
  - Actualización automática cada minuto

#### Interfaz de Usuario
- **Diseño temático Diablo**
  - Paleta de colores: rojo oscuro, dorado, negro
  - Responsive: móvil, tablet, desktop
  - Animaciones y transiciones suaves
  - Modales optimizados para touch
  - Sticky header con información relevante

- **Panel de detalles**
  - Desktop: sidebar fijo en la derecha
  - Móvil: modal full-screen con scroll
  - Información completa de cada actividad

- **Filtros**
  - Desktop: sidebar fijo en la izquierda
  - Móvil: drawer bottom-sheet con animaciones
  - Indicador visual cuando hay filtros activos
  - Botón "Limpiar filtros"

#### Autenticación
- **Sistema de usuarios**
  - Registro e inicio de sesión
  - JWT con expiración de 7 días
  - Progreso individual por usuario
  - Logout con limpieza de sesión

#### Backend y Base de Datos
- **API RESTful con Express y TypeScript**
  - PostgreSQL 15+ como base de datos
  - 7 tablas normalizadas:
    - users
    - activities (27 actividades base)
    - user_progress
    - scheduled_events (5 eventos)
    - rewards (20 recompensas)
    - event_rewards (relaciones many-to-many)
    - activity_rewards (relaciones many-to-many)

- **Auto-restore del sistema**
  - Si se eliminan tablas, se recrean automáticamente al deployar
  - Seed automático de datos base:
    - 27 actividades
    - 5 eventos programados
    - 20 recompensas
    - 31 relaciones actividad-recompensa
    - 14 relaciones evento-recompensa

- **Migraciones**
  - Script de migración v2.5 disponible para bases de datos existentes
  - 7 pasos automatizados con logging detallado

#### Configuración de Red
- **Acceso desde múltiples dispositivos**
  - CORS configurado para IPs locales
  - Backend escucha en 0.0.0.0
  - Frontend configurable con VITE_API_URL
  - Soporte para:
    - localhost
    - IPs 192.168.x.x
    - IPs 10.x.x.x
    - IPs 172.16.x.x - 172.31.x.x

### 🗃️ Datos Base

**27 Actividades:**
- 15 Diarias: Gemas, bestias, eventos aleatorios, shadow war, defensa, etc.
- 8 Semanales: Capeo de gemas, rifts eldricos, warband, clan, helliquary, terror rifts
- 4 Temporada: Battlegrounds, Kion/Sombras, Torres de clan, Comerciantes especiales

**5 Eventos Programados:**
- Battlefield: 12:00, 20:00
- Poseído: 12:00, 20:00
- Asalto: 12:00, 20:00
- Sombras: 18:00, 21:00
- Arena: 14:00, 18:00, 22:00

**20 Recompensas:**
- battle_points, high_quality_equipment, gold, xp
- normal_gems, normal_gems_bound, rare_crests, legendary_crests
- fading_embers, platinum, abyssal_essence, monster_essence
- terror_essence, battle_pass_points, materials, scoria
- legendary_items, eternal_legendary, reforge_stones, horadrim_materials

### 🔧 Tecnologías Utilizadas

**Frontend:**
- React 18 con TypeScript
- Vite como bundler
- TailwindCSS para estilos
- Axios para peticiones HTTP
- React Context para estado global

**Backend:**
- Node.js con Express
- TypeScript
- PostgreSQL con pg driver
- JWT para autenticación
- bcrypt para passwords
- Helmet y CORS para seguridad
- Morgan para logging

### 📚 Documentación

- README.md: Guía de inicio rápido
- DEPLOY_V2.3.md: Instrucciones de despliegue
- RENDER_DEPLOY.md: Despliegue en Render
- REWARDS_SYSTEM_v2.5.md: Documentación completa del sistema de recompensas
- CHANGELOG.md: Este archivo

### 🎯 Características Destacadas

1. **Sistema de recompensas normalizado:** Primera versión con estructura relacional completa
2. **Auto-restore de datos:** Si eliminas tablas, el sistema las recrea automáticamente
3. **Filtros avanzados:** Por tipo, modalidad y recompensa
4. **Eventos en tiempo real:** Con barra de progreso y countdown
5. **Responsive completo:** Optimizado para todos los dispositivos
6. **Timezone correcto:** Offset de -2h aplicado consistentemente

### 🐛 Problemas Conocidos

- Ninguno en esta versión

### 📝 Notas de Migración

Para bases de datos existentes, ejecutar:
```bash
cd backend
npx ts-node src/database/migrations/migrate_rewards_v2.5.ts
```

Esto creará las tablas de recompensas y migrará los datos existentes.

---

**Versión:** 0.1.0  
**Fecha:** 30 de diciembre de 2025  
**Autor:** CareZapato  
**Estado:** Estable y funcional
