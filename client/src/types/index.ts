
export type StreamingService = 'netflix' | 'spotify' | 'disney' | 'hbo' | 'youtube' | 'other';
export type PlanDuration = '1m' | '3m' | '6m' | '12m';
export type StockStatus = 'available' | 'sold' | 'expired' | 'suspended';
export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'mpesa' | 'emola' | 'other';

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  createdAt: string;
}

export interface IPlan {
  _id: string;
  service: StreamingService;
  name: string;
  description: string;
  duration: PlanDuration;
  price: number;
  isActive: boolean;
  stockCount: number;
}

export interface IStock {
  _id: string;
  plan: string | IPlan;
  email: string;
  password: string;
  pin?: string;
  profileName?: string;
  expiresAt: string;
  status: StockStatus;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: string | IUser;
  plan: string | IPlan;
  stock?: IStock;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
  status: OrderStatus;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

// Dashboard Admin
export interface IDashboardStats {
  salesToday: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  stockAvailable: number;
}