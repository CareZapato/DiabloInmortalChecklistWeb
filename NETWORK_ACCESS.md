# 🌐 Guía de Acceso por Red Local

Esta guía te ayudará a configurar la aplicación para que pueda ser accedida desde otras máquinas en tu red local.

## 📋 Requisitos Previos

1. Tener el backend y frontend funcionando localmente
2. Estar conectado a la misma red WiFi/LAN que las otras máquinas
3. Configurar el firewall para permitir conexiones

## 🔧 Configuración

### 1. Encontrar tu IP Local

**Windows:**
```bash
ipconfig
```
Busca "Dirección IPv4" en tu adaptador de red activo (ej: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# o
ip addr show
```

### 2. Configurar el Backend

El backend ya está configurado para escuchar en todas las interfaces (`0.0.0.0`).

**Opcional:** Si necesitas restringir los orígenes CORS, edita `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://192.168.1.100:5173,http://192.168.1.101:5173
```

### 3. Configurar el Firewall

**Windows:**
```powershell
# Permitir puerto 3000 (backend)
netsh advfirewall firewall add rule name="Diablo Checklist Backend" dir=in action=allow protocol=TCP localport=3000

# Permitir puerto 5173 (frontend en desarrollo)
netsh advfirewall firewall add rule name="Diablo Checklist Frontend" dir=in action=allow protocol=TCP localport=5173
```

**Mac:**
```bash
# El firewall de Mac generalmente permite conexiones entrantes por defecto
# Si está activado, agrega las reglas desde System Preferences > Security & Privacy > Firewall
```

**Linux (Ubuntu/Debian):**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 5173/tcp
```

## 🚀 Iniciar la Aplicación

### Modo 1: Desarrollo con Proxy (Recomendado)

1. **Inicia el backend:**
```bash
cd backend
npm run dev
```

2. **Inicia el frontend:**
```bash
cd frontend
npm run dev
```

3. **Accede desde otra máquina:**
```
http://<tu-ip>:5173
```
Ejemplo: `http://192.168.1.100:5173`

El proxy de Vite redirigirá automáticamente las peticiones `/api` al backend.

### Modo 2: Acceso Directo a la API

Si quieres que el frontend se conecte directamente a la IP del backend:

1. **Edita `frontend/.env`:**
```env
VITE_API_URL=http://192.168.1.100:3000
```

2. **Reinicia el frontend:**
```bash
npm run dev
```

## 🧪 Verificar Conexión

### Desde la máquina servidor:

1. **Backend:**
```bash
curl http://localhost:3000/api/health
```

2. **Frontend:**
Abre `http://localhost:5173` en tu navegador

### Desde otra máquina:

1. **Backend:**
```bash
curl http://192.168.1.100:3000/api/health
```

2. **Frontend:**
Abre `http://192.168.1.100:5173` en tu navegador

## 🐛 Solución de Problemas

### Error: No se puede conectar

1. **Verifica que el firewall permita las conexiones:**
   - Windows: Panel de Control > Firewall de Windows > Configuración avanzada
   - Asegúrate de que los puertos 3000 y 5173 estén permitidos

2. **Verifica que estés en la misma red:**
   ```bash
   ping <ip-del-servidor>
   ```

3. **Verifica que los servicios estén escuchando en todas las interfaces:**
   ```bash
   # Windows
   netstat -an | findstr "3000"
   netstat -an | findstr "5173"
   
   # Mac/Linux
   netstat -an | grep 3000
   netstat -an | grep 5173
   ```
   Deberías ver `0.0.0.0:3000` y `0.0.0.0:5173`

### Error CORS

Si ves errores de CORS en la consola del navegador:

1. **Verifica que el origen esté en la lista permitida** en `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://192.168.1.100:5173,http://192.168.1.101:5173
```

2. **Reinicia el backend** después de cambiar la configuración

### La página carga pero no funciona la API

1. **Verifica la configuración del proxy** en `frontend/vite.config.ts`
2. **O configura VITE_API_URL** en `frontend/.env` con la IP del backend

## 📱 Acceso desde Dispositivos Móviles

Para acceder desde un teléfono móvil en la misma red WiFi:

1. Asegúrate de que el teléfono esté en la misma red WiFi
2. Abre el navegador del móvil
3. Navega a: `http://<ip-del-servidor>:5173`
4. Ejemplo: `http://192.168.1.100:5173`

## 🎯 Acceso Rápido - Script

Puedes usar estos scripts para iniciar rápidamente:

**Windows (PowerShell):**
```powershell
# Guardar como start-network.ps1
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Select-Object -First 1).IPAddress
Write-Host "🌐 Tu IP es: $ip" -ForegroundColor Green
Write-Host "📱 Accede desde: http://${ip}:5173" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## 🔐 Notas de Seguridad

⚠️ **IMPORTANTE:**
- Esta configuración es para desarrollo y redes locales de confianza
- NO expongas estos puertos a Internet sin medidas de seguridad adicionales
- En producción, usa HTTPS y configuraciones de seguridad apropiadas
- Cambia `JWT_SECRET` en `backend/.env` antes de usar en producción

## 🆘 Soporte

Si tienes problemas:
1. Verifica que ambos servicios (backend y frontend) estén corriendo
2. Revisa los logs de la consola para errores
3. Verifica la configuración del firewall
4. Asegúrate de usar la IP correcta de tu máquina
