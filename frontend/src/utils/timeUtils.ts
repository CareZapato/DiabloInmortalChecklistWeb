import { format, addHours } from 'date-fns';
import { es } from 'date-fns/locale';

// Game time offset: -2 hours from Chile time
export const GAME_TIME_OFFSET = -2;

/**
 * Get current Chile time
 */
export const getChileTime = (): Date => {
  return new Date();
};

/**
 * Get current game time (Chile time + offset)
 */
export const getGameTime = (): Date => {
  return addHours(new Date(), GAME_TIME_OFFSET);
};

/**
 * Format time as HH:mm
 */
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date): string => {
  return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });
};

/**
 * Check if date is today (game day)
 */
export const isToday = (date: Date): boolean => {
  const today = getGameTime();
  return formatDate(date) === formatDate(today);
};

/**
 * Get time until next event in minutes
 */
export const getMinutesUntil = (eventTime: string): number => {
  const now = getGameTime();
  const [hours, minutes] = eventTime.split(':').map(Number);
  
  const eventDate = new Date(now);
  eventDate.setHours(hours, minutes, 0, 0);
  
  let diff = Math.floor((eventDate.getTime() - now.getTime()) / 60000);
  
  // If event already passed today, calculate for tomorrow
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  return diff;
};

/**
 * Format minutes into readable string
 */
export const formatMinutesUntil = (minutes: number): string => {
  if (minutes < 0) return 'Pasado';
  if (minutes === 0) return '¡AHORA!';
  if (minutes < 60) return `En ${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `En ${hours}h`;
  return `En ${hours}h ${mins}m`;
};

/**
 * Get time until next reset (3:00 AM)
 */
export const getTimeUntilReset = (): { hours: number; minutes: number } => {
  const now = getGameTime();
  const resetHour = 3;
  
  const nextReset = new Date(now);
  nextReset.setHours(resetHour, 0, 0, 0);
  
  // If we're past 3 AM, set to tomorrow
  if (now.getHours() >= resetHour) {
    nextReset.setDate(nextReset.getDate() + 1);
  }
  
  const diff = nextReset.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
};
