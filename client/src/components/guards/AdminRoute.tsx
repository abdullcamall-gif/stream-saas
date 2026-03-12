import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

// Componente de carregamento interno (opcional)
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <svg className="animate-spin" style={{ color: '#00ffff' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </div>
);

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/minha-conta" replace />;

  return <>{children}</>;
};

// É CRUCIAL exportar como default para o seu import no App.tsx funcionar
export default AdminRoute;