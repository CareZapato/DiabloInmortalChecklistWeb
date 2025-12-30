import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const getAllActivities = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT 
         a.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', r.id,
               'nombre', r.nombre,
               'descripcion', r.descripcion,
               'cantidad', ar.cantidad
             ) ORDER BY r.nombre
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as rewards
       FROM activities a
       LEFT JOIN activity_rewards ar ON a.id = ar.activity_id
       LEFT JOIN rewards r ON ar.reward_id = r.id
       GROUP BY a.id
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

    const result = await pool.query(
      `SELECT 
         a.*,
         COALESCE(
           json_agg(
             json_build_object(
               'id', r.id,
               'nombre', r.nombre,
               'descripcion', r.descripcion,
               'cantidad', ar.cantidad
             ) ORDER BY r.nombre
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as rewards
       FROM activities a
       LEFT JOIN activity_rewards ar ON a.id = ar.activity_id
       LEFT JOIN rewards r ON ar.reward_id = r.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );

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
