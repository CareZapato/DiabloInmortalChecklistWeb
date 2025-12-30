import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getAllEvents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT 
         e.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', r.id,
               'nombre', r.nombre,
               'descripcion', r.descripcion,
               'cantidad', er.cantidad
             ) ORDER BY r.nombre
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as rewards
       FROM scheduled_events e
       LEFT JOIN event_rewards er ON e.id = er.event_id
       LEFT JOIN rewards r ON er.reward_id = r.id
       GROUP BY e.id
       ORDER BY e.id`
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

export const getUpcomingEvents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all events with rewards
    const result = await pool.query(
      `SELECT 
         e.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', r.id,
               'nombre', r.nombre,
               'descripcion', r.descripcion,
               'cantidad', er.cantidad
             ) ORDER BY r.nombre
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as rewards
       FROM scheduled_events e
       LEFT JOIN event_rewards er ON e.id = er.event_id
       LEFT JOIN rewards r ON er.reward_id = r.id
       GROUP BY e.id`
    );
    const events = result.rows;

    // Calculate upcoming events using game time (Chile time - 2 hours)
    const now = new Date();
    // Apply game time offset: -2 hours
    const gameTime = new Date(now.getTime() - (2 * 60 * 60 * 1000));
    const currentHour = gameTime.getHours();
    const currentMinute = gameTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    console.log(`⏰ Getting upcoming events - Server time: ${now.toISOString()}, Game time: ${gameTime.toISOString()}`);

    const upcomingEvents = events.flatMap(event => {
      // Ordenar horarios del evento
      const sortedSchedules = [...event.horarios].sort();
      
      return event.horarios.map((time: string, index: number) => {
        const [hour, minute] = time.split(':').map(Number);
        const eventTimeMinutes = hour * 60 + minute;
        let minutesUntil = eventTimeMinutes - currentTimeMinutes;

        if (minutesUntil < 0) {
          minutesUntil += 24 * 60; // Next day
        }

        // Event is active if we're within its duration window
        const isActive = minutesUntil <= 0 && Math.abs(minutesUntil) < event.duracion_minutos;

        // Calcular tiempo desde el horario anterior para la barra de progreso
        let previousScheduleTime: string | null = null;
        let minutesSincePrevious = 0;
        let totalMinutesBetweenSchedules = 0;

        // Encontrar el horario anterior
        const currentScheduleIndex = sortedSchedules.indexOf(time);
        if (currentScheduleIndex > 0) {
          // Hay un horario anterior en el mismo día
          previousScheduleTime = sortedSchedules[currentScheduleIndex - 1];
        } else {
          // Es el primer horario del día, el anterior es el último de ayer
          previousScheduleTime = sortedSchedules[sortedSchedules.length - 1];
        }

        // Calcular minutos desde el horario anterior
        const [prevHour, prevMinute] = (previousScheduleTime || '00:00').split(':').map(Number);
        const prevTimeMinutes = prevHour * 60 + prevMinute;
        
        minutesSincePrevious = currentTimeMinutes - prevTimeMinutes;
        if (minutesSincePrevious < 0) {
          minutesSincePrevious += 24 * 60; // Ajustar para el día anterior
        }

        // Calcular tiempo total entre horarios
        totalMinutesBetweenSchedules = eventTimeMinutes - prevTimeMinutes;
        if (totalMinutesBetweenSchedules <= 0) {
          totalMinutesBetweenSchedules += 24 * 60; // Ajustar para horarios que cruzan medianoche
        }

        return {
          ...event,
          time,
          minutesUntil: isActive ? 0 : minutesUntil,
          status: isActive ? 'active' : 'upcoming',
          previousScheduleTime,
          minutesSincePrevious,
          totalMinutesBetweenSchedules
        };
      });
    }).sort((a, b) => a.minutesUntil - b.minutesUntil).slice(0, 10);

    console.log(`📊 Upcoming events: ${upcomingEvents.length}`);

    return res.json({
      success: true,
      data: upcomingEvents
    });
  } catch (error) {
    console.error('❌ Error getting upcoming events:', error);
    return next(error);
  }
};
