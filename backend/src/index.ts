import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import progressRoutes from './routes/progress.routes';
import eventRoutes from './routes/event.routes';
import rewardRoutes from './routes/reward.routes';
import { initializeDatabase } from './database/init';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.BACKEND_PORT || '3000', 10);
const HOST = process.env.BACKEND_HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// Configure CORS to accept multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for frontend assets
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    if (corsOrigins.includes(origin) || 
        origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/) ||
        origin.match(/^https?:\/\/localhost/) ||
        origin.match(/^https?:\/\/127\.0\.0\.1/)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin}`);
      callback(null, true); // En desarrollo, permitir todos
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight request por 10 minutos
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.get('origin') || 'no origin'}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rewards', rewardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Diablo Immortal Checklist API is running' });
});

// Serve static files from frontend in production
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Handle SPA routing - send all non-API requests to index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔍 Initializing database...');
    await initializeDatabase();
    
    app.listen(PORT, HOST, () => {
      console.log(`🔥 Backend server running`);
      console.log(`📍 Local:    http://localhost:${PORT}`);
      console.log(`📍 Network:  http://<your-ip>:${PORT}`);
      console.log(`⚔️  Diablo Immortal Checklist API ready`);
      console.log(`\n💡 Para acceder desde otra máquina:`);
      console.log(`   1. Encuentra tu IP local con: ipconfig (Windows) o ifconfig (Mac/Linux)`);
      console.log(`   2. Accede desde: http://<tu-ip>:${PORT}`);
      console.log(`   3. Asegúrate de que el firewall permita conexiones en el puerto ${PORT}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();

export default app;
