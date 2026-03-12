import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types/index';

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    stock: { type: Schema.Types.ObjectId, ref: 'Stock', default: null },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'emola', 'other'],
      required: true,
    },
    paymentPhone: { type: String, required: true, trim: true },
    paymentReference: { type: String, default: null },
    proofImage: { type: String, default: null },   // ← nome do ficheiro do comprovante
    status: {
      type: String,
      enum: ['pending', 'proof_submitted', 'paid', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Gerar número do pedido
OrderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await mongoose.model('Order').countDocuments();
  this.orderNumber = `SS-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  next();
});

OrderSchema.index({ customer: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);