import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * EvidenceReel schema — Mongoose 8.
 * Legacy fix (Slides 11–12): `likes: String` → validated numeric `endorsements`.
 * String counters break math: "1" + 1 === "11", and $inc on a string field throws.
 */
const reelSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: 140,
    },
    player: {
      type: String,
      required: [true, 'player is required'],
      trim: true,
      maxlength: 40,
    },
    src: {
      type: String,
      required: [true, 'src is required'],
      trim: true,
      match: [/^(\/videos\/[\w.-]+\.mp4|https:\/\/\S+)$/, 'src must be /videos/*.mp4 or an https URL'],
    },
    durationSec: {
      type: Number,
      min: 0,
      default: 0,
    },
    endorsements: {
      type: Number,
      default: 0,
      min: [0, 'endorsements cannot be negative'],
      validate: { validator: Number.isInteger, message: 'endorsements must be an integer' },
    },
    telemetry: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: [],
      validate: { validator: (arr) => arr.length <= 12, message: 'telemetry allows at most 12 items' },
    },
  },
  { timestamps: true }, // createdAt / updatedAt managed by Mongoose
);

// Feed is listed newest-first → index the sort key
reelSchema.index({ createdAt: -1 });

export const Reel = model('Reel', reelSchema);