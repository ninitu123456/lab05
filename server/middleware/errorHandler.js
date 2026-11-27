import mongoose from 'mongoose';

/** Catch-all for unmatched routes → JSON 404 (never Express's default HTML page) */
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Map known error types → safe HTTP status + client message */
function toHttp(err) {
  if (err.name === 'HttpError') {
    return { status: err.status, body: { error: err.message, details: err.details } };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, body: { error: `Invalid ${err.path}: ${JSON.stringify(err.value)}` } };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
    return { status: 422, body: { error: 'Validation failed', details } };
  }
  if (err.type === 'entity.parse.failed') {
    return { status: 400, body: { error: 'Malformed JSON body' } };
  }
  if (err.type === 'entity.too.large') {
    return { status: 413, body: { error: 'Request body too large' } };
  }
  // Unknown → generic message; real cause stays in server logs only
  return { status: 500, body: { error: 'Internal server error' } };
}

/**
 * Central Express 5 error pipeline.
 * - Express 5 forwards rejected promises from async handlers here automatically.
 * - 4 parameters are REQUIRED for Express to treat this as an error handler.
 * - Stack traces are logged server-side, never sent to the client.
 */
export function errorHandler(err, req, res, next) {
  const { status, body } = toHttp(err);

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  // Response already streaming → let Express close the socket
  if (res.headersSent) return next(err);

  res.status(status).json(body);
}