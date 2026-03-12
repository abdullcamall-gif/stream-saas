import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { IPlan } from '../types';

export const usePlans = () => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<{ data: { plans: IPlan[] } }>('/plans');
        setPlans(res.data.data?.plans || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { plans, isLoading, error };
};

export const usePlan = (id: string) => {
  const [plan, setPlan] = useState<IPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await api.get<{ data: { plan: IPlan; availableStock: number } }>(`/plans/${id}`);
        setPlan(res.data.data?.plan || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar plano');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { plan, isLoading, error };
};