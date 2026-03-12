import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import type { IOrder, IStock, IDashboardStats, IPlan } from '../types';

// ----- Dashboard Stats -----
export const useDashboardStats = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<{ data: IDashboardStats }>('/admin/dashboard/stats');
        setStats(res.data.data || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { stats, isLoading };
};

// ----- Gestão de Estoque -----
export const useAdminStock = () => {
  const [stocks, setStocks] = useState<IStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStock = useCallback(async (filters?: { status?: string; plan?: string }) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(filters as Record<string, string>).toString();
      const res = await api.get<{ data: { stocks: IStock[] } }>(`/admin/stock?${params}`);
      setStocks(res.data.data?.stocks || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const addStock = async (data: Partial<IStock> | Partial<IStock>[]) => {
    await api.post('/admin/stock', data);
    fetchStock();
  };

  const deleteStock = async (id: string) => {
    await api.delete(`/admin/stock/${id}`);
    setStocks(prev => prev.filter(s => s._id !== id));
  };

  return { stocks, isLoading, fetchStock, addStock, deleteStock };
};

// ----- Gestão de Pedidos -----
export const useAdminOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async (status?: string) => {
    try {
      setIsLoading(true);
      const params = status ? `?status=${status}` : '';
      const res = await api.get<{ data: { orders: IOrder[] } }>(`/admin/orders${params}`);
      setOrders(res.data.data?.orders || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, isLoading, fetchOrders };
};

// ----- Gestão de Planos -----
export const useAdminPlans = () => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<{ data: { plans: IPlan[] } }>('/plans');
        setPlans(res.data.data?.plans || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const createPlan = async (data: Partial<IPlan>) => {
    const res = await api.post<{ data: { plan: IPlan } }>('/admin/plans', data);
    setPlans(prev => [...prev, res.data.data!.plan]);
  };

  const deletePlan = async (id: string) => {
    await api.delete(`/admin/plans/${id}`);
    setPlans(prev => prev.filter(p => p._id !== id));
  };

  return { plans, isLoading, createPlan, deletePlan };
};