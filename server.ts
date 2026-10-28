import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './src/server/db';
import appointmentsRouter from './src/server/routes/appointments';
import ticketsRouter from './src/server/routes/tickets';
import followupsRouter from './src/server/routes/followups';
import healthRouter from './src/server/routes/health';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// REST API Routes
app.use('/api/health', healthRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/followups', followupsRouter);

// Global API error handler
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

async function startServer() {
  // Attempt MongoDB connection on startup (asynchronously without blocking server start)
  connectToDatabase().catch((err) => {
    console.error('[CareFlow Startup] MongoDB connection attempt finished with error:', err.message);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[CareFlow] Vite dev middleware mounted');
  } else {
    // Production mode: Serve pre-built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[CareFlow] Static file serving configured for ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(` CareFlow AI Full-Stack Server Running`);
    console.log(` Port: ${PORT}`);
    console.log(` URL: http://0.0.0.0:${PORT}`);
    console.log(` API Base: http://0.0.0.0:${PORT}/api`);
    console.log(` Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
