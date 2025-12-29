import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getAllActivities = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT * FROM activities 
       ORDER BY 
         CASE tipo WHEN 'diaria' THEN 1 WHEN 'semanal' THEN 2 WHEN 'temporada' THEN 3 END,
         CASE prioridad 
           WHEN 'S+' THEN 1 
           WHEN 'S' THEN 2 
           WHEN 'A+' THEN 3 
           WHEN 'A' THEN 4 
           WHEN 'B+' THEN 5 
           WHEN 'B' THEN 6 
           WHEN 'C' THEN 7 
         END`
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

export const getActivityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};
