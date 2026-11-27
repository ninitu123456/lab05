import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;
const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error('[boot] MONGODB_URI is missing. Copy server/.env.example → server/.env');
  process.exit(1);
}

// Top-level await (ESM): fail fast if DB is unreachable — no half-alive server
try {
  await connectDB(MONGODB_URI);
} catch (err) {
  console.error('[boot] cannot reach MongoDB:', err.message);
  process.exit(1);
}

const server = app.listen(PORT, () => console.log(`[http] listening on http://localhost:${PORT}`));

// Graceful shutdown: stop accepting requests, then close the DB pool
async function shutdown(signal) {
  console.log(`[boot] ${signal} received, shutting down…`);
  server.close();
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);