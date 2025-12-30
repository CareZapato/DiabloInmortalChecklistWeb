import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activity.service';
import { progressService } from '../services/progress.service';
import { eventService } from '../services/event.service';
import { rewardService } from '../services/reward.service';
import { Activity, UserProgress, UpcomingEvent, Reward } from '../types';
import { formatDate, formatTime, getGameTime, getTimeUntilReset, formatMinutesUntil } from '../utils/timeUtils';
import { getPriorityBadgeClass } from '../utils/priorityUtils';
import Calendar from '../components/Calendar';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [filter, setFilter] = useState<'todas' | 'diaria' | 'semanal' | 'temporada'>('todas');
  const [modalidadFilter, setModalidadFilter] = useState<'todas' | 'individual' | 'grupal' | 'ambas'>('todas');
  const [rewardFilter, setRewardFilter] = useState<string>('todas');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [gameTime, setGameTime] = useState(getGameTime());
  const [selectedDate, setSelectedDate] = useState(formatDate(getGameTime()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEvents, setShowEvents] = useState(false); // Para móvil, por defecto colapsado

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

  const loadRewards = async () => {
    try {
      const data = await rewardService.getAll();
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  useEffect(() => {
    loadActivities();
    loadProgress(selectedDate);
    loadEvents();
    loadRewards();

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
    const newStatus = !currentStatus;
    
    // Update optimistically
    const newProgress = new Map(progress);
    newProgress.set(activityId, newStatus);
    setProgress(newProgress);
    
    try {
      await progressService.update(activityId, newStatus, selectedDate);
      console.log(`✅ Progress updated for ${activityId}: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      // Revert on error
      const revertProgress = new Map(progress);
      revertProgress.set(activityId, currentStatus);
      setProgress(revertProgress);
      alert('Error al actualizar el progreso. Por favor, intenta de nuevo.');
    }
  };

  const filteredActivities = activities.filter((a) => {
    // Filter by type
    if (filter !== 'todas' && a.tipo !== filter) return false;
    
    // Filter by modalidad
    if (modalidadFilter !== 'todas' && a.modo !== modalidadFilter) return false;
    
    // Filter by reward
    if (rewardFilter !== 'todas') {
      if (!a.rewards || !a.rewards.some(r => r.id === rewardFilter)) {
        return false;
      }
    }
    
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
              <button
                onClick={() => navigate('/changelog')}
                className="text-xs text-gray-500 hover:text-diablo-gold font-mono bg-diablo-medium hover:bg-diablo-medium/70 px-2 py-0.5 rounded transition cursor-pointer"
                title="Ver changelog"
              >
                v0.1.0
              </button>
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
                {(filter !== 'todas' || modalidadFilter !== 'todas' || rewardFilter !== 'todas') && (
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

        {/* Próximos Eventos - Mejorado con barra de progreso */}
        {events.length > 0 && (
          <div className="bg-diablo-panel border border-diablo-border rounded-lg overflow-hidden mb-6">
            {/* Header - Clickeable en móvil */}
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="w-full p-4 flex items-center justify-between lg:cursor-default hover:bg-diablo-medium/30 lg:hover:bg-transparent transition-colors"
            >
              <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                <span>⏰</span>
                <span>Próximos Eventos</span>
                <span className="text-xs text-gray-500">({events.length})</span>
              </h3>
              {/* Indicador de expansión solo en móvil */}
              <span className="lg:hidden text-gray-400 text-lg transform transition-transform duration-200" style={{ transform: showEvents ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>
            
            {/* Contenido - Expandible en móvil, siempre visible en escritorio */}
            <div className={`${
              showEvents ? 'block' : 'hidden lg:block'
            } pb-4 px-4 transition-all duration-300`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.slice(0, 8).map((event, index) => {
                  // Calcular el porcentaje de progreso basado en el tiempo transcurrido desde el horario anterior
                  let progressPercentage = 0;
                  
                  if (event.status === 'active') {
                    // Evento activo: barra al 100%
                    progressPercentage = 100;
                  } else if (event.totalMinutesBetweenSchedules && event.minutesSincePrevious !== undefined) {
                    // Calcular progreso basado en tiempo transcurrido desde el horario anterior
                    // Fórmula: (tiempo transcurrido / tiempo total) * 100
                    progressPercentage = Math.max(0, Math.min(100, 
                      (event.minutesSincePrevious / event.totalMinutesBetweenSchedules) * 100
                    ));
                  } else {
                    // Fallback: mínimo 5% para que se vea algo
                    progressPercentage = 5;
                  }
                  
                  return (
                    <div 
                      key={index} 
                      className="relative border border-diablo-border rounded-lg overflow-hidden group hover:border-diablo-gold transition-all duration-300 hover:shadow-lg hover:shadow-diablo-gold/20"
                      title={`${event.nombre} - ${event.status === 'active' ? 'ACTIVO AHORA' : `Comienza en ${formatMinutesUntil(event.minutesUntil)}`}${event.rewards && event.rewards.length > 0 ? `\nRecompensas: ${event.rewards.map(r => r.cantidad ? `${r.nombre} x${r.cantidad}` : r.nombre).join(', ')}` : ''}`}
                    >
                      {/* Barra de progreso de fondo - llena todo el ancho del contenedor */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${
                            event.status === 'active' 
                              ? 'bg-gradient-to-r from-green-600/50 via-green-500/40 to-green-600/50 animate-progress-shimmer' 
                              : 'bg-gradient-to-r from-yellow-600/40 via-yellow-500/30 to-yellow-600/40'
                          }`}
                          style={{ 
                            width: `${progressPercentage}%`,
                            minWidth: progressPercentage > 0 ? '2%' : '0%'
                          }}
                        >
                          {/* Overlay de brillo para eventos activos */}
                          {event.status === 'active' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-progress-shimmer" />
                          )}
                        </div>
                      </div>
                      
                      {/* Contenido del evento */}
                      <div className="relative px-3 py-2.5 flex items-center gap-2.5">
                        {/* Icono de estado con animación */}
                        <div className="flex-shrink-0">
                          <span className={`text-base ${
                            event.status === 'active' 
                              ? 'text-green-400 animate-pulse' 
                              : 'text-yellow-400'
                          }`}>
                            {event.status === 'active' ? '▶' : '⏱'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-diablo-gold font-semibold text-xs truncate mb-0.5">
                            {event.nombre}
                          </div>
                          <div className="text-gray-300 text-xs flex items-center gap-1.5">
                            <span className="font-mono">{event.time}</span>
                            <span className="text-gray-500">·</span>
                            <span className={event.status === 'active' ? 'text-green-400 font-semibold' : 'text-gray-400'}>
                              {formatMinutesUntil(event.minutesUntil)}
                            </span>
                          </div>
                          {/* Mostrar recompensas si existen */}
                          {event.rewards && event.rewards.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.rewards.slice(0, 2).map((reward, idx) => (
                                <span key={idx} className="text-[10px] bg-diablo-gold/20 text-diablo-gold px-1.5 py-0.5 rounded" title={reward.descripcion}>
                                  {reward.cantidad ? `${reward.nombre} x${reward.cantidad}` : reward.nombre}
                                </span>
                              ))}
                              {event.rewards.length > 2 && (
                                <span className="text-[10px] text-gray-500">+{event.rewards.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Mensaje si hay más eventos */}
              {events.length > 8 && (
                <div className="mt-3 text-center text-xs text-gray-500">
                  +{events.length - 8} eventos más próximamente
                </div>
              )}
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
                {(filter !== 'todas' || modalidadFilter !== 'todas' || rewardFilter !== 'todas') && (
                  <button
                    onClick={() => {
                      setFilter('todas');
                      setModalidadFilter('todas');
                      setRewardFilter('todas');
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
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Recompensa</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    <button
                      onClick={() => setRewardFilter('todas')}
                      className={`w-full px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                        rewardFilter === 'todas'
                          ? 'bg-diablo-gold text-diablo-dark font-semibold shadow-md transform scale-[1.02]' 
                          : 'bg-diablo-medium/50 text-gray-300 hover:bg-diablo-medium border border-diablo-border/30 hover:border-diablo-border'
                      }`}
                    >
                      <span>🎁</span>
                      <span>Todas</span>
                    </button>
                    {rewards.map((reward) => (
                      <button
                        key={reward.id}
                        onClick={() => setRewardFilter(reward.id)}
                        className={`w-full px-3 py-2 rounded-lg transition-all text-sm text-left ${
                          rewardFilter === reward.id 
                            ? 'bg-diablo-gold text-diablo-dark font-semibold shadow-md transform scale-[1.02]' 
                            : 'bg-diablo-medium/50 text-gray-300 hover:bg-diablo-medium border border-diablo-border/30 hover:border-diablo-border'
                        }`}
                        title={reward.descripcion || reward.nombre}
                      >
                        {reward.nombre}
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
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-2.5 block font-semibold">Recompensa</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <button
                          onClick={() => setRewardFilter('todas')}
                          className={`w-full px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                            rewardFilter === 'todas'
                              ? 'bg-diablo-gold text-diablo-dark shadow-lg shadow-diablo-gold/30 scale-[1.02]' 
                              : 'bg-diablo-medium/70 text-gray-300 border border-diablo-border/30 active:scale-95'
                          }`}
                        >
                          <span>🎁</span>
                          <span>Todas las Recompensas</span>
                        </button>
                        {rewards.slice(0, 5).map((reward) => (
                          <button
                            key={reward.id}
                            onClick={() => setRewardFilter(reward.id)}
                            className={`w-full px-4 py-3 rounded-xl transition-all text-sm font-medium text-left ${
                              rewardFilter === reward.id 
                                ? 'bg-diablo-gold text-diablo-dark shadow-lg shadow-diablo-gold/30 scale-[1.02]' 
                                : 'bg-diablo-medium/70 text-gray-300 border border-diablo-border/30 active:scale-95'
                            }`}
                            title={reward.descripcion || reward.nombre}
                          >
                            {reward.nombre}
                          </button>
                        ))}
                        {rewards.length > 5 && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            +{rewards.length - 5} recompensas más (usa filtros en escritorio)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(filter !== 'todas' || modalidadFilter !== 'todas' || rewardFilter !== 'todas') && (
                      <button
                        onClick={() => {
                          setFilter('todas');
                          setModalidadFilter('todas');
                          setRewardFilter('todas');
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
              {(filter !== 'todas' || modalidadFilter !== 'todas' || rewardFilter !== 'todas') && (
                <button
                  onClick={() => {
                    setFilter('todas');
                    setModalidadFilter('todas');
                    setRewardFilter('todas');
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
                  className={`bg-diablo-panel border rounded-lg transition-all ${
                    progress.get(activity.id) 
                      ? 'opacity-70 bg-green-900/20 border-green-700/50' 
                      : 'border-diablo-border hover:border-diablo-gold hover:shadow-lg hover:shadow-diablo-gold/20'
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Área del checkbox más grande y moderna */}
                    <button
                      type="button"
                      className="flex items-center justify-center p-2 -m-2 cursor-pointer rounded-lg hover:bg-diablo-medium/30 transition-colors active:scale-95 touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleToggleProgress(activity.id);
                      }}
                      aria-label={progress.get(activity.id) ? 'Marcar como no completada' : 'Marcar como completada'}
                    >
                      <div className="relative w-7 h-7">
                        <div
                          className={`w-7 h-7 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                            progress.get(activity.id)
                              ? 'bg-diablo-gold border-diablo-gold'
                              : 'bg-diablo-medium border-diablo-border'
                          }`}
                        >
                          {progress.get(activity.id) && (
                            <svg 
                              className="w-5 h-5 text-diablo-dark"
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                    {/* Contenido de la actividad - clickeable para abrir detalles */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
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
                      {selectedActivity.rewards && selectedActivity.rewards.length > 0 ? (
                        <div className="space-y-2">
                          {selectedActivity.rewards.map((reward, idx) => (
                            <div key={idx} className="bg-diablo-medium/50 rounded p-2 border border-diablo-border/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-diablo-gold font-semibold text-sm">{reward.nombre}</span>
                                {reward.cantidad && (
                                  <span className="bg-diablo-gold/20 text-diablo-gold px-2 py-0.5 rounded text-xs font-bold">
                                    x{reward.cantidad}
                                  </span>
                                )}
                              </div>
                              {reward.descripcion && (
                                <p className="text-xs text-gray-400 leading-relaxed">{reward.descripcion}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No hay recompensas especificadas</p>
                      )}
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
                      {selectedActivity.rewards && selectedActivity.rewards.length > 0 ? (
                        <div className="space-y-2">
                          {selectedActivity.rewards.map((reward, idx) => (
                            <div key={idx} className="bg-diablo-medium/50 rounded p-2 border border-diablo-border/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-diablo-gold font-semibold text-sm">{reward.nombre}</span>
                                {reward.cantidad && (
                                  <span className="bg-diablo-gold/20 text-diablo-gold px-2 py-0.5 rounded text-xs font-bold">
                                    x{reward.cantidad}
                                  </span>
                                )}
                              </div>
                              {reward.descripcion && (
                                <p className="text-xs text-gray-400 leading-relaxed">{reward.descripcion}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No hay recompensas especificadas</p>
                      )}
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
