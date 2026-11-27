import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

/**
 * router.param() guard: reject malformed ids with 400 BEFORE any DB round-trip.
 * Note: isValidObjectId() also accepts any 12-char string (e.g. "zzzzzzzzzzzz"),
 * so we additionally require the canonical 24-char hex form.
 */
export function validateObjectId(req, res, next, value, name) {
  if (!mongoose.isValidObjectId(value) || String(value).length !== 24) {
    return next(new HttpError(400, `Invalid ${name}: must be a 24-char hex ObjectId`));
  }
  next();
}