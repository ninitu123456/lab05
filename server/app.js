import express from 'express';
import mongoose from 'mongoose';
import { reelsRouter } from './routes/reels.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// App is exported separately from listen() → testable without opening a port
export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'up' : 'down',
    uptimeSec: Math.round(process.uptime()),
  });
});

// Versioned resource mount → routes inside the router stay short ('/:id/endorse')
app.use('/api/v2/reels', reelsRouter);

// Order matters: 404 after all routes, error handler LAST
app.use(notFound);
app.use(errorHandler);