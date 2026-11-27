import { connectDB, disconnectDB } from '../config/db.js';
import { Reel } from '../models/Reel.js';

/**
 * Side-by-side proof: legacy read-modify-write vs atomic $inc.
 * Runs N concurrent increments on ONE reel with each strategy, then reports lost updates.
 * Uses reel #2 by default so the stress-test reel (#1) is untouched; resets it to 0 at the end.
 * Usage: npm run race-demo [-- <reelId> <N>]
 */
const REEL_ID = process.argv[2] ?? '6745f1b2d4e3c9a5fab20002';
const N = Number(process.argv[3] ?? 100);

// ❌ Legacy pattern: two requests can read the same value → both write value+1
async function naiveEndorse() {
  const reel = await Reel.findById(REEL_ID);
  reel.endorsements = reel.endorsements + 1;
  await reel.save();
}

// ✅ Approved S3T standard: increment happens inside MongoDB, atomically per document
async function atomicEndorse() {
  await Reel.updateOne({ _id: REEL_ID }, { $inc: { endorsements: 1 } });
}

async function run(label, fn) {
  await Reel.updateOne({ _id: REEL_ID }, { $set: { endorsements: 0 } });
  const results = await Promise.allSettled(Array.from({ length: N }, fn));
  const failed = results.filter((r) => r.status === 'rejected').length;
  const { endorsements } = await Reel.findById(REEL_ID).lean();
  const lost = N - endorsements;
  console.log(
    `[race] ${label.padEnd(26)} → final ${String(endorsements).padStart(3)}/${N}  lost ${lost}` +
      `${failed ? `  (rejected ${failed})` : ''} ${lost === 0 ? 'OK' : 'LOST UPDATES'}`,
  );
}

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing (server/.env)');
  await connectDB(process.env.MONGODB_URI);
  if (!(await Reel.exists({ _id: REEL_ID }))) {
    throw new Error(`Reel ${REEL_ID} not found — run npm run seed first`);
  }

  await run('naive find → +1 → save()', naiveEndorse);
  await run('atomic $inc', atomicEndorse);

  await Reel.updateOne({ _id: REEL_ID }, { $set: { endorsements: 0 } }); // leave data clean
} catch (err) {
  console.error('[race] failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}