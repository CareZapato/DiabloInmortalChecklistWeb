# 🚀 Guía de Deploy en Render

Este proyecto está configurado para desplegarse en **Render** con un solo servicio que sirve tanto el backend (API) como el frontend (React).

## 📋 Requisitos Previos

1. Una cuenta en [Render](https://render.com)
2. Un repositorio conectado: `https://github.com/CareZapato/DiabloInmortalChecklistWeb`
3. Una base de datos PostgreSQL (puedes crearla gratis en Render)

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

1. En Render Dashboard, haz clic en **"New +"** → **"PostgreSQL"**
2. Configura:
   - **Name**: `diablo-checklist-db`
   - **Database**: `diablo_checklist_db`
   - **User**: Se genera automáticamente
   - **Region**: Elige el más cercano
   - **Plan**: Free
3. Haz clic en **"Create Database"**
4. **Guarda las credenciales** que aparecen (Internal Database URL)

## 🌐 Paso 2: Crear Web Service

1. En Render Dashboard, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura el servicio:

### Build & Deploy Settings

```
Name: diablo-immortal-checklist
Region: Oregon (US West) o el más cercano
Branch: main
Root Directory: (dejar vacío)
Environment: Node
Build Command: npm run build
Start Command: npm start
```

### Variables de Entorno

Añade estas variables en la sección **Environment**:

```
NODE_ENV=production
DB_HOST=[Tu Internal Database URL de Render - solo el host]
DB_PORT=5432
DB_USER=[Usuario de tu DB]
DB_PASSWORD=[Contraseña de tu DB]
DB_NAME=diablo_checklist_db
JWT_SECRET=[Genera un string aleatorio seguro]
JWT_EXPIRES_IN=7d
BACKEND_PORT=10000
CORS_ORIGIN=*
```

**💡 Tip**: Para obtener el `DB_HOST`, copia la **Internal Database URL** que Render te dio. Por ejemplo:
- URL completa: `postgres://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
- DB_HOST: `dpg-xxxxx-a.oregon-postgres.render.com`

### Plan

- **Instance Type**: Free

4. Haz clic en **"Create Web Service"**

## 🎯 Paso 3: Verificar el Deploy

1. Render automáticamente:
   - ✅ Instalará todas las dependencias
   - ✅ Construirá el frontend (React + Vite)
   - ✅ Compilará el backend (TypeScript)
   - ✅ Iniciará el servidor que sirve ambos

2. Una vez completado, verás la URL de tu aplicación: `https://diablo-immortal-checklist.onrender.com`

3. **Inicialización automática de la base de datos**: La primera vez que inicie, el backend:
   - Creará todas las tablas automáticamente
   - Poblará las 29 actividades
   - Configurará los 2 eventos (Campo de Batalla y Pesadilla Ancestral)

## 🔍 Verificar que Todo Funciona

1. Visita tu URL: `https://tu-app.onrender.com`
2. Deberías ver la página de login/registro
3. Crea una cuenta nueva
4. Verifica que el dashboard cargue con todas las actividades

## 🐛 Troubleshooting

### El deploy falla con errores de TypeScript
- ✅ **Solucionado**: TypeScript y @types están en `dependencies`

### Error de conexión a la base de datos
1. Verifica que las variables `DB_*` estén correctamente configuradas
2. Asegúrate de usar la **Internal Database URL** (no la External)
3. El formato debe ser: `dpg-xxxxx-a.region-postgres.render.com`

### La página carga pero no hay actividades
1. Revisa los logs en Render Dashboard
2. La inicialización automática debe mostrar: `✅ Database initialization completed!`
3. Si falla, puedes ejecutar manualmente: `npm run db:seed` desde el Shell de Render

### Error 404 en rutas del frontend
- Esto está solucionado: el backend sirve `index.html` para todas las rutas no-API

## 📝 Comandos Útiles en Render Shell

Puedes acceder al Shell desde el Dashboard de tu servicio:

```bash
# Ver usuarios registrados
npm run list-users

# Resetear contraseña de un usuario
npm run reset-password username nueva_contraseña

# Poblar/actualizar actividades manualmente
npm run db:seed

# Crear tablas manualmente (solo si es necesario)
npm run db:migrate
```

## 🔄 Actualizaciones

Cada vez que hagas `git push` a la rama `main`, Render automáticamente:
1. Detectará el cambio
2. Ejecutará el build
3. Desplegará la nueva versión
4. Mantendrá la base de datos intacta

## 💰 Limitaciones del Plan Gratuito

- El servicio se "duerme" después de 15 minutos de inactividad
- Primera petición después de dormir tardará ~30 segundos
- 750 horas/mes de uptime
- Base de datos PostgreSQL expira después de 90 días (pero puedes renovarla)

## 🎮 URL Final

Tu aplicación estará disponible en:
```
https://diablo-immortal-checklist.onrender.com
```

¡Disfruta tu checklist de Diablo Immortal! ⚔️🔥
