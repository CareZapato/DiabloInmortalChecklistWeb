# Script de configuración inicial para Diablo Immortal Checklist Web

Write-Host "⚔️  Diablo Immortal Checklist - Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Buscar PostgreSQL
$pgPath = ""
$pgVersions = @("17", "16", "15", "14", "13")
foreach ($ver in $pgVersions) {
    $testPath = "C:\Program Files\PostgreSQL\$ver\bin\psql.exe"
    if (Test-Path $testPath) {
        $pgPath = $testPath
        break
    }
}

if ($pgPath) {
    Write-Host "✅ PostgreSQL encontrado" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📊 Creando base de datos..." -ForegroundColor Cyan
    
    $env:PGPASSWORD = "123456"
    & $pgPath -U postgres -c "CREATE DATABASE DiabloInmortalChecklist;" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos creada" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  La base de datos ya existe (OK)" -ForegroundColor Yellow
    }
    
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
else {
    Write-Host "⚠️  PostgreSQL no encontrado en PATH" -ForegroundColor Yellow
    Write-Host "   Asegúrate de que PostgreSQL esté instalado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Instalando dependencias..." -ForegroundColor Cyan

Write-Host "   Backend..." -ForegroundColor Gray
Set-Location backend
npm install | Out-Null
Set-Location ..

Write-Host "   Frontend..." -ForegroundColor Gray  
Set-Location frontend
npm install | Out-Null
Set-Location ..

Write-Host ""
Write-Host "📋 Creando tablas..." -ForegroundColor Cyan
Set-Location backend
npm run db:migrate

Write-Host ""
Write-Host "🌱 Poblando datos..." -ForegroundColor Cyan
npm run db:seed
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar: npm run dev" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
