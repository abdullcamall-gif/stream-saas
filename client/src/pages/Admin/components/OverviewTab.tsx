import { useEffect, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, Clock } from 'lucide-react';
import api from '../../../lib/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  delivered:       { label: 'Entregue',   color: 'bg-emerald-500/10 text-emerald-400' },
  paid:            { label: 'Pago',       color: 'bg-blue-500/10 text-blue-400' },
  proof_submitted: { label: 'Comprovante',color: 'bg-yellow-500/10 text-yellow-400' },
  pending:         { label: 'Pendente',   color: 'bg-white/5 text-white/30' },
  cancelled:       { label: 'Cancelado',  color: 'bg-red-500/10 text-red-400' },
};

export const OverviewTab = () => {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/orders?limit=5&sort=-createdAt'),
        ]);
        setStats(statsRes.data.data);
        const raw = ordersRes.data.data?.orders || ordersRes.data.data || [];
        setOrders(raw.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <svg className="animate-spin" style={{ color: '#00ffff' }} width="28" height="28"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Vendas Hoje"
          value={`${(stats?.salesToday || 0).toLocaleString('pt-MZ')} MT`}
          subText="Receita do dia"
          icon={TrendingUp}
          color="text-emerald-400"
        />
        <StatCard
          label="Total Clientes"
          value={stats?.totalCustomers ?? '—'}
          subText="Clientes registados"
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          label="Pedidos Pendentes"
          value={stats?.pendingOrders ?? '—'}
          subText="A aguardar aprovação"
          icon={Clock}
          color="text-yellow-400"
        />
        <StatCard
          label="Estoque Disponível"
          value={stats?.stockAvailable ?? '—'}
          subText="Contas prontas a entregar"
          icon={AlertTriangle}
          color="text-primary"
        />
      </div>

      {/* COMPROVANTES PENDENTES — alerta se houver */}
      {stats?.proofPending > 0 && (
        <div className="flex items-center gap-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          <p className="text-sm text-yellow-400 font-bold">
            {stats.proofPending} comprovante{stats.proofPending > 1 ? 's' : ''} a aguardar verificação
          </p>
        </div>
      )}

      {/* ÚLTIMAS VENDAS */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">
            Últimas <span className="text-primary">Vendas</span>
          </h3>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-white/20 text-sm py-8">Nenhum pedido ainda.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] border-b border-white/5">
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Plano</th>
                <th className="pb-4">Valor</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(order => {
                const customer = order.customer as any;
                const plan = order.plan as any;
                const { label, color } = STATUS_MAP[order.status] || { label: order.status, color: 'bg-white/5 text-white/30' };
                return (
                  <tr key={order._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-bold text-sm">
                      {customer?.name || '—'}
                      <span className="block text-[10px] text-white/20 font-mono">{customer?.phone}</span>
                    </td>
                    <td className="py-4 text-sm font-medium text-white/60">{plan?.name || '—'}</td>
                    <td className="py-4 text-sm font-black text-primary">{order.amount} MT</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${color}`}>{label}</span>
                    </td>
                    <td className="py-4 text-xs text-white/30">
                      {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subText, icon: Icon, color }: any) => (
  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-primary/20 transition-all group">
    <div className={`w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</p>
    <p className="text-3xl font-black mt-1 italic tracking-tighter">{value}</p>
    <p className="text-[10px] font-bold text-white/20 mt-2">{subText}</p>
  </div>
);
