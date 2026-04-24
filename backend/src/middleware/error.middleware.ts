import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
  }

  if ((err as any).code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
};
