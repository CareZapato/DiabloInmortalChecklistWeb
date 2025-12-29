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
  } catch (error) {
    return next(error);
  }
};
