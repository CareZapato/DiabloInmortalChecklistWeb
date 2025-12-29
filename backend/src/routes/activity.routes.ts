import { Router } from 'express';
import { getAllActivities, getActivityById } from '../controllers/activity.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/activities
router.get('/', authenticateToken, getAllActivities);

// GET /api/activities/:id
router.get('/:id', authenticateToken, getActivityById);

export default router;
