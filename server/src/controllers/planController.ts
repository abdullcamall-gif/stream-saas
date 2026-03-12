import { Request, Response, NextFunction } from 'express';
import { Plan } from '../models/Plan';
import { Stock } from '../models/Stock';
import { createError } from '../middlewares/errorHandler';

export const getPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await Plan.find({ isActive: true }).populate('stockCount');
    res.status(200).json({ success: true, message: 'Planos disponíveis', data: { plans } });
  } catch (error) { next(error); }
};

export const getPlanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await Plan.findById(req.params.id).populate('stockCount');
    if (!plan) return next(createError('Plano não encontrado', 404));
    const availableStock = await Stock.countDocuments({ plan: plan._id, status: 'available' });
    res.status(200).json({ success: true, message: 'Detalhes do plano', data: { plan, availableStock } });
  } catch (error) { next(error); }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, message: 'Plano criado com sucesso!', data: { plan } });
  } catch (error) { next(error); }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return next(createError('Plano não encontrado', 404));
    res.status(200).json({ success: true, message: 'Plano atualizado!', data: { plan } });
  } catch (error) { next(error); }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!plan) return next(createError('Plano não encontrado', 404));
    res.status(200).json({ success: true, message: 'Plano desativado.' });
  } catch (error) { next(error); }
};