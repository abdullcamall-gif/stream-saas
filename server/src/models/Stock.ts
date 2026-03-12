import mongoose, { Schema } from 'mongoose';
import { IStock } from '../types/index';

const StockSchema = new Schema<IStock>(
  {
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    pin: { type: String, default: null },
    profileName: { type: String, trim: true, default: null },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['available', 'sold', 'expired', 'suspended'], default: 'available' },
    soldTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    soldAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => { (ret as any).__v = undefined; return ret; },
    },
  }
);

StockSchema.pre('save', function (next) {
  if (this.expiresAt < new Date() && this.status === 'available') {
    this.status = 'expired';
  }
  next();
});

StockSchema.index({ plan: 1, status: 1 });
StockSchema.index({ soldTo: 1 });
StockSchema.index({ expiresAt: 1 });

export const Stock = mongoose.model<IStock>('Stock', StockSchema);