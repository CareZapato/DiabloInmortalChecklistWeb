import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activity.service';
import { progressService } from '../services/progress.service';
import { eventService } from '../services/event.service';
import { Activity, UserProgress, UpcomingEvent } from '../types';
import { formatDate, formatTime, getGameTime, getChileTime, getTimeUntilReset, formatMinutesUntil } from '../utils/timeUtils';
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
  const [chileTime, setChileTime] = useState(getChileTime());
  const [selectedDate, setSelectedDate] = useState(formatDate(getGameTime()));
  const [showCalendar, setShowCalendar] = useState(false);

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
      setChileTime(getChileTime());
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
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    const newDate = formatDate(date);
    setSelectedDate(newDate);
    loadProgress(newDate);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
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
      {/* Header */}
      <header className="bg-diablo-panel border-b-2 border-diablo-border p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-diablo-gold">
              <span className="hidden sm:inline">⚔️ Diablo Immortal Checklist</span>
              <span className="sm:hidden">⚔️ DI Checklist</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <span className="text-gray-300 text-sm sm:text-base">
                <span className="hidden sm:inline">Bienvenido, </span>
                <span className="text-diablo-gold">{user?.username}</span>
              </span>
              <button onClick={logout} className="btn-secondary text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Time Bar */}
      <div className="bg-diablo-medium border-b border-diablo-border p-2 sm:p-3">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm">
            <div className="flex gap-3 sm:gap-6 flex-wrap">
              <div>
                <span className="text-gray-400">🎮 <span className="hidden sm:inline">Hora del Juego:</span></span>{' '}
                <span className="text-diablo-gold font-bold text-base sm:text-lg">{formatTime(gameTime)}</span>
              </div>
              <div>
                <span className="text-gray-400">🇨🇱 <span className="hidden sm:inline">Hora Chile:</span></span>{' '}
                <span className="text-gray-300">{formatTime(chileTime)}</span>
              </div>
            </div>
            <div className="text-gray-400">
              ⏰ <span className="hidden sm:inline">Tiempo restante: </span>
              <span className="text-diablo-gold">{hours}h {minutes}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-diablo-panel border-b border-diablo-border p-2 sm:p-3">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={goToPreviousDay}
                className="px-2 sm:px-3 py-1 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-sm sm:text-base"
                title="Día anterior"
              >
                ◀
              </button>
              <div className="text-center flex-1 sm:flex-none">
                <div className="text-diablo-gold font-bold text-sm sm:text-lg">{selectedDate}</div>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {selectedDate === formatDate(getGameTime()) ? 'Hoy' : new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long' })}
                </div>
              </div>
              <button
                onClick={goToNextDay}
                className="px-2 sm:px-3 py-1 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-sm sm:text-base"
                title="Día siguiente"
              >
                ▶
              </button>
              <button
                onClick={goToToday}
                className="px-3 sm:px-4 py-1 bg-diablo-gold text-diablo-dark hover:bg-yellow-500 rounded font-semibold transition ml-1 sm:ml-2 text-sm sm:text-base"
              >
                Hoy
              </button>
            </div>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-3 sm:px-4 py-1 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              📅 <span className="hidden sm:inline">{showCalendar ? 'Ocultar' : 'Ver'} Calendario</span>
              <span className="sm:hidden">{showCalendar ? 'Ocultar' : 'Calendario'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Events Panel */}
      <div className="bg-diablo-medium border-b border-diablo-border p-4">
        <div className="container mx-auto">
          <h3 className="text-sm font-bold text-gray-400 mb-2">⏰ Próximos Eventos</h3>
          <div className="flex gap-4 overflow-x-auto">
            {events.map((event, index) => (
              <div key={index} className="bg-diablo-panel border border-diablo-border rounded px-4 py-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${event.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {event.status === 'active' ? '▶' : '⏱'}
                  </span>
                  <div>
                    <div className="text-diablo-gold font-semibold text-sm">{event.nombre}</div>
                    <div className="text-gray-400 text-xs">
                      🕐 {event.time} - {formatMinutesUntil(event.minutesUntil)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-diablo-panel border border-diablo-border rounded-lg p-3 sm:p-4 mb-4">
              <div className="mb-3">
                <h4 className="text-xs text-gray-400 mb-2 font-semibold">TIPO DE ACTIVIDAD</h4>
                <div className="flex gap-2 flex-wrap">
                  {['todas', 'diaria', 'semanal', 'temporada'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-3 sm:px-4 py-2 rounded transition text-sm ${
                        filter === f ? 'bg-diablo-gold text-diablo-dark font-semibold' : 'bg-diablo-medium text-gray-300 hover:bg-diablo-medium-hover'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-400 mb-2 font-semibold">MODALIDAD</h4>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'todas', icon: '🎮', label: 'Todas' },
                    { value: 'individual', icon: '👤', label: 'Individual' },
                    { value: 'grupal', icon: '👥', label: 'Grupal' },
                    { value: 'ambas', icon: '⚔️', label: 'Ambas' }
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModalidadFilter(m.value as any)}
                      className={`px-2 sm:px-4 py-2 rounded transition flex items-center gap-1 sm:gap-2 text-sm ${
                        modalidadFilter === m.value ? 'bg-diablo-gold text-diablo-dark font-semibold' : 'bg-diablo-medium text-gray-300 hover:bg-diablo-medium-hover'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="hidden sm:inline">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-diablo-panel border border-diablo-border rounded-lg p-3 sm:p-4 cursor-pointer transition ${
                    progress.get(activity.id) ? 'opacity-60 bg-green-900/20' : 'hover:border-diablo-gold'
                  }`}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <input
                      type="checkbox"
                      checked={progress.get(activity.id) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleProgress(activity.id);
                      }}
                      className="w-5 h-5 cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                        <span className={`${getPriorityBadgeClass(activity.prioridad)} text-xs whitespace-nowrap`}>{activity.prioridad}</span>
                        <span className="text-gray-400 text-xs whitespace-nowrap">({activity.tipo})</span>
                        {activity.modo && (
                          <span className="px-2 py-0.5 rounded text-xs bg-diablo-medium text-gray-300 border border-diablo-border whitespace-nowrap">
                            {activity.modo === 'individual' && '👤'}
                            {activity.modo === 'grupal' && '👥'}
                            {activity.modo === 'ambas' && '⚔️'}
                            <span className="hidden sm:inline ml-1">
                              {activity.modo === 'individual' && 'Individual'}
                              {activity.modo === 'grupal' && 'Grupal'}
                              {activity.modo === 'ambas' && 'Ambas'}
                            </span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-diablo-gold-light font-semibold text-sm sm:text-base mb-1 break-words">{activity.nombre}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">⏱ {activity.tiempo_aprox}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel - Desktop Sidebar / Mobile Modal */}
          <div className="lg:col-span-1">
            {/* Desktop - Sticky Sidebar */}
            <div className="hidden lg:block bg-diablo-panel border border-diablo-border rounded-lg p-6 sticky top-6">
              {selectedActivity ? (
                <>
                  <h2 className="text-2xl font-bold text-diablo-gold mb-4">{selectedActivity.nombre}</h2>
                  <div className="space-y-4 text-gray-300">
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1">Prioridad</h4>
                      <span className={getPriorityBadgeClass(selectedActivity.prioridad)}>
                        {selectedActivity.prioridad}
                      </span>
                    </div>
                    {selectedActivity.modo && (
                      <div>
                        <h4 className="text-diablo-gold-light font-semibold mb-1">Modalidad</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded bg-diablo-medium border border-diablo-border">
                            {selectedActivity.modo === 'individual' && '👤 Individual'}
                            {selectedActivity.modo === 'grupal' && '👥 Grupal'}
                            {selectedActivity.modo === 'ambas' && '⚔️ Ambas'}
                          </span>
                          {selectedActivity.preferencia && selectedActivity.modo === 'ambas' && (
                            <span className="text-xs text-gray-400">
                              (preferencia: {selectedActivity.preferencia === 'individual' ? '👤' : '👥'} {selectedActivity.preferencia})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1">Tiempo</h4>
                      <p>{selectedActivity.tiempo_aprox}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1">Recompensas</h4>
                      <p className="text-sm">{selectedActivity.recompensas}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1">Mejora</h4>
                      <p className="text-sm">{selectedActivity.mejora}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1">Detalle</h4>
                      <p className="text-sm">{selectedActivity.detalle}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-xl">⚔️</p>
                  <p className="mt-2">Selecciona una actividad para ver más detalles</p>
                </div>
              )}
            </div>

            {/* Mobile - Modal */}
            {selectedActivity && (
              <div className="lg:hidden fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="bg-diablo-panel border-t-2 sm:border-2 border-diablo-border rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-diablo-panel border-b border-diablo-border p-4 flex justify-between items-start">
                    <h2 className="text-xl font-bold text-diablo-gold pr-8">{selectedActivity.nombre}</h2>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="text-gray-400 hover:text-diablo-gold text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4 space-y-4 text-gray-300">
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Prioridad</h4>
                      <span className={getPriorityBadgeClass(selectedActivity.prioridad)}>
                        {selectedActivity.prioridad}
                      </span>
                    </div>
                    {selectedActivity.modo && (
                      <div>
                        <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Modalidad</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded bg-diablo-medium border border-diablo-border text-sm">
                            {selectedActivity.modo === 'individual' && '👤 Individual'}
                            {selectedActivity.modo === 'grupal' && '👥 Grupal'}
                            {selectedActivity.modo === 'ambas' && '⚔️ Ambas'}
                          </span>
                          {selectedActivity.preferencia && selectedActivity.modo === 'ambas' && (
                            <span className="text-xs text-gray-400">
                              (preferencia: {selectedActivity.preferencia === 'individual' ? '👤' : '👥'} {selectedActivity.preferencia})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Tiempo</h4>
                      <p className="text-sm">{selectedActivity.tiempo_aprox}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Recompensas</h4>
                      <p className="text-sm">{selectedActivity.recompensas}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Mejora</h4>
                      <p className="text-sm">{selectedActivity.mejora}</p>
                    </div>
                    <div>
                      <h4 className="text-diablo-gold-light font-semibold mb-1 text-sm">Detalle</h4>
                      <p className="text-sm">{selectedActivity.detalle}</p>
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
