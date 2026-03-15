import mongoose, { Schema, Document } from 'mongoose';
import { IStock } from '../types/index';

export interface IStockDocument extends IStock, Document {}

const StockSchema = new Schema<IStockDocument>(
  {
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    pin: { type: String, default: null },
    profileName: { type: String, trim: true, default: null },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'sold', 'expired', 'suspended'],
      default: 'available',
    },
    soldTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    soldAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// ✅ Middleware pre-save seguro
StockSchema.pre<IStockDocument>('save', function (this: IStockDocument, next) {
  if (this.expiresAt < new Date() && this.status === 'available') {
    this.status = 'expired';
  }
});

// Índices
StockSchema.index({ plan: 1, status: 1 });
StockSchema.index({ soldTo: 1 });
StockSchema.index({ expiresAt: 1 });

// Model
export const Stock = mongoose.model<IStockDocument>('Stock', StockSchema);