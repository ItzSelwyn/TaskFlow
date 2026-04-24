import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  const errorResponse: any = { success: false, message };
  if (errors) { errorResponse.errors = errors; }
  res.status(statusCode).json(errorResponse);
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
