/**
 * Concurrency stress test for PATCH /api/v2/reels/:id/endorse (Sprint 2 verification).
 * Fires N requests at the SAME reel simultaneously and proves zero lost updates:
 *  1. every request → HTTP 200
 *  2. every response saw a DISTINCT counter value (no two requests read the same number)
 *  3. returned values are exactly before+1 … before+N (contiguous)
 *  4. final count === before + N
 * Usage: npm run stress [-- <reelId> <N>]
 */
const BASE_URL = process.env.STRESS_BASE_URL ?? `http://localhost:${process.env.PORT ?? 5000}`;
const REEL_ID = process.argv[2] ?? '6745f1b2d4e3c9a5fab20001';
const N = Number(process.argv[3] ?? 100);

const url = (path) => `${BASE_URL}/api/v2/reels/${REEL_ID}${path}`;

async function getCount() {
  const res = await fetch(url(''));
  if (!res.ok) throw new Error(`GET reel failed: HTTP ${res.status}`);
  return (await res.json()).endorsements;
}

async function main() {
  const before = await getCount();
  console.log(`[stress] reel ${REEL_ID} — before: ${before}`);
  console.log(`[stress] firing ${N} PATCH /endorse requests in parallel…`);

  const t0 = performance.now();
  const responses = await Promise.all(
    Array.from({ length: N }, () => fetch(url('/endorse'), { method: 'PATCH' })),
  );
  const elapsed = Math.round(performance.now() - t0);

  const statuses = responses.map((r) => r.status);
  const bodies = await Promise.all(responses.map((r) => r.json()));
  const returned = bodies.map((b) => b.endorsements).sort((a, b) => a - b);
  const after = await getCount();

  const allOk = statuses.every((s) => s === 200);
  const distinct = new Set(returned).size === N;
  const contiguous = returned.every((v, i) => v === before + i + 1);
  const exact = after - before === N;

  console.log(`[stress] done in ${elapsed} ms`);
  console.log(`[stress] HTTP 200            : ${statuses.filter((s) => s === 200).length}/${N} ${allOk ? 'OK' : 'FAIL'}`);
  console.log(`[stress] distinct values     : ${new Set(returned).size}/${N} ${distinct ? 'OK' : 'FAIL'}`);
  console.log(`[stress] contiguous ${before + 1}..${before + N} : ${contiguous ? 'OK' : 'FAIL'}`);
  console.log(`[stress] after: ${after} (expected ${before + N}) ${exact ? 'OK' : 'FAIL'}`);

  if (!(allOk && distinct && contiguous && exact)) {
    process.exitCode = 1;
    console.error('[stress] FAILED — lost updates or errors detected');
  } else {
    console.log('[stress] PASSED — zero lost updates under concurrency');
  }
}

main().catch((err) => {
  console.error('[stress] error:', err.message);
  process.exitCode = 1;
});