import { Router } from 'express';
import { getAllEvents, getUpcomingEvents } from '../controllers/event.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/events
router.get('/', authenticateToken, getAllEvents);

// GET /api/events/upcoming
router.get('/upcoming', authenticateToken, getUpcomingEvents);

export default router;
