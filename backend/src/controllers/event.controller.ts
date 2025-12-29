import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getAllEvents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM scheduled_events ORDER BY id');

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
    // Get all events
    const result = await pool.query('SELECT * FROM scheduled_events');
    const events = result.rows;

    // Calculate upcoming events (this logic will be done on frontend too)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const upcomingEvents = events.flatMap(event => {
      return event.horarios.map((time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        const eventTimeMinutes = hour * 60 + minute;
        let minutesUntil = eventTimeMinutes - currentTimeMinutes;

        if (minutesUntil < 0) {
          minutesUntil += 24 * 60; // Next day
        }

        return {
          ...event,
          time,
          minutesUntil,
          status: minutesUntil <= event.duracion_minutos ? 'active' : 'upcoming'
        };
      });
    }).sort((a, b) => a.minutesUntil - b.minutesUntil).slice(0, 5);

    return res.json({
      success: true,
      data: upcomingEvents
    });
  } catch (error) {
    return next(error);
  }
};
