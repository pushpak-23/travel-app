import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import locationRoutes from './routes/locations';
import routeRoutes from './routes/routes';
import noteRoutes from './routes/notes';
import journeyRoutes from './routes/journeys';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check against CORS_ORIGIN env var for production
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    if (origin === allowedOrigin) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/locations', locationRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/journeys', journeyRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🌍 Travel Map API running on port ${PORT}`);
});

export default app;
