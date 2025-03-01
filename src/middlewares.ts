/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from './interfaces/ErrorResponse';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    statusCode,
  });
}
