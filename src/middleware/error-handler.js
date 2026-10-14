import { HttpError } from '../lib/http-error.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    const error = { message: err.message };

    if (err.details !== undefined) {
      error.details = err.details;
    }

    return res.status(err.status).json({ error });
  }

  console.error(err);
  return res.status(500).json({
    error: { message: 'Internal server error' },
  });
}
