import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { activityService } from '../services/activity.service';
import { progressService } from '../services/progress.service';
import { eventService } from '../services/event.service';
import { Activity, UserProgress, UpcomingEvent } from '../types';
import { formatDate, formatTime, getGameTime, getChileTime, getTimeUntilReset, formatMinutesUntil } from '../utils/timeUtils';
import { getPriorityBadgeClass } from '../utils/priorityUtils';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [filter, setFilter] = useState<'todas' | 'diaria' | 'semanal' | 'temporada'>('todas');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [gameTime, setGameTime] = useState(getGameTime());
  const [chileTime, setChileTime] = useState(getChileTime());

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
    const currentDate = formatDate(getGameTime());
    loadActivities();
    loadProgress(currentDate);
    loadEvents();

    // Update time every minute
    const interval = setInterval(() => {
      setGameTime(getGameTime());
      setChileTime(getChileTime());
      loadEvents();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleProgress = async (activityId: string) => {
    const currentStatus = progress.get(activityId) || false;
    const currentDate = formatDate(getGameTime());
    try {
      await progressService.update(activityId, !currentStatus, currentDate);
      setProgress(new Map(progress.set(activityId, !currentStatus)));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredActivities = activities.filter((a) => filter === 'todas' || a.tipo === filter);

  const { hours, minutes } = getTimeUntilReset();

  return (
    <div className="min-h-screen bg-diablo-dark">
      {/* Header */}
      <header className="bg-diablo-panel border-b-2 border-diablo-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-diablo-gold">⚔️ Diablo Immortal Checklist</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Bienvenido, <span className="text-diablo-gold">{user?.username}</span></span>
            <button onClick={logout} className="btn-secondary text-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Time Bar */}
      <div className="bg-diablo-medium border-b border-diablo-border p-3">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-gray-400">🎮 Hora del Juego:</span>{' '}
              <span className="text-diablo-gold font-bold text-lg">{formatTime(gameTime)}</span>
            </div>
            <div>
              <span className="text-gray-400">🇨🇱 Hora Chile:</span>{' '}
              <span className="text-gray-300">{formatTime(chileTime)}</span>
            </div>
          </div>
          <div className="text-gray-400">
            ⏰ Tiempo restante: <span className="text-diablo-gold">{hours}h {minutes}m</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-diablo-panel border border-diablo-border rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                {['todas', 'diaria', 'semanal', 'temporada'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded ${
                      filter === f ? 'bg-diablo-gold text-diablo-dark' : 'bg-diablo-medium text-gray-300'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-diablo-panel border border-diablo-border rounded-lg p-4 cursor-pointer transition ${
                    progress.get(activity.id) ? 'opacity-60 bg-green-900/20' : 'hover:border-diablo-gold'
                  }`}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={progress.get(activity.id) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleProgress(activity.id);
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getPriorityBadgeClass(activity.prioridad)}>{activity.prioridad}</span>
                        <span className="text-gray-400 text-xs">({activity.tipo})</span>
                        <h3 className="text-diablo-gold-light font-semibold">{activity.nombre}</h3>
                      </div>
                      <p className="text-gray-400 text-sm">⏱ {activity.tiempo_aprox}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <div className="bg-diablo-panel border border-diablo-border rounded-lg p-6 sticky top-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
