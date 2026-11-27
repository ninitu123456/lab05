/**
 * Expected, client-facing error with an HTTP status.
 * Throw/next() it anywhere; the central errorHandler turns it into JSON.
 */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}