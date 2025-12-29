import { Router } from 'express';
import {
  getUserProgress,
  updateProgress,
  getProgressByDate
} from '../controllers/progress.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/progress
router.get('/', authenticateToken, getUserProgress);

// GET /api/progress/date/:date
router.get('/date/:date', authenticateToken, getProgressByDate);

// PUT /api/progress/:activityId
router.put('/:activityId', authenticateToken, updateProgress);

export default router;
