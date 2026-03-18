import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Order } from '../models/Order';
import { Stock } from '../models/Stock';
import { Plan } from '../models/Plan';
import { IAuthRequest } from '../types/index';
import { createError } from '../middlewares/errorHandler';

// ----- POST /api/orders (customer) — Criar pedido -----
export const createOrder = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId, paymentMethod, paymentPhone } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive)
      return next(createError('Plano não encontrado ou indisponível', 404));

    const stockCount = await Stock.countDocuments({ plan: planId, status: 'available' });
    if (stockCount === 0)
      return next(createError('Sem stock disponível para este plano. Tente mais tarde.', 409));

    const order = await Order.create({
      customer: req.user!.id,
      plan: planId,
      amount: plan.price,
      paymentMethod,
      paymentPhone,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Pedido criado! Faça o pagamento e envie o comprovante.',
      data: { order },
    });
  } catch (error) { next(error); }
};

// ----- POST /api/orders/:id/proof (customer) — Upload de comprovante -----
export const uploadProof = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user!.id,
    });

    if (!order) return next(createError('Pedido não encontrado', 404));
    if (order.status !== 'proof_submitted' && order.status !== 'pending')
      return next(createError('Este pedido já foi processado', 400));
    if (!req.file)
      return next(createError('Nenhum ficheiro enviado', 400));

    // Apagar comprovante anterior se existir
    if (order.proofImage) {
      const oldPath = path.join(process.cwd(), 'uploads', order.proofImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    order.proofImage = req.file.filename;
    order.status = 'proof_submitted';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Comprovante enviado! O admin irá verificar em breve.',
      data: { order },
    });
  } catch (error) { next(error); }
};

// ----- POST /api/admin/orders/:id/approve (admin) — Aprovar pedido -----
export const approveOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Pedido não encontrado', 404));
    if (order.status !== 'proof_submitted')
      return next(createError('Pedido não tem comprovante submetido', 400));

    // Reservar conta do estoque
    const availableStock = await Stock.findOneAndUpdate(
      { plan: order.plan, status: 'available' },
      { status: 'sold', soldTo: order.customer, soldAt: new Date() },
      { new: true }
    );

    if (!availableStock)
      return next(createError('Sem stock disponível para entregar', 409));

    order.stock = availableStock._id as any;
    order.status = 'delivered';
    order.paidAt = new Date();
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Pedido aprovado e conta entregue ao cliente!',
      data: { order },
    });
  } catch (error) { next(error); }
};

// ----- POST /api/admin/orders/:id/reject (admin) — Rejeitar pedido -----
export const rejectOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Pedido não encontrado', 404));

    // Apagar comprovante
    if (order.proofImage) {
      const filePath = path.join(process.cwd(), 'uploads', order.proofImage);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      order.proofImage = undefined;
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Pedido rejeitado.',
      data: { order },
    });
  } catch (error) { next(error); }
};

// ----- GET /api/orders/my (customer) -----
export const getMyOrders = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ customer: req.user!.id })
      .populate('plan', 'name service duration')
      .populate('stock', 'email password pin profileName expiresAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Os seus pedidos',
      data: { orders },
    });
  } catch (error) { next(error); }
};

// ----- GET /api/admin/orders (admin) -----
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('plan', 'name service')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Todos os pedidos',
      data: { orders },
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) { next(error); }
};

// ----- GET /api/admin/dashboard/stats -----
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesToday, totalRevenue, totalCustomers, pendingOrders, stockAvailable, proofPending] =
      await Promise.all([
        Order.countDocuments({ status: 'delivered', createdAt: { $gte: today } }),
        Order.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Order.distinct('customer', { status: 'delivered' }),
        Order.countDocuments({ status: 'pending' }),
        Stock.countDocuments({ status: 'available' }),
        Order.countDocuments({ status: 'proof_submitted' }), // ← comprovantes a aguardar
      ]);

    res.status(200).json({
      success: true,
      message: 'Estatísticas do painel',
      data: {
        salesToday,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers: totalCustomers.length,
        pendingOrders,
        stockAvailable,
        proofPending, // ← novo campo
      },
    });
  } catch (error) { next(error); }
};