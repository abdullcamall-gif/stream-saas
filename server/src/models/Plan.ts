import mongoose, { Schema } from 'mongoose';
import { IPlan } from '../types/index';

const PlanSchema = new Schema<IPlan>(
  {
    service: {
      type: String,
      enum: ['Netflix', 'Spotify', 'Prime Video', 'Disney+', 'HBO Max', 'Crunchyroll', 'YouTube Premium', 'Other'],
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    duration: {
      type: String,
      enum: ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

PlanSchema.virtual('stockCount', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'plan',
  count: true,
  match: { status: 'available' },
});

PlanSchema.index({ service: 1, isActive: 1 });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);