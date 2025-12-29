import React, { useState, useEffect } from 'react';
import { formatDate, getGameTime } from '../utils/timeUtils';
import { progressService } from '../services/progress.service';
import { UserProgress } from '../types';

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasProgress: boolean;
  completedCount: number;
  totalCount: number;
}

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  totalActivities: number;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate, totalActivities }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMonthProgress();
  }, [currentMonth]);

  const loadMonthProgress = async () => {
    setIsLoading(true);
    try {
      // Cargar progreso de los últimos 60 días para tener datos suficientes
      const promises: Promise<UserProgress[]>[] = [];
      const today = new Date();
      
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = formatDate(date);
        promises.push(progressService.getByDate(dateString));
      }

      const results = await Promise.all(promises);
      const progressMap = new Map<string, number>();

      results.forEach((dayProgress, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - index);
        const dateString = formatDate(date);
        const completedCount = dayProgress.filter(p => p.is_completed).length;
        progressMap.set(dateString, completedCount);
      });

      setProgressData(progressMap);
    } catch (error) {
      console.error('Error loading month progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = formatDate(getGameTime());

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = formatDate(date);
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        hasProgress: progressData.has(dateString),
        completedCount: progressData.get(dateString) || 0,
        totalCount: totalActivities,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        hasProgress: progressData.has(dateString),
        completedCount: progressData.get(dateString) || 0,
        totalCount: totalActivities,
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = formatDate(date);
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        hasProgress: progressData.has(dateString),
        completedCount: progressData.get(dateString) || 0,
        totalCount: totalActivities,
      });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = getGameTime();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(formatDate(today));
  };

  const getCompletionColor = (completed: number, total: number): string => {
    if (completed === 0) return 'bg-gray-800';
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-green-700';
    if (percentage >= 50) return 'bg-yellow-600';
    if (percentage >= 25) return 'bg-orange-600';
    return 'bg-red-700';
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-diablo-panel border border-diablo-border rounded-lg p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-diablo-gold">📅 Historial de Progreso</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-2 sm:px-3 py-1 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-sm"
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-1 bg-diablo-gold text-diablo-dark hover:bg-yellow-500 rounded font-semibold transition text-sm"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="px-2 sm:px-3 py-1 bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Month/Year */}
      <div className="text-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-diablo-gold-light capitalize">{monthName}</h3>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="text-gray-400">Cargando...</div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((day, index) => {
            const isSelected = day.dateString === selectedDate;
            const completionColor = day.hasProgress
              ? getCompletionColor(day.completedCount, day.totalCount)
              : 'bg-gray-800';

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day.dateString)}
                disabled={!day.isCurrentMonth}
                className={`
                  relative aspect-square rounded-lg p-0.5 sm:p-1 text-xs sm:text-sm transition-all
                  ${day.isCurrentMonth ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}
                  ${isSelected ? 'ring-1 sm:ring-2 ring-diablo-gold scale-105' : ''}
                  ${day.isToday ? 'ring-1 sm:ring-2 ring-yellow-500' : ''}
                  ${completionColor}
                  hover:scale-110 hover:z-10
                `}
                title={`${day.dateString}: ${day.completedCount}/${day.totalCount} completadas`}
              >
                <div className="text-white font-semibold text-[10px] sm:text-sm">
                  {day.date.getDate()}
                </div>
                {day.hasProgress && (
                  <div className="text-[8px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">
                    <span className="hidden sm:inline">{day.completedCount}/{day.totalCount}</span>
                    <span className="sm:hidden">{day.completedCount}</span>
                  </div>
                )}
                {day.isToday && (
                  <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-diablo-border">
        <div className="text-xs text-gray-400 mb-2">Nivel de completitud:</div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">Sin progreso</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-700 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">&lt;25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-600 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">25-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-600 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">50-75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-700 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">75-99%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded flex-shrink-0"></div>
            <span className="text-xs text-gray-400">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
