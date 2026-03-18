import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IAuthPayload {
  id: string;
  role: 'admin' | 'customer';
}

export interface IAuthRequest extends Request {
  user?: IAuthPayload;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  password: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type StreamingService = 'netflix' | 'spotify' | 'disney' | 'hbo' | 'youtube' | 'other';
export type PlanDuration = '1m' | '3m' | '6m' | '12m';

export interface IPlan {
  _id: Types.ObjectId;
  service: StreamingService;
  name: string;
  description: string;
  duration: PlanDuration;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type StockStatus = 'available' | 'sold' | 'expired' | 'suspended';

export interface IStock {
  _id: Types.ObjectId;
  plan: Types.ObjectId;
  email: string;
  password: string;
  pin?: string;
  profileName?: string;
  expiresAt: Date;
  status: StockStatus;
  soldTo?: Types.ObjectId;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'proof_submitted' | 'paid' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'mpesa' | 'emola' | 'other';

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  customer: Types.ObjectId;
  plan: Types.ObjectId;
  stock?: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
  paymentReference?: string;
  proofImage?: string;
  status: OrderStatus;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}