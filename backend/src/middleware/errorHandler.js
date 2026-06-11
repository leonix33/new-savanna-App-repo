import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export function notFound(req, _res, next) {
  const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.issues
    });
  }

  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) logger.error({ error }, error.message);

  return res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details
  });
}
