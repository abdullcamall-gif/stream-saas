import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/auth';
import { getPlans, getPlanById, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { getStock, addStock, updateStock, deleteStock, getStockStats } from '../controllers/stockController';
import {
  createOrder,
  uploadProof,
  approveOrder,
  rejectOrder,
  getMyOrders,
  getAllOrders,
  getDashboardStats,
} from '../controllers/orderController';
import { uploadProofMiddleware } from '../middlewares/upload';

const router = Router();

// =============================================
// ROTAS PÚBLICAS
// =============================================
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanById);

// =============================================
// ROTAS DO CLIENTE (autenticado)
// =============================================
router.post('/orders', protect, createOrder);
router.get('/orders/my', protect, getMyOrders);
router.post('/orders/:id/proof', protect, uploadProofMiddleware, uploadProof);

// =============================================
// ROTAS ADMIN
// =============================================
const adminRouter = Router();
adminRouter.use(protect, adminOnly);

// Dashboard
adminRouter.get('/dashboard/stats', getDashboardStats);

// Planos — GET também para o admin listar todos (incluindo inactivos)
adminRouter.get('/plans', getPlans);          // ← linha que faltava
adminRouter.post('/plans', createPlan);
adminRouter.put('/plans/:id', updatePlan);
adminRouter.delete('/plans/:id', deletePlan);

// Estoque
adminRouter.get('/stock', getStock);
adminRouter.get('/stock/stats', getStockStats);
adminRouter.post('/stock', addStock);
adminRouter.put('/stock/:id', updateStock);
adminRouter.delete('/stock/:id', deleteStock);

// Pedidos
adminRouter.get('/orders', getAllOrders);
adminRouter.post('/orders/:id/approve', approveOrder);
adminRouter.post('/orders/:id/reject', rejectOrder);

export { router as apiRouter, adminRouter };