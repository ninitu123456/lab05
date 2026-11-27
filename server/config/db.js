import mongoose from 'mongoose';

/**
 * Mongoose 8 connection.
 * Slide 29 #03: NO { useNewUrlParser, useUnifiedTopology } — removed since driver 4,
 * passing them is obsolete. Only modern options here.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => console.log(`[db] connected → ${mongoose.connection.name}`));
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
  mongoose.connection.on('error', (err) => console.error('[db] error:', err.message));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}