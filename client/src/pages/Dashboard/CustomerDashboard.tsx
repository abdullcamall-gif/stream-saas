import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyOrders } from '../../hooks/useOrders';
import type { IOrder } from '../../types';

// ----- Helper: badge de status -----
const StatusBadge = ({ status }: { status: IOrder['status'] }) => {
  const map: Record<string, { label: string; color: string }> = {
    delivered: { label: 'Ativo', color: 'bg-green-500/10 text-green-400' },
    pending:   { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-400' },
    paid:      { label: 'Pago', color: 'bg-blue-500/10 text-blue-400' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400' },
    refunded:  { label: 'Reembolsado', color: 'bg-purple-500/10 text-purple-400' },
  };
  const { label, color } = map[status] || { label: status, color: 'bg-white/10 text-white/50' };
  return (
    <span className={`${color} px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider`}>
      {label}
    </span>
  );
};

// ----- Modal: Ver Credenciais -----
const CredentialsModal = ({ order, onClose }: { order: IOrder; onClose: () => void }) => {
  const [copied, setCopied] = useState('');

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const stock = order.stock as any;
  const plan = order.plan as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6 relative"
        style={{ background: 'rgba(10,10,10,0.95)' }}
        onClick={e => e.stopPropagation()}>

        {/* Linha topo */}
        <div className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent)' }} />

        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-white">{plan?.name || 'Credenciais'}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Email', value: stock?.email, field: 'email' },
            { label: 'Senha', value: stock?.password, field: 'password' },
            ...(stock?.pin ? [{ label: 'PIN', value: stock.pin, field: 'pin' }] : []),
            ...(stock?.profileName ? [{ label: 'Perfil', value: stock.profileName, field: 'profile' }] : []),
          ].map(({ label, value, field }) => (
            <div key={field} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">{label}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-mono text-white truncate">{value}</p>
                <button
                  onClick={() => copy(value, field)}
                  className="shrink-0 text-xs font-bold transition-colors"
                  style={{ color: copied === field ? '#00ffff' : 'rgba(255,255,255,0.3)' }}
                >
                  {copied === field ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          ))}

          {stock?.expiresAt && (
            <p className="text-xs text-white/30 text-center pt-1">
              Expira em {new Date(stock.expiresAt).toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- Página Principal -----
export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { orders, isLoading, error } = useMyOrders();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  // Primeiro nome apenas
  const firstName = user?.name?.split(' ')[0] || 'utilizador';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">

        {/* Botão Voltar */}
        <Link
          to="/"
          className="flex items-center gap-2 text-text-main/50 hover:text-primary transition-colors mb-6 text-sm font-medium w-fit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar para o Início
        </Link>

        {/* Tabela */}
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-2xl">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin" style={{ color: '#00ffff' }} width="28" height="28"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          )}

          {/* Erro */}
          {error && !isLoading && (
            <div className="flex items-center justify-center py-16 text-red-400 text-sm gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Sem pedidos */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p className="text-sm font-medium">Ainda não tens subscrições</p>
              <Link to="/" className="mt-3 text-xs font-bold" style={{ color: '#00ffff' }}>
                Ver planos disponíveis →
              </Link>
            </div>
          )}

          {/* Tabela com dados */}
          {!isLoading && !error && orders.length > 0 && (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-text-main/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Serviço</th>
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map(order => {
                  const plan = order.plan as any;
                  return (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{plan?.name || '—'}</td>
                      <td className="p-4 text-white/40 text-xs font-mono">{order.orderNumber}</td>
                      <td className="p-4"><StatusBadge status={order.status} /></td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="p-4 text-white/60 text-sm font-mono">
                        {order.amount.toLocaleString('pt-MZ')} MZN
                      </td>
                      <td className="p-4 text-right">
                        {order.status === 'delivered' && order.stock ? (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs font-semibold hover:brightness-125 transition-all underline decoration-primary/30 underline-offset-4"
                            style={{ color: '#00ffff' }}
                          >
                            Ver Credenciais
                          </button>
                        ) : order.status === 'pending' ? (
                          <span className="text-xs text-yellow-400/60 font-medium">A aguardar aprovação</span>
                        ) : (
                          <span className="text-xs text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal de credenciais */}
      {selectedOrder && (
        <CredentialsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
