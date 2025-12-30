# ⚔️ Diablo Immortal Checklist - Web Application

**Versión:** 0.1.0  
**Desarrollador:** CareZapato  
**Fecha:** 30 de diciembre de 2025

Aplicación web full-stack para gestionar actividades diarias/semanales/temporada de Diablo Immortal con sistema de recompensas normalizado, eventos programados y autenticación de usuarios.

> 📖 **Sistema de Recompensas:** Ver [REWARDS_SYSTEM_v2.5.md](REWARDS_SYSTEM_v2.5.md) para documentación completa del sistema de recompensas normalizado.

> 📋 **Cambios recientes:** Ver [CHANGELOG.md](CHANGELOG.md) para el historial completo de versiones.

> 🚀 **Deployment:** Ver [RENDER_DEPLOY.md](RENDER_DEPLOY.md) para instrucciones de despliegue en Render.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

## 🔧 Instalación Local

### 1. Clonar repositorio
```bash
git clone <tu-repo>
cd Web
```

### 2. Configurar PostgreSQL
```sql
CREATE DATABASE "DiabloInmortalChecklist";
```

### 3. Configurar variables de entorno

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/DiabloInmortalChecklist
BACKEND_PORT=3000
BACKEND_HOST=0.0.0.0
JWT_SECRET=tu_secreto_seguro_de_32_caracteres_minimo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Instalar dependencias y ejecutar

```bash
# Instalar todas las dependencias (root, backend, frontend)
npm install

# Ejecutar en modo desarrollo (backend + frontend)
npm run dev
```

**Acceso:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/api/activities

---

## 📱 Acceso desde Red Local (Móvil/Tablet)

### 1. Obtener IP local
```powershell
# Windows
ipconfig
# Buscar IPv4 (ej: 192.168.1.158)
```

### 2. Configurar CORS
El backend ya está configurado para aceptar conexiones de red local (regex incluido en CORS).

### 3. Acceder desde dispositivo
```
http://192.168.1.158:5173
```

