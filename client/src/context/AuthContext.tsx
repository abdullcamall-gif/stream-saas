import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../lib/api';
import type { IUser, IAuthResponse } from '../types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  phone: string;
  password: string;
}

interface LoginData {
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ss_token');
    const savedUser = localStorage.getItem('ss_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        console.log('Sessão restaurada:', parsedUser);
      } catch {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
      }
    }
    setIsLoading(false);
  }, []);

  const saveSession = (data: IAuthResponse) => {
    // LOG CRÍTICO: Vamos ver o que o backend enviou
    console.log("=== RESPOSTA DO BACKEND ===");
    console.log("Token:", data.token);
    console.log("User Object:", data.user);
    console.log("Role recebida:", data.user?.role);
    console.log("============================");

    localStorage.setItem('ss_token', data.token);
    localStorage.setItem('ss_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const res = await api.post<{ data: IAuthResponse }>('/auth/register', {
        name: data.name.trim(),
        phone: data.phone,
        password: data.password,
      });
      saveSession(res.data.data!);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erro ao criar conta.';
      throw new Error(message);
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      const res = await api.post<{ data: IAuthResponse }>('/auth/login', data);
      
      // Verifica se a estrutura da resposta está correta
      const authData = res.data.data;
      if (!authData) throw new Error("Resposta do servidor mal formatada.");
      
      saveSession(authData);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Número ou senha incorretos.';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Log para monitorar a Role em tempo real
  const currentIsAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: currentIsAdmin,
      register,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};