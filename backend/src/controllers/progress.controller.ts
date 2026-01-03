import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getUserProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT up.*, a.nombre, a.tipo, a.prioridad 
       FROM user_progress up
       JOIN activities a ON up.activity_id = a.id
       WHERE up.user_id = $1
       ORDER BY up.completed_date DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

export const getProgressByDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { date } = req.params;

    const result = await pool.query(
      `SELECT up.*, a.nombre, a.tipo, a.prioridad 
       FROM user_progress up
       JOIN activities a ON up.activity_id = a.id
       WHERE up.user_id = $1 AND up.completed_date = $2`,
      [userId, date]
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { activityId } = req.params;
    const { is_completed, completed_date } = req.body;

    // Get activity type to check if it's weekly
    const activityResult = await pool.query(
      'SELECT tipo FROM activities WHERE id = $1',
      [activityId]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Activity not found' }
      });
    }

    const activityType = activityResult.rows[0].tipo;
    const isWeekly = activityType === 'semanal';

    // If it's a weekly activity and being marked as completed, mark the whole week
    if (isWeekly && is_completed) {
      // Calculate the start and end of the week (Monday to Sunday)
      const date = new Date(completed_date + 'T00:00:00');
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust so Monday = start
      
      const monday = new Date(date);
      monday.setDate(date.getDate() + daysToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Mark all days of the week
      const promises: Promise<any>[] = [];
      for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if progress exists for this date
        const existing = await pool.query(
          'SELECT id FROM user_progress WHERE user_id = $1 AND activity_id = $2 AND completed_date = $3',
          [userId, activityId, dateStr]
        );

        if (existing.rows.length > 0) {
          // Update existing
          promises.push(
            pool.query(
              `UPDATE user_progress 
               SET is_completed = $1, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $2`,
              [true, existing.rows[0].id]
            )
          );
        } else {
          // Create new
          promises.push(
            pool.query(
              `INSERT INTO user_progress (user_id, activity_id, completed_date, is_completed) 
               VALUES ($1, $2, $3, $4)`,
              [userId, activityId, dateStr, true]
            )
          );
        }
      }

      await Promise.all(promises);

      // Return success with info about the week
      return res.json({
        success: true,
        data: {
          activity_id: activityId,
          is_completed: true,
          completed_date,
          week_marked: true,
          week_start: monday.toISOString().split('T')[0],
          week_end: sunday.toISOString().split('T')[0]
        }
      });
    } else {
      // For daily/seasonal activities or unchecking, just handle the single date
      // Check if progress exists
      const existing = await pool.query(
        'SELECT id FROM user_progress WHERE user_id = $1 AND activity_id = $2 AND completed_date = $3',
        [userId, activityId, completed_date]
      );

      let result;
      if (existing.rows.length > 0) {
        // Update existing
        result = await pool.query(
          `UPDATE user_progress 
           SET is_completed = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING *`,
          [is_completed, existing.rows[0].id]
        );
      } else {
        // Create new
        result = await pool.query(
          `INSERT INTO user_progress (user_id, activity_id, completed_date, is_completed) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [userId, activityId, completed_date, is_completed]
        );
      }

      return res.json({
        success: true,
        data: result.rows[0]
      });
    }
  } catch (error) {
    return next(error);
  }
};
