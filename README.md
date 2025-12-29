# ⚔️ Diablo Immortal Checklist - Web Application

Aplicación web full-stack para gestionar actividades diarias/semanales/temporada de Diablo Immortal con autenticación de usuarios.

## 🚀 Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **TailwindCSS** para estilos (tema Diablo)
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **date-fns** para manejo de fechas

### Backend
- **Node.js** con **Express** y TypeScript
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14

## 🔧 Instalación

### 1. Configurar PostgreSQL

Primero, crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE "DiabloInmortalChecklist";
```

O desde PowerShell:
```powershell
psql -U postgres -c "CREATE DATABASE \"DiabloInmortalChecklist\";"
```

### 2. Instalar dependencias

Desde la carpeta `Web`, ejecuta:

```bash
# Instalar dependencias del root
npm install

# Instalar dependencias del frontend
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
npm run db:seed
```

## 🎮 Ejecutar la Aplicación

Desde la carpeta `Web`, ejecuta un solo comando que levantará ambos servidores:

```bash
npm run dev
```

Esto iniciará:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📱 Uso de la Aplicación

### Primera vez

1. Abre http://localhost:5173
2. Haz clic en "Regístrate aquí"
3. Crea tu cuenta con:
   - Nombre de usuario (mínimo 3 caracteres)
   - Email válido
   - Contraseña (mínimo 6 caracteres)
4. Automáticamente serás redirigido al dashboard

### Funcionalidades

#### 🎮 Dashboard Principal

- **Hora del Juego**: Muestra la hora del juego (UTC-4, -2 horas respecto a Chile)
- **Hora de Chile**: Muestra la hora local de Chile
- **Tiempo restante**: Contador hasta el reset diario (3:00 AM)

#### ⏰ Panel de Eventos

- Muestra los próximos 5 eventos programados
- Estados:
  - **Verde (▶)**: Evento activo ahora
  - **Amarillo (⏱)**: Próximo evento
- Eventos incluidos:
  - Campo de Batalla (18:00, 22:00)
  - Reunión de las Sombras (19:00)
  - Asalto a la Cámara (19:00)
  - Puertas Demoníacas (20:30, 22:00)

#### 📋 Lista de Actividades

- **Filtros**: Todas / Diarias / Semanales / Temporada
- **Prioridades con colores**:
  - S+: Rojo-Naranja (crítico)
  - S: Naranja-Amarillo (muy importante)
  - A+: Amarillo-Verde
  - A: Verde
  - B+/B: Azul
  - C: Gris

- **Checkbox**: Marca como completada (se guarda por usuario y fecha)
- **Click en actividad**: Ver detalles completos

#### 📝 Panel de Detalles

Al hacer click en una actividad, verás:
- Nombre completo
- Prioridad
- Tiempo aproximado
- Recompensas
- Mejoras que aporta
- Detalles completos de cómo completarla

### Progreso por Usuario

Cada usuario tiene su propio progreso independiente:
- El progreso se guarda por fecha
- Puedes ver qué completaste cada día
- Las actividades semanales se acumulan durante la semana

## 🗄️ Estructura del Proyecto

```
Web/
├── package.json          # Scripts root para levantar todo
├── backend/
│   ├── src/
│   │   ├── index.ts      # Servidor Express
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Activity.ts
│   │   │   ├── UserProgress.ts
│   │   │   └── ScheduledEvent.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── activity.controller.ts
│   │   │   ├── progress.controller.ts
│   │   │   └── event.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── activity.routes.ts
│   │   │   ├── progress.routes.ts
│   │   │   └── event.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── database/
│   │       ├── migrate.ts   # Crear tablas
│   │       └── seed.ts      # Poblar datos
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── activity.service.ts
│   │   │   ├── progress.service.ts
│   │   │   └── event.service.ts
│   │   ├── utils/
│   │   │   ├── timeUtils.ts
│   │   │   └── priorityUtils.ts
│   │   └── pages/
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       └── Dashboard.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Actividades
- `GET /api/activities` - Listar todas las actividades
- `GET /api/activities/:id` - Obtener una actividad

### Progreso
- `GET /api/progress` - Obtener progreso del usuario
- `GET /api/progress/date/:date` - Progreso de una fecha específica
- `PUT /api/progress/:activityId` - Actualizar progreso

### Eventos
- `GET /api/events` - Listar todos los eventos
- `GET /api/events/upcoming` - Próximos 5 eventos

## 🎨 Tema Visual

La aplicación usa una paleta de colores inspirada en Diablo:
- **Fondos**: Negros y marrones oscuros (#0a0a0a, #1a1410)
- **Acentos**: Dorado (#d4af37) y rojo (#8b0000)
- **Bordes**: Marrones (#3d2817)
- **Prioridades**: Degradados de colores según importancia

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- JWT con expiración de 7 días
- Tokens almacenados en localStorage
- Middleware de autenticación en todas las rutas protegidas
- Validación de inputs con express-validator

## 📊 Base de Datos

### Tablas

1. **users**: Usuarios del sistema
2. **activities**: Catálogo de actividades del juego
3. **user_progress**: Progreso de cada usuario por actividad y fecha
4. **scheduled_events**: Eventos programados con horarios

### Relaciones

- `user_progress.user_id` → `users.id`
- `user_progress.activity_id` → `activities.id`

## 🛠️ Scripts Disponibles

Desde la carpeta `Web`:

```bash
npm run dev           # Levantar frontend + backend
npm run dev:frontend  # Solo frontend
npm run dev:backend   # Solo backend
npm run build         # Build de producción
npm run db:migrate    # Crear tablas
npm run db:seed       # Poblar datos
npm run reset-password <username> <nueva-contraseña>  # Resetear contraseña de un usuario
```

## 🔑 Resetear Contraseña

Si olvidaste tu contraseña o tienes problemas para iniciar sesión, puedes resetearla desde el backend:

```bash
cd Web/backend
npm run reset-password tu_usuario 123456
```

Esto actualizará la contraseña del usuario en la base de datos con el hash correcto.

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

Verifica que PostgreSQL esté corriendo:
```powershell
Get-Service postgresql*
```

Si no está corriendo:
```powershell
Start-Service postgresql-x64-14
```

### Puerto ya en uso

Si el puerto 3000 o 5173 están ocupados:
- Cambia `BACKEND_PORT` en `backend/.env`
- Cambia `server.port` en `frontend/vite.config.ts`

### Error de autenticación

Limpia el localStorage del navegador:
```javascript
// En la consola del navegador
localStorage.clear()
```

## 📝 Notas

- La aplicación maneja automáticamente la diferencia horaria de -2 horas entre el juego y Chile
- El reset diario es a las 3:00 AM (hora del juego)
- Los eventos se actualizan automáticamente cada minuto
- El progreso semanal se acumula desde el lunes

## 🔮 Próximas Mejoras

- [ ] Navegación de fechas (anterior/siguiente día)
- [ ] Estadísticas de progreso semanal/mensual
- [ ] Notificaciones de eventos próximos
- [ ] Modo oscuro/claro
- [ ] Export/import de progreso
- [ ] Recordatorios por email

## 👤 Autor

Versión Web desarrollada en diciembre 2025
Basada en la aplicación Python original de Diablo Immortal Checklist

## 📄 Licencia

MIT

---

¡Que tus runs sean legendarios! ⚔️🔥
