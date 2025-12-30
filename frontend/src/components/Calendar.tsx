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
    <div className="bg-diablo-panel border border-diablo-border rounded-lg p-2 max-w-md mx-auto">
      {/* Header Minimalista */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-semibold text-diablo-gold-light capitalize">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={previousMonth}
            className="w-5 h-5 flex items-center justify-center bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-[10px]"
            title="Mes anterior"
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className="px-1.5 h-5 bg-diablo-gold text-diablo-dark hover:bg-yellow-500 rounded font-semibold transition text-[9px]"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="w-5 h-5 flex items-center justify-center bg-diablo-medium hover:bg-diablo-gold hover:text-diablo-dark text-gray-300 rounded transition text-[10px]"
            title="Mes siguiente"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day) => (
          <div key={day} className="text-center text-[8px] font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="text-xs text-gray-500">Cargando...</div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => {
            const isSelected = day.dateString === selectedDate;
            const completionColor = day.hasProgress
              ? getCompletionColor(day.completedCount, day.totalCount)
              : 'bg-diablo-medium/50';

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day.dateString)}
                disabled={!day.isCurrentMonth}
                className={`
                  relative aspect-square rounded text-[8px] transition-all flex flex-col items-center justify-center
                  ${day.isCurrentMonth ? 'cursor-pointer' : 'cursor-not-allowed opacity-20'}
                  ${isSelected ? 'ring-1 ring-diablo-gold' : ''}
                  ${day.isToday ? 'ring-1 ring-yellow-400' : ''}
                  ${completionColor}
                  ${day.isCurrentMonth ? 'hover:scale-105 hover:z-10' : ''}
                `}
                title={`${day.dateString}: ${day.completedCount}/${day.totalCount} completadas`}
              >
                <span className="font-semibold text-white leading-none">
                  {day.date.getDate()}
                </span>
                {day.hasProgress && (
                  <span className="text-[6px] text-gray-300 opacity-90 leading-none mt-0.5">
                    {day.completedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend Compacta */}
      <div className="mt-1.5 pt-1.5 border-t border-diablo-border/50">
        <div className="flex items-center justify-between text-[8px] text-gray-500">
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-diablo-medium/50 rounded"></div>
            <span>0</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-red-700 rounded"></div>
            <span>25</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-orange-600 rounded"></div>
            <span>50</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-yellow-600 rounded"></div>
            <span>75</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 bg-green-600 rounded"></div>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
