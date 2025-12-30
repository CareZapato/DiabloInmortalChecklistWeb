import { Request, Response } from 'express';
import pool from '../config/database';
import { Reward } from '../models/Reward';

export const getAllRewards = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Reward>(`
      SELECT id, nombre, descripcion
      FROM rewards
      ORDER BY nombre ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Error al obtener las recompensas' });
  }
};

export const getActivitiesByReward = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        a.*,
        ar.cantidad as reward_cantidad,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'nombre', r.nombre,
              'descripcion', r.descripcion,
              'cantidad', ar2.cantidad
            ) ORDER BY r.nombre
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as rewards
      FROM activities a
      INNER JOIN activity_rewards ar ON a.id = ar.activity_id
      LEFT JOIN activity_rewards ar2 ON a.id = ar2.activity_id
      LEFT JOIN rewards r ON ar2.reward_id = r.id
      WHERE ar.reward_id = $1
      GROUP BY a.id, ar.cantidad
      ORDER BY 
        CASE a.prioridad
          WHEN 'crítica' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baja' THEN 4
          ELSE 5
        END,
        a.nombre
    `, [rewardId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities by reward:', error);
    res.status(500).json({ error: 'Error al obtener las actividades por recompensa' });
  }
};

export const getEventsByReward = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        e.*,
        er.cantidad as reward_cantidad,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'nombre', r.nombre,
              'descripcion', r.descripcion,
              'cantidad', er2.cantidad
            ) ORDER BY r.nombre
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as rewards
      FROM scheduled_events e
      INNER JOIN event_rewards er ON e.id = er.event_id
      LEFT JOIN event_rewards er2 ON e.id = er2.event_id
      LEFT JOIN rewards r ON er2.reward_id = r.id
      WHERE er.reward_id = $1
      GROUP BY e.id, er.cantidad
      ORDER BY e.nombre
    `, [rewardId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events by reward:', error);
    res.status(500).json({ error: 'Error al obtener los eventos por recompensa' });
  }
};
