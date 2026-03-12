import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, IAuthPayload } from '../types/index';

export const protect = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Acesso negado. Token não fornecido.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IAuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
  }
};

export const adminOnly = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
    return;
  }
  next();
};

export const customerOnly = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'customer') {
    res.status(403).json({ success: false, message: 'Acesso restrito a clientes.' });
    return;
  }
  next();
};