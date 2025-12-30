# Script para iniciar la aplicación con acceso por red
# Ejecutar: .\start-network.ps1

Write-Host "🔥 Iniciando Diablo Immortal Checklist - Modo Red Local" -ForegroundColor Yellow
Write-Host ""

# Obtener la IP local
$ip = $null
try {
    # Intentar obtener IP de WiFi
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    
    # Si no hay WiFi, intentar Ethernet
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    }
    
    # Si aún no hay IP, obtener la primera disponible que no sea loopback
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
    }
}
catch {
    Write-Host "⚠️  No se pudo detectar la IP automáticamente" -ForegroundColor Yellow
}

if ($ip) {
    Write-Host "🌐 Tu IP local: " -NoNewline -ForegroundColor Cyan
    Write-Host $ip -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Accede desde otra máquina o móvil:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://$ip:5173" -ForegroundColor White
    Write-Host "   Backend:  http://$ip:3000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Ejecuta 'ipconfig' para ver tu IP" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🔧 Verificando puertos en el firewall..." -ForegroundColor Cyan

# Verificar si las reglas del firewall existen
$rule3000 = Get-NetFirewallRule -DisplayName "Diablo Checklist Backend" -ErrorAction SilentlyContinue
$rule5173 = Get-NetFirewallRule -DisplayName "Diablo Checklist Frontend" -ErrorAction SilentlyContinue

if (-not $rule3000) {
    Write-Host "⚠️  Regla de firewall para puerto 3000 no encontrada" -ForegroundColor Yellow
    Write-Host "   Ejecuta como administrador:" -ForegroundColor Gray
    Write-Host '   netsh advfirewall firewall add rule name="Diablo Checklist Backend" dir=in action=allow protocol=TCP localport=3000' -ForegroundColor Gray
    Write-Host ""
}

if (-not $rule5173) {
    Write-Host "⚠️  Regla de firewall para puerto 5173 no encontrada" -ForegroundColor Yellow
    Write-Host "   Ejecuta como administrador:" -ForegroundColor Gray
    Write-Host '   netsh advfirewall firewall add rule name="Diablo Checklist Frontend" dir=in action=allow protocol=TCP localport=5173' -ForegroundColor Gray
    Write-Host ""
}

# Preguntar si desea configurar el firewall automáticamente
if (-not $rule3000 -or -not $rule5173) {
    $response = Read-Host "¿Deseas intentar configurar el firewall automáticamente? (Requiere permisos de administrador) [S/N]"
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "🔓 Intentando configurar el firewall..." -ForegroundColor Yellow
        
        if (-not $rule3000) {
            Start-Process powershell -Verb RunAs -ArgumentList "-Command", "netsh advfirewall firewall add rule name='Diablo Checklist Backend' dir=in action=allow protocol=TCP localport=3000" -Wait
        }
        
        if (-not $rule5173) {
            Start-Process powershell -Verb RunAs -ArgumentList "-Command", "netsh advfirewall firewall add rule name='Diablo Checklist Frontend' dir=in action=allow protocol=TCP localport=5173" -Wait
        }
        
        Write-Host "✅ Firewall configurado" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""

# Iniciar backend
Write-Host "▶️  Iniciando Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🔥 Backend Server' -ForegroundColor Red; npm run dev"

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "▶️  Iniciando Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '⚛️  Frontend Vite' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Aplicación iniciada!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Consejos:" -ForegroundColor Yellow
Write-Host "   • Asegúrate de que el backend y frontend estén completamente iniciados" -ForegroundColor Gray
Write-Host "   • Verifica que no haya errores en las ventanas que se abrieron" -ForegroundColor Gray
Write-Host "   • Si hay problemas de conexión, revisa NETWORK_ACCESS.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar este script..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
