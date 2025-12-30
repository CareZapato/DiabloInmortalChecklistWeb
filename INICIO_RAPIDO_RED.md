# 🚀 Inicio Rápido - Acceso por Red Local

## ⚡ Opción 1: Script Automático (Windows)

```powershell
npm run network:start
```

Este script:
- ✅ Detecta tu IP local automáticamente
- ✅ Te ofrece configurar el firewall
- ✅ Inicia backend y frontend
- ✅ Te muestra cómo acceder desde otros dispositivos

## 📱 Opción 2: Inicio Manual

### 1. Encuentra tu IP
```bash
ipconfig
```
Busca "Dirección IPv4" (ej: `192.168.1.100`)

### 2. Inicia los servicios
```bash
npm run dev
```

### 3. Accede desde otro dispositivo
Abre en el navegador:
```
http://192.168.1.100:5173
```
(Reemplaza `192.168.1.100` con tu IP)

## 🔥 Configuración del Firewall

**Opción Automática** (Requiere permisos de administrador):
```powershell
# Backend (puerto 3000)
netsh advfirewall firewall add rule name="Diablo Checklist Backend" dir=in action=allow protocol=TCP localport=3000

# Frontend (puerto 5173)
netsh advfirewall firewall add rule name="Diablo Checklist Frontend" dir=in action=allow protocol=TCP localport=5173
```

**Opción Manual**:
1. Panel de Control → Firewall de Windows → Configuración avanzada
2. Reglas de entrada → Nueva regla
3. Puerto → TCP → Puertos específicos: `3000, 5173`
4. Permitir la conexión

## 📋 Verificación

### Ver tu IP:
```bash
npm run network:info
```

### Probar backend:
```bash
curl http://localhost:3000/api/health
```

### Probar desde otro dispositivo:
```bash
curl http://<tu-ip>:3000/api/health
```

## 🐛 Problemas Comunes

### ❌ "No se puede conectar"
**Solución:**
1. Verifica que el firewall permita los puertos 3000 y 5173
2. Asegúrate de estar en la misma red WiFi/LAN
3. Comprueba que los servicios estén corriendo

### ❌ Error CORS
**Solución:**
Edita `backend/.env` y agrega tu IP a CORS_ORIGIN:
```env
CORS_ORIGIN=http://localhost:5173,http://192.168.1.100:5173,http://192.168.1.101:5173
```

### ❌ La API no responde
**Solución:**
1. Verifica que el backend esté corriendo en el puerto 3000
2. Prueba acceder a: `http://<tu-ip>:3000/api/health`
3. Revisa los logs del backend para errores

## 📖 Documentación Completa

Para más detalles, consulta [NETWORK_ACCESS.md](NETWORK_ACCESS.md)

## 💡 Consejos

- 🔐 Esta configuración es solo para desarrollo
- 📱 Funciona en móviles en la misma red WiFi
- 🌐 NO expongas estos puertos a Internet
- ✨ En producción, usa HTTPS y seguridad adicional
