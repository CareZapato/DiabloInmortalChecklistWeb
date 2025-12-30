import React from 'react';
import { useNavigate } from 'react-router-dom';

const Changelog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-diablo-dark">
      {/* Header */}
      <header className="bg-diablo-panel border-b border-diablo-border p-4 sticky top-0 z-40 backdrop-blur-sm bg-diablo-panel/95">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-diablo-gold transition text-2xl"
              title="Volver"
            >
              ←
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-diablo-gold">
              📋 Changelog
            </h1>
          </div>
          <span className="text-xs text-gray-500 font-mono bg-diablo-medium px-3 py-1 rounded">
            v0.1.0
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Version 0.1.0 */}
        <div className="bg-diablo-panel border border-diablo-border rounded-lg overflow-hidden mb-8">
          {/* Version Header */}
          <div className="bg-gradient-to-r from-diablo-red/20 to-transparent p-6 border-b border-diablo-border">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-diablo-gold mb-2">
                  Versión 0.1.0
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>📅</span>
                    <span>30 de diciembre, 2025</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>👨‍💻</span>
                    <span>CareZapato</span>
                  </span>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg border border-green-700/50 font-semibold text-sm">
                🎉 Lanzamiento Inicial
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 space-y-6">
            {/* Sistema de Actividades */}
            <section>
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>✨</span>
                <span>Sistema de Actividades</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">27 actividades base:</strong> 15 diarias, 8 semanales, 4 de temporada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Seguimiento de progreso</strong> por fecha con checkbox optimizado para móvil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Filtros avanzados:</strong> tipo (diaria/semanal/temporada), modalidad (individual/grupal/ambas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Sistema de prioridades:</strong> crítica, alta, media, baja</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Información detallada:</strong> tiempo estimado, recompensas, mejora que aporta</span>
                </li>
              </ul>
            </section>

            {/* Sistema de Recompensas */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>🎁</span>
                <span>Sistema de Recompensas Normalizado</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">20 recompensas únicas</strong> con nombre, descripción y cantidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Base de datos relacional:</strong> tablas separadas con relaciones many-to-many</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Filtro por recompensas:</strong> buscar actividades que otorguen una recompensa específica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">31 relaciones actividad-recompensa</strong> y 14 relaciones evento-recompensa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span className="text-gray-400">
                    Incluye: Gemas normales, Cimeras legendarias, Platino, Brasas, Esencias, Materiales Horádrim, y más
                  </span>
                </li>
              </ul>
            </section>

            {/* Eventos */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>⏰</span>
                <span>Sistema de Eventos Programados</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">5 eventos programados:</strong> Battlefield, Poseído, Asalto, Sombras, Arena</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Visualización en tiempo real</strong> con barra de progreso animada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Countdown dinámico:</strong> muestra minutos u horas hasta el próximo evento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Estado visual:</strong> verde para activos, amarillo para próximos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Actualización automática</strong> cada minuto</span>
                </li>
              </ul>
            </section>

            {/* Calendario */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>📅</span>
                <span>Calendario y Navegación</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Calendario mensual</strong> con indicadores de progreso diario</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Navegación rápida:</strong> día anterior/siguiente, botón "Hoy"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Hora del juego</strong> con offset de -2h correctamente aplicado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Contador de reinicio diario</strong> visible en el header</span>
                </li>
              </ul>
            </section>

            {/* UI/UX */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>🎨</span>
                <span>Interfaz y Experiencia</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Diseño temático Diablo:</strong> paleta rojo/dorado/negro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">100% responsive:</strong> optimizado para móvil, tablet y desktop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Filtros adaptativos:</strong> sidebar en desktop, drawer en móvil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Animaciones suaves</strong> y transiciones con hover effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Sticky header</strong> con información relevante siempre visible</span>
                </li>
              </ul>
            </section>

            {/* Backend */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>⚙️</span>
                <span>Backend y Base de Datos</span>
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">API RESTful</strong> con Express y TypeScript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">PostgreSQL 15+</strong> con 7 tablas normalizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Auto-restore:</strong> si eliminas tablas, se recrean automáticamente al deployar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Seed automático</strong> de 27 actividades, 5 eventos, 20 recompensas y relaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">Autenticación JWT</strong> con sesiones de 7 días</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-diablo-gold mt-0.5">•</span>
                  <span><strong className="text-diablo-gold-light">CORS configurado</strong> para acceso desde red local</span>
                </li>
              </ul>
            </section>

            {/* Tecnologías */}
            <section className="border-t border-diablo-border pt-6">
              <h3 className="text-lg font-bold text-diablo-gold-light mb-3 flex items-center gap-2">
                <span>🔧</span>
                <span>Stack Tecnológico</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-diablo-gold mb-2">Frontend</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">React 18</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">TypeScript</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">Vite</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">TailwindCSS</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">Axios</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-diablo-gold mb-2">Backend</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">Node.js</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">Express</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">TypeScript</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">PostgreSQL</span>
                    <span className="px-2 py-1 bg-diablo-medium rounded text-xs text-gray-300">JWT</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Desarrollado por <span className="text-diablo-gold font-semibold">CareZapato</span></p>
          <p className="mt-1">Diablo Immortal Checklist © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
