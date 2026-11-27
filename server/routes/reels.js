import { Router } from 'express';
import { Reel } from '../models/Reel.js';

/**
 * Express 5 atomic reels endpoints (contract: Slides 13 & 25).
 * Express 5 forwards rejected promises from async handlers to the error pipeline
 * automatically → no try/catch boilerplate, no Mongoose callbacks (Slide 29 #03).
 */
export const reelsRouter = Router();

// GET /api/v2/reels — newest first; lean() returns plain JSON (no hydration cost)
reelsRouter.get('/', async (req, res) => {
  const reels = await Reel.find().sort({ createdAt: -1, _id: 1 }).select('-__v').lean();
  res.json(reels);
});

// GET /api/v2/reels/:id
reelsRouter.get('/:id', async (req, res) => {
  const reel = await Reel.findById(req.params.id).select('-__v').lean();
  if (!reel) return res.status(404).json({ error: 'Reel not found' });
  res.json(reel);
});

// PATCH /api/v2/reels/:id/endorse — ONE atomic server-side increment
reelsRouter.patch('/:id/endorse', async (req, res) => {
  const updated = await Reel.findByIdAndUpdate(
    req.params.id,
    { $inc: { endorsements: 1 } },
    { new: true, runValidators: true, projection: { __v: 0 } },
  ).lean();

  if (!updated) return res.status(404).json({ error: 'Reel not found' });
  res.json(updated);
});