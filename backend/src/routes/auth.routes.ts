import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

export default router;
