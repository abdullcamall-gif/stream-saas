import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import type { IOrder, PaymentMethod } from '../types';

export const useMyOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ data: { orders: IOrder[] } }>('/orders/my');
      setOrders(res.data.data?.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
};

interface CreateOrderData {
  planId: string;
  paymentMethod: PaymentMethod;
  paymentPhone: string;
}

export const useCreateOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (data: CreateOrderData): Promise<IOrder | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.post<{ data: { order: IOrder } }>('/orders', data);
      return res.data.data?.order || null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar pedido';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createOrder, isLoading, error };
};