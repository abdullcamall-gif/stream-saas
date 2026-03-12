import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  if (err.name === 'CastError') { statusCode = 400; message = 'ID inválido'; }
  if (err.name === 'ValidationError') { statusCode = 400; }
  if ('code' in err && (err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0] || 'campo';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`;
  }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Token inválido'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expirado'; }

  if (process.env.NODE_ENV === 'development') console.error('❌ Error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};