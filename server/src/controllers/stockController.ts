import { Request, Response, NextFunction } from 'express';
import { Stock } from '../models/Stock';
import { createError } from '../middlewares/errorHandler';

export const getStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, plan, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Stock.countDocuments(filter);
    const stocks = await Stock.find(filter)
      .populate('plan', 'name service')
      .populate('soldTo', 'name email phone')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.status(200).json({ success: true, message: 'Estoque listado', data: { stocks }, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) { next(error); }
};

export const addStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const stocks = await Stock.insertMany(items);
    res.status(201).json({ success: true, message: `${stocks.length} conta(s) adicionada(s) ao estoque!`, data: { stocks } });
  } catch (error) { next(error); }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stock) return next(createError('Conta não encontrada', 404));
    res.status(200).json({ success: true, message: 'Conta atualizada!', data: { stock } });
  } catch (error) { next(error); }
};

export const deleteStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return next(createError('Conta não encontrada', 404));
    res.status(200).json({ success: true, message: 'Conta removida do estoque.' });
  } catch (error) { next(error); }
};

export const getStockStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Stock.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const formatted = stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), { available: 0, sold: 0, expired: 0, suspended: 0 });
    res.status(200).json({ success: true, message: 'Estatísticas do estoque', data: { stats: formatted } });
  } catch (error) { next(error); }
};