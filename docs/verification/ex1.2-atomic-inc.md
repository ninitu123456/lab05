# Exercise 1.2 — Express 5 & Mongoose 8 Atomic $inc Verification

**Stack:** Node 22 · Express 5.3 · Mongoose 8.24 · MongoDB Community (local)

## Contract checklist (Slides 13 & 25)
| Requirement | Implementation | Result |
|-------------|----------------|--------|
| No Mongoose callbacks | All queries `await`ed (`routes/reels.js`, `scripts/*`) | ✅ |
| No `useNewUrlParser` / `useUnifiedTopology` | `config/db.js` → only `serverSelectionTimeoutMS` | ✅ |
| `likes: String` → numeric `endorsements` | `{ type: Number, default: 0, min: 0 }` + integer validator | ✅ |
| Atomic counter | `findByIdAndUpdate(id, { $inc: { endorsements: 1 } }, { new: true, runValidators: true })` | ✅ |
| 404 on missing reel | `if (!updated) return res.status(404)` | ✅ |
| Express 5 async error pipeline | Central `errorHandler`; no try/catch needed | ✅ |

## Error pipeline
| Request | Status |
|---------|--------|
| `PATCH /api/v2/reels/abc/endorse` | 400 |
| `PATCH /api/v2/reels/zzzzzzzzzzzz/endorse` | 400 (12-char string rejected) |
| `PATCH /api/v2/reels/000000000000000000000000/endorse` | 404 |
| `GET /api/unknown` | 404 JSON |
| Unhandled DB error | 500 `"Internal server error"` (stack only in server log) |

## Concurrency stress test — 100 parallel PATCH

| Check | Result |
|-------|--------|
| HTTP 200 | 100/100 |
| Distinct returned values | 100/100 |
| Contiguous 1..100 | ✅ |
| Final `endorsements` | **100** |
| Elapsed | <...> ms |

![Stress test](./ex1.2-stress.png)

## Legacy vs atomic (race demo, 100 concurrent increments)
| Strategy | Final | Lost updates |
|----------|-------|--------------|
| `findById → +1 → save()` (legacy) | <...>/100 | <...> |
| `$inc` (S3T standard) | 100/100 | 0 |

**Why:** read-modify-write lets concurrent requests read the same value and overwrite each other.
`$inc` executes inside MongoDB as a single atomic single-document operation.

![Compass](./ex1.2-compass.png)