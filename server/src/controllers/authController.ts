import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IAuthRequest } from '../types/index';
import { createError } from '../middlewares/errorHandler';

const generateToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

// POST /api/auth/register — { name, phone, password }
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, password } = req.body;

    const exists = await User.findOne({ phone });
    if (exists) return next(createError('Este número já está registado', 409));

    const user = await User.create({ name, phone, password, role: 'customer' });
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: { user, token },
    });
  } catch (error) { next(error); }
};

// POST /api/auth/login — { phone, password }
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone }).select('+password');
    if (!user) return next(createError('Número ou senha incorretos', 401));
    if (!user.isActive) return next(createError('Conta suspensa. Contacte o suporte.', 403));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(createError('Número ou senha incorretos', 401));

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Login efetuado com sucesso!',
      data: { user: user.toJSON(), token },
    });
  } catch (error) { next(error); }
};

// GET /api/auth/me
export const getMe = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return next(createError('Utilizador não encontrado', 404));

    res.status(200).json({
      success: true,
      message: 'Dados do utilizador',
      data: { user },
    });
  } catch (error) { next(error); }
};