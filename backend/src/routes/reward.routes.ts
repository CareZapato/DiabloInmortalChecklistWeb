import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAllRewards, getActivitiesByReward, getEventsByReward } from '../controllers/reward.controller';

const router = Router();

// Get all rewards
router.get('/', authenticateToken, getAllRewards);

// Get activities that give a specific reward
router.get('/:rewardId/activities', authenticateToken, getActivitiesByReward);

// Get events that give a specific reward
router.get('/:rewardId/events', authenticateToken, getEventsByReward);

export default router;