### 4. Firewall (si es necesario)
```powershell
# Permitir puerto 3000 (backend)
New-NetFirewallRule -DisplayName "Diablo Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Permitir puerto 5173 (frontend)
New-NetFirewallRule -DisplayName "Diablo Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## 🗄️ Base de Datos

### Auto-Restauración
El backend ejecuta automáticamente en cada inicio:
1. **Verificación de tablas** → Crea si no existen
2. **Verificación de datos** → Seed si están vacíos

**Sistema idempotente:** Puede ejecutarse múltiples veces sin problemas.

### Migración Manual (si es necesario)
```bash
cd backend
npm run db:seed
```

### Estructura
- **users**: Cuentas de usuario
- **activities**: 27 actividades del juego (diarias/semanales/temporada)
- **user_progress**: Registro de completado por fecha
- **scheduled_events**: 5 eventos programados con horarios

---

## 📊 Características

✅ **Dashboard Interactivo**
- 27 actividades organizadas por prioridad (S+ a C)
- Filtros por tipo (diaria/semanal/temporada)
- Filtros por modalidad (individual/grupal/ambas)
- Checkbox independiente (no abre modal en móvil)

✅ **Eventos en Tiempo Real**
- 5 eventos programados con horarios del juego
- Barra de progreso animada
- Cálculo basado en tiempo transcurrido desde evento anterior
- Actualización automática cada 60 segundos
- Offset de tiempo del juego: -2 horas

✅ **Sistema de Progreso**
- Toggle de completado por actividad/fecha
- Historial persistente
- Indicadores visuales por estado

✅ **Autenticación**
- JWT con sesiones de 7 días
- Login con email o username
- Registro de usuarios
- Protección de rutas

---

## 📁 Estructura del Proyecto

```
Web/
├── backend/           # API Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio (activity, event, auth, progress, reward)
│   │   ├── routes/        # Endpoints API
│   │   ├── models/        # Tipos TypeScript (Activity, Event, Reward, User, etc.)
│   │   ├── middleware/    # Auth, Error handling
│   │   ├── database/      # Init, seed, migrations
│   │   │   └── migrations/  # Scripts de migración (migrate_rewards_v2.5.ts)
│   │   └── config/        # Database pool
│   └── .env
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/         # Dashboard, Login, Register, Changelog
│   │   ├── components/    # Calendar, etc.
│   │   ├── contexts/      # AuthContext
│   │   ├── services/      # API calls (axios)
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helpers (time, priority)
│   └── .env
├── REWARDS_SYSTEM_v2.5.md  # 📖 Documentación sistema de recompensas
├── CHANGELOG.md            # 📋 Historial de cambios
├── RENDER_DEPLOY.md        # 🚀 Guía de deployment
└── README.md               # Este archivo
```

---

## 🔗 Endpoints API

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual (requiere JWT)

### Activities
- `GET /api/activities` - Lista todas las actividades con rewards
- `GET /api/activities/:id` - Detalle de actividad con rewards

### Events
- `GET /api/events/upcoming` - Próximos 10 eventos ordenados por tiempo con rewards

### Progress
- `GET /api/progress/date/:date` - Progreso de fecha (YYYY-MM-DD)
- `POST /api/progress/toggle` - Toggle completado
  ```json
  { "activityId": "daily_gemas_party4", "date": "2025-12-30" }
  ```

### Rewards (Nuevo en v0.1.0)
- `GET /api/rewards` - Lista todas las recompensas
- `GET /api/rewards/:rewardId/activities` - Actividades que otorgan una recompensa
- `GET /api/rewards/:rewardId/events` - Eventos que otorgan una recompensa

---

## 🎮 Datos del Juego

### Actividades
- **27 actividades base:** 15 diarias, 8 semanales, 4 de temporada
- **Sistema de prioridades:** Crítica, Alta, Media, Baja
- **Modalidades:** Individual, Grupal, Ambas

### Recompensas (Nuevo en v0.1.0)
- **20 recompensas únicas** con sistema normalizado
- **31 relaciones actividad-recompensa** con cantidades específicas
- **14 relaciones evento-recompensa** con cantidades específicas
- **Filtrado avanzado** por tipo de recompensa
- Incluye: Gemas, Cimeras, Platino, Brasas, Esencias, Materiales, Legendarios, etc.

### Eventos Programados
- **5 eventos del día** con horarios múltiples
- **Barra de progreso animada** que muestra el tiempo transcurrido
- **Countdown en tiempo real** hasta el próximo evento
- **Estado visual:** Verde (activo), Amarillo (próximo)

| Evento | Horarios | Tipo |
|--------|----------|------|
| Battlefield | 12:00, 20:00 | PvP |
| Carruaje Poseído | 12:00, 20:00 | World Event |
| Asalto a la Cámara | 12:00, 20:00 | Faction |
| Reunión de las Sombras | 18:00, 21:00 | Faction |
| Arena Ancestral | 14:00, 18:00, 22:00 | PvP |

---

## 🛠️ Scripts Disponibles

### Root
```bash
npm run dev          # Backend + Frontend en paralelo
npm install          # Instala deps de root, backend y frontend
```

### Backend
```bash
cd backend
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Producción (requiere build)
npm run db:seed      # Seed manual de datos
```

### Frontend
```bash
cd frontend
npm run dev          # Servidor Vite
npm run build        # Build para producción
npm run preview      # Preview del build
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"
- Verificar PostgreSQL corriendo: `psql -U postgres -c "SELECT 1"`
- Verificar DATABASE_URL en `.env`
- Crear BD si no existe

### Error: "CORS blocked"
- Verificar CORS_ORIGIN en backend `.env`
- Verificar VITE_API_URL en frontend `.env`
- Reiniciar ambos servidores

### Frontend no conecta con Backend
- Verificar backend corriendo en puerto 3000
- Verificar VITE_API_URL en frontend `.env`
- Abrir devtools → Network para ver errores

---

## ✨ Características Destacadas v0.1.0

1. **Sistema de recompensas normalizado** con base de datos relacional
2. **Auto-restore de datos**: Si eliminas tablas, el sistema las recrea automáticamente
3. **Filtros avanzados** por tipo, modalidad y recompensa
4. **Eventos en tiempo real** con barra de progreso y countdown
5. **100% responsive** optimizado para todos los dispositivos
6. **Timezone correcto** con offset de -2h aplicado consistentemente

---

## 📋 Documentación

- [REWARDS_SYSTEM_v2.5.md](REWARDS_SYSTEM_v2.5.md) - Sistema de recompensas completo
- [CHANGELOG.md](CHANGELOG.md) - Historial de versiones
- [RENDER_DEPLOY.md](RENDER_DEPLOY.md) - Guía de deployment

---

## 📄 Licencia

MIT

---

## 👤 Autor

**CareZapato**  
Diablo Immortal Checklist v0.1.0  
Diciembre 2025

---

¡Que tus runs sean legendarios! ⚔️🔥
cd frontend
npm install
cd ..

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 3. Configurar variables de entorno

El archivo `.env` ya está configurado en `backend/.env` con:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=DiabloInmortalChecklist
JWT_SECRET=diablo-immortal-secret-key-change-in-production
JWT_EXPIRES_IN=7d
BACKEND_PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 4. Crear tablas en la base de datos

```bash
npm run db:migrate
```

### 5. Poblar la base de datos con actividades y eventos

```bash

---

�Que tus runs sean legendarios! 
