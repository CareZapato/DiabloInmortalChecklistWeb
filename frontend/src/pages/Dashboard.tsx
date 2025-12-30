import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activity.service';
import { progressService } from '../services/progress.service';
import { eventService } from '../services/event.service';
import { Activity, UserProgress, UpcomingEvent } from '../types';
import { formatDate, formatTime, getGameTime, getTimeUntilReset, formatMinutesUntil } from '../utils/timeUtils';
import { getPriorityBadgeClass } from '../utils/priorityUtils';
import Calendar from '../components/Calendar';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [filter, setFilter] = useState<'todas' | 'diaria' | 'semanal' | 'temporada'>('todas');
  const [modalidadFilter, setModalidadFilter] = useState<'todas' | 'individual' | 'grupal' | 'ambas'>('todas');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [gameTime, setGameTime] = useState(getGameTime());
  const [selectedDate, setSelectedDate] = useState(formatDate(getGameTime()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadActivities = async () => {
    try {
      const data = await activityService.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadProgress = async (date: string) => {
    try {
      const data = await progressService.getByDate(date);
      const progressMap = new Map<string, boolean>();
      data.forEach((p: UserProgress) => {
        progressMap.set(p.activity_id, p.is_completed);
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await eventService.getUpcoming();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    loadActivities();
    loadProgress(selectedDate);
    loadEvents();

    // Update time every minute
    const interval = setInterval(() => {
      setGameTime(getGameTime());
      loadEvents();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    loadProgress(date);
    setShowCalendar(false);
  };

  const goToPreviousDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const newDate = formatDate(date);
    setSelectedDate(newDate);
    loadProgress(newDate);
  };

  const goToNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 1);
    const newDate = formatDate(date);
    setSelectedDate(newDate);
    loadProgress(newDate);
  };

  const goToToday = () => {
    const today = formatDate(getGameTime());
    setSelectedDate(today);
    loadProgress(today);
  };

  const handleToggleProgress = async (activityId: string) => {
    const currentStatus = progress.get(activityId) || false;
    try {
      await progressService.update(activityId, !currentStatus, selectedDate);
      setProgress(new Map(progress.set(activityId, !currentStatus)));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredActivities = activities.filter((a) => {
    // Filter by type
    if (filter !== 'todas' && a.tipo !== filter) return false;
    
    // Filter by modalidad
    if (modalidadFilter !== 'todas' && a.modo !== modalidadFilter) return false;
    
    return true;
  });

  const { hours, minutes } = getTimeUntilReset();

  return (
    <div className="min-h-screen bg-diablo-dark">
      {/* Header Compacto - Solo Logo y Usuario */}
      <header className="bg-diablo-panel border-b border-diablo-border p-3 sm:p-4 sticky top-0 z-40 backdrop-blur-sm bg-diablo-panel/95">
        <div className="container mx-auto">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-diablo-gold whitespace-nowrap">
                ⚔️ <span className="hidden sm:inline">DI Checklist</span>
              </h1>
              {/* Info de tiempo integrada */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">Hora del Juego</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">🎮</span>
                    <span className="text-diablo-gold font-bold text-base">{formatTime(gameTime)}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">Reinicio en</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">⏰</span>
                    <span className="text-diablo-gold font-bold text-base">{hours}h {minutes}m</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-gray-300 text-sm sm:text-base">
                <span className="text-diablo-gold font-semibold">{user?.username}</span>
              </span>
              <button onClick={logout} className="btn-secondary text-xs px-2 py-1 sm:px-3 sm:py-1.5">
                <span className="hidden sm:inline">Salir</span>
                <span className="sm:hidden">✕</span>
              </button>
            </div>
          </div>
          {/* Time info para móvil */}
          <div className="flex md:hidden justify-between items-center mt-2 pt-2 border-t border-diablo-border">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase mb-0.5">Hora del Juego</span>
              <span className="text-gray-400 text-sm">🎮 <span className="text-diablo-gold font-bold">{formatTime(gameTime)}</span></span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-500 uppercase mb-0.5">Reinicio en</span>
              <span className="text-gray-400 text-sm">⏰ <span className="text-diablo-gold font-bold">{hours}h {minutes}m</span></span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Barra de Navegación y Acciones */}
        <div className="bg-diablo-panel border border-diablo-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Navegación de Fechas */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="w-9 h-9 flex items-center justify-center bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition"
                title="Día anterior"
              >
                ◀
              </button>
              <div className="flex-1 sm:flex-none text-center px-3">
                <div className="text-diablo-gold font-bold text-sm sm:text-base">{selectedDate}</div>
                <div className="text-xs text-gray-400">
                  {selectedDate === formatDate(getGameTime()) ? 'Hoy' : new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long' })}
                </div>
              </div>
              <button
                onClick={goToNextDay}
                className="w-9 h-9 flex items-center justify-center bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition"
                title="Día siguiente"
              >
                ▶
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 bg-diablo-gold text-diablo-dark hover:bg-yellow-500 rounded font-semibold transition text-sm"
              >
                Hoy
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex-1 sm:flex-none px-3 py-2 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition flex items-center justify-center gap-2 text-sm"
              >
                📅 <span>{showCalendar ? 'Ocultar' : 'Calendario'}</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none px-3 py-2 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition flex items-center justify-center gap-2 text-sm lg:hidden"
              >
                🔍 <span>Filtros</span>
                {(filter !== 'todas' || modalidadFilter !== 'todas') && (
                  <span className="w-2 h-2 bg-diablo-gold rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Calendar Section */}
        {showCalendar && (
          <div className="mb-6">
            <Calendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              totalActivities={activities.length}
            />
          </div>
        )}

        {/* Próximos Eventos - Compacto */}
        {events.length > 0 && (
          <div className="bg-diablo-panel border border-diablo-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                <span>⏰</span>
                <span>Próximos Eventos</span>
              </h3>
              <span className="text-xs text-gray-500">{events.length} eventos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {events.slice(0, 6).map((event, index) => (
                <div key={index} className="bg-diablo-medium border border-diablo-border rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className={`text-sm ${event.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {event.status === 'active' ? '▶' : '⏱'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-diablo-gold font-semibold text-xs truncate">{event.nombre}</div>
                    <div className="text-gray-400 text-xs">
                      {event.time} · {formatMinutesUntil(event.minutesUntil)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gradient-to-br from-diablo-panel to-diablo-medium/30 border border-diablo-border rounded-xl p-4 sticky top-24 z-10 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-diablo-border/50">
                <h3 className="text-sm font-bold text-diablo-gold flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span>Filtros</span>
                </h3>
                {(filter !== 'todas' || modalidadFilter !== 'todas') && (
                  <button
                    onClick={() => {
                      setFilter('todas');
                      setModalidadFilter('todas');
                    }}
                    className="text-xs text-gray-400 hover:text-diablo-gold transition"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Tipo</label>
                  <div className="space-y-1.5">
                    {['todas', 'diaria', 'semanal', 'temporada'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`w-full px-3 py-2 rounded-lg transition-all text-sm text-left ${
                          filter === f 
                            ? 'bg-diablo-gold text-diablo-dark font-semibold shadow-md transform scale-[1.02]' 
                            : 'bg-diablo-medium/50 text-gray-300 hover:bg-diablo-medium border border-diablo-border/30 hover:border-diablo-border'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Modalidad</label>
                  <div className="space-y-1.5">
                    {[
                      { value: 'todas', icon: '🎮', label: 'Todas' },
                      { value: 'individual', icon: '👤', label: 'Individual' },
                      { value: 'grupal', icon: '👥', label: 'Grupal' },
                      { value: 'ambas', icon: '⚔️', label: 'Ambas' }
                    ].map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setModalidadFilter(m.value as any)}
                        className={`w-full px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                          modalidadFilter === m.value 
                            ? 'bg-diablo-gold text-diablo-dark font-semibold shadow-md transform scale-[1.02]' 
                            : 'bg-diablo-medium/50 text-gray-300 hover:bg-diablo-medium border border-diablo-border/30 hover:border-diablo-border'
                        }`}
                      >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="lg:col-span-2">
            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowFilters(false)}>
                <div className="bg-gradient-to-b from-diablo-panel to-diablo-medium w-full rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  {/* Handle bar */}
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
                  
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-diablo-border/50">
                    <h3 className="text-lg font-bold text-diablo-gold flex items-center gap-2">
                      <span className="text-xl">🔍</span>
                      <span>Filtros</span>
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-diablo-medium hover:bg-diablo-red text-gray-400 hover:text-white transition"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Tipo de Actividad</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['todas', 'diaria', 'semanal', 'temporada'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                              filter === f 
                                ? 'bg-diablo-gold text-diablo-dark shadow-lg shadow-diablo-gold/30 scale-[1.02]' 
                                : 'bg-diablo-medium/70 text-gray-300 border border-diablo-border/30 active:scale-95'
                            }`}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Modalidad de Juego</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'todas', icon: '🎮', label: 'Todas' },
                          { value: 'individual', icon: '👤', label: 'Individual' },
                          { value: 'grupal', icon: '👥', label: 'Grupal' },
                          { value: 'ambas', icon: '⚔️', label: 'Ambas' }
                        ].map((m) => (
                          <button
                            key={m.value}
                            onClick={() => setModalidadFilter(m.value as any)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                              modalidadFilter === m.value 
                                ? 'bg-diablo-gold text-diablo-dark shadow-lg shadow-diablo-gold/30 scale-[1.02]' 
                                : 'bg-diablo-medium/70 text-gray-300 border border-diablo-border/30 active:scale-95'
                            }`}
                          >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {(filter !== 'todas' || modalidadFilter !== 'todas') && (
                      <button
                        onClick={() => {
                          setFilter('todas');
                          setModalidadFilter('todas');
                        }}
                        className="w-full py-3 bg-diablo-red/20 text-diablo-gold hover:bg-diablo-red hover:text-white rounded-xl transition-all text-sm font-semibold border border-diablo-red/30"
                      >
                        Limpiar Filtros
                      </button>
                    )}
                  </div>
                  
                  {/* Spacer para iOS */}
                  <div className="h-4"></div>
                </div>
              </div>
            )}

            {/* Activities Count */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-diablo-gold">
                Actividades
                <span className="ml-2 text-sm text-gray-400">({filteredActivities.length})</span>
              </h2>
              {(filter !== 'todas' || modalidadFilter !== 'todas') && (
                <button
                  onClick={() => {
                    setFilter('todas');
                    setModalidadFilter('todas');
                  }}
                  className="text-xs text-gray-400 hover:text-diablo-gold hidden lg:block"
                >
                  Ver todas
                </button>
              )}
            </div>

            {/* Activities */}
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-diablo-panel border rounded-lg p-4 cursor-pointer transition-all ${
                    progress.get(activity.id) 
                      ? 'opacity-70 bg-green-900/20 border-green-700/50' 
                      : 'border-diablo-border hover:border-diablo-gold hover:shadow-lg hover:shadow-diablo-gold/20'
                  }`}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={progress.get(activity.id) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleProgress(activity.id);
                      }}
                      className="w-5 h-5 cursor-pointer mt-1 flex-shrink-0 accent-diablo-gold"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`${getPriorityBadgeClass(activity.prioridad)} text-xs px-2 py-0.5 rounded`}>
                          {activity.prioridad}
                        </span>
                        {activity.modo && (
                          <span className="px-2 py-0.5 rounded text-xs bg-diablo-medium text-gray-300 border border-diablo-border flex items-center gap-1">
                            {activity.modo === 'individual' && '👤'}
                            {activity.modo === 'grupal' && '👥'}
                            {activity.modo === 'ambas' && '⚔️'}
                            <span className="hidden sm:inline">
                              {activity.modo === 'individual' && 'Individual'}
                              {activity.modo === 'grupal' && 'Grupal'}
                              {activity.modo === 'ambas' && 'Ambas'}
                            </span>
                          </span>
                        )}
                        <span className="text-gray-500 text-xs ml-auto">{activity.tipo}</span>
                      </div>
                      <h3 className="text-diablo-gold-light font-semibold text-base mb-2 break-words leading-snug">
                        {activity.nombre}
                      </h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1.5">
                        <span>⏱</span>
                        <span>{activity.tiempo_aprox}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredActivities.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xl mb-2">🔍</p>
                  <p>No hay actividades que coincidan con los filtros</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel - Desktop Sidebar / Mobile Modal */}
          <div className="lg:col-span-1">
            {/* Desktop - Sticky Sidebar */}
            <div className="hidden lg:block bg-diablo-panel border border-diablo-border rounded-lg overflow-hidden sticky top-24">
              {selectedActivity ? (
                <>
                  <div className="bg-gradient-to-r from-diablo-red/20 to-transparent p-4 border-b border-diablo-border">
                    <h2 className="text-xl font-bold text-diablo-gold leading-tight">{selectedActivity.nombre}</h2>
                  </div>
                  <div className="p-4 space-y-4 text-gray-300 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-xs text-gray-400 mb-1">Prioridad</h4>
                        <span className={`${getPriorityBadgeClass(selectedActivity.prioridad)} px-3 py-1 rounded`}>
                          {selectedActivity.prioridad}
                        </span>
                      </div>
                      {selectedActivity.modo && (
                        <div>
                          <h4 className="text-xs text-gray-400 mb-1">Modalidad</h4>
                          <span className="px-3 py-1 rounded bg-diablo-medium border border-diablo-border inline-block">
                            {selectedActivity.modo === 'individual' && '👤 Individual'}
                            {selectedActivity.modo === 'grupal' && '👥 Grupal'}
                            {selectedActivity.modo === 'ambas' && '⚔️ Ambas'}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedActivity.preferencia && selectedActivity.modo === 'ambas' && (
                      <div className="text-xs text-gray-400 bg-diablo-medium/50 p-2 rounded">
                        💡 Preferencia: {selectedActivity.preferencia === 'individual' ? '👤 Individual' : '👥 Grupal'}
                      </div>
                    )}
                    <div className="border-t border-diablo-border pt-4">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 flex items-center gap-2">
                        <span>⏱</span>
                        <span>Tiempo Estimado</span>
                      </h4>
                      <p className="text-sm">{selectedActivity.tiempo_aprox}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-4">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 flex items-center gap-2">
                        <span>🎁</span>
                        <span>Recompensas</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.recompensas}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-4">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 flex items-center gap-2">
                        <span>📈</span>
                        <span>Mejora que Aporta</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.mejora}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-4">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 flex items-center gap-2">
                        <span>📝</span>
                        <span>Detalles</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.detalle}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-20 px-4">
                  <p className="text-4xl mb-4">⚔️</p>
                  <p className="text-sm">Selecciona una actividad</p>
                  <p className="text-xs text-gray-500 mt-1">para ver más detalles</p>
                </div>
              )}
            </div>

            {/* Mobile - Modal */}
            {selectedActivity && (
              <div className="lg:hidden fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedActivity(null)}>
                <div className="bg-diablo-panel border-t-2 sm:border-2 border-diablo-gold rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-r from-diablo-red/20 to-transparent p-4 border-b border-diablo-border flex justify-between items-start flex-shrink-0">
                    <h2 className="text-lg font-bold text-diablo-gold pr-8 leading-tight">{selectedActivity.nombre}</h2>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="text-gray-400 hover:text-diablo-gold text-3xl leading-none -mt-1"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4 space-y-4 text-gray-300 overflow-y-auto flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <h4 className="text-xs text-gray-400 mb-1">Prioridad</h4>
                        <span className={`${getPriorityBadgeClass(selectedActivity.prioridad)} px-2 py-1 rounded text-xs`}>
                          {selectedActivity.prioridad}
                        </span>
                      </div>
                      {selectedActivity.modo && (
                        <div>
                          <h4 className="text-xs text-gray-400 mb-1">Modalidad</h4>
                          <span className="px-2 py-1 rounded bg-diablo-medium border border-diablo-border text-xs inline-block">
                            {selectedActivity.modo === 'individual' && '👤 Individual'}
                            {selectedActivity.modo === 'grupal' && '👥 Grupal'}
                            {selectedActivity.modo === 'ambas' && '⚔️ Ambas'}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedActivity.preferencia && selectedActivity.modo === 'ambas' && (
                      <div className="text-xs text-gray-400 bg-diablo-medium/50 p-2 rounded">
                        💡 Preferencia: {selectedActivity.preferencia === 'individual' ? '👤 Individual' : '👥 Grupal'}
                      </div>
                    )}
                    <div className="border-t border-diablo-border pt-3">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>⏱</span>
                        <span>Tiempo Estimado</span>
                      </h4>
                      <p className="text-sm">{selectedActivity.tiempo_aprox}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-3">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>🎁</span>
                        <span>Recompensas</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.recompensas}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-3">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>📈</span>
                        <span>Mejora que Aporta</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.mejora}</p>
                    </div>
                    <div className="border-t border-diablo-border pt-3 pb-2">
                      <h4 className="text-diablo-gold-light font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>📝</span>
                        <span>Detalles</span>
                      </h4>
                      <p className="text-sm leading-relaxed">{selectedActivity.detalle}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
