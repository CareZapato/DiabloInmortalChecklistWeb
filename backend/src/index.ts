import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import progressRoutes from './routes/progress.routes';
import eventRoutes from './routes/event.routes';
import { initializeDatabase } from './database/init';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Diablo Immortal Checklist API is running' });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔍 Initializing database...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🔥 Backend server running on http://localhost:${PORT}`);
      console.log(`⚔️  Diablo Immortal Checklist API ready`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();

export default app;
