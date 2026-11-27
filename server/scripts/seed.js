import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Reel } from '../models/Reel.js';

// Single source of truth: the same JSON the frontend used in Exercise 1.1
const SOURCE = new URL('../../public/data/reels.json', import.meta.url);
const RESET = process.argv.includes('--reset');

async function main() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing (server/.env)');

  const reels = JSON.parse(await readFile(SOURCE, 'utf8'));
  if (!Array.isArray(reels)) throw new Error('reels.json must be an array');

  // Validate EVERYTHING before touching the DB → all-or-nothing input check
  for (const raw of reels) {
    if (!mongoose.isValidObjectId(raw._id)) throw new Error(`Invalid _id: ${raw._id}`);
    await new Reel(raw).validate();
  }

  await connectDB(MONGODB_URI);

  // Idempotent upsert by fixed _id:
  //  - normal run: refresh content, KEEP existing endorsement counts ($setOnInsert)
  //  - --reset   : refresh content AND zero the counters (before stress tests)
  const ops = reels.map(({ _id, endorsements = 0, ...fields }) => ({
    updateOne: {
      filter: { _id },
      update: RESET
        ? { $set: { ...fields, endorsements: 0 } }
        : { $set: fields, $setOnInsert: { endorsements } },
      upsert: true,
    },
  }));

  const result = await Reel.bulkWrite(ops, { ordered: true });
  const total = await Reel.countDocuments();

  console.log(
    `[seed] ${RESET ? 'reset' : 'sync'} done → inserted ${result.upsertedCount}, ` +
      `updated ${result.modifiedCount}, total ${total}`,
  );
}

try {
  await main();
} catch (err) {
  console.error('[seed] failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}