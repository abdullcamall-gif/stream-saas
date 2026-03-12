import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';

const STATUS_MAP: Record<string, { dot: string; badge: string; label: string }> = {
  pending:         { dot: 'bg-white/30',   badge: 'bg-white/5 text-white/40',         label: 'Pendente' },
  proof_submitted: { dot: 'bg-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400', label: 'Comprovante' },
  paid:            { dot: 'bg-blue-400',   badge: 'bg-blue-500/10 text-blue-400',     label: 'Pago' },
  delivered:       { dot: 'bg-primary',    badge: 'bg-primary/10 text-primary',       label: 'Entregue' },
  cancelled:       { dot: 'bg-red-400',    badge: 'bg-red-500/10 text-red-400',       label: 'Cancelado' },
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarTab = () => {
  const today = new Date();
  const [current, setCurrent]       = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [orders, setOrders]         = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  useEffect(() => {
    api.get('/admin/orders?limit=500')
      .then(res => setOrders(res.data.data?.orders || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const firstDay    = new Date(current.year, current.month, 1).getDay();
  const monthName   = new Date(current.year, current.month).toLocaleString('pt-PT', { month: 'long' });

  const prev = () => { setSelectedDay(null); setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }); };
  const next = () => { setSelectedDay(null); setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }); };

  // Agrupa pedidos por dia
  const ordersByDay: Record<number, any[]> = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (d.getFullYear() === current.year && d.getMonth() === current.month) {
      const day = d.getDate();
      if (!ordersByDay[day]) ordersByDay[day] = [];
      ordersByDay[day].push(o);
    }
  });

  const selectedOrders = selectedDay ? (ordersByDay[selectedDay] || []) : [];

  // Stats do mês
  const monthOrders  = orders.filter(o => { const d = new Date(o.createdAt); return d.getFullYear() === current.year && d.getMonth() === current.month; });
  const monthRevenue = monthOrders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Título */}
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
          Calendário de <span className="text-primary">Pedidos</span>
        </h2>
        <p className="text-white/40 mt-2 font-medium">Visualiza os pedidos por dia e mês.</p>
      </div>

      {/* Stats do mês */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pedidos no Mês', value: monthOrders.length, color: 'text-white' },
          { label: 'Receita Entregue', value: `${monthRevenue.toLocaleString('pt-MZ')} MT`, color: 'text-primary' },
          { label: 'Dias com Pedidos', value: Object.keys(ordersByDay).length, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{s.label}</p>
            <p className={`text-3xl font-black italic ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">

        {/* CALENDÁRIO */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-[2rem] p-7">

          {/* Navegação */}
          <div className="flex items-center justify-between mb-7">
            <button onClick={prev} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <span className="font-black text-lg capitalize tracking-wide">
              {monthName} <span className="text-primary">{current.year}</span>
            </span>
            <button onClick={next} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-white/20 py-1">{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin" style={{ color: '#00ffff' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day        = i + 1;
                const isToday    = today.getDate() === day && today.getMonth() === current.month && today.getFullYear() === current.year;
                const isSelected = selectedDay === day;
                const dayOrders  = ordersByDay[day] || [];
                const hasOrders  = dayOrders.length > 0;
                const statuses   = [...new Set(dayOrders.map((o: any) => o.status))].slice(0, 3) as string[];

                return (
                  <button key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all
                      ${isSelected ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,255,255,0.15)]' :
                        isToday    ? 'border border-primary/40 text-primary bg-primary/5' :
                        hasOrders  ? 'bg-white/[0.04] hover:bg-white/[0.08] text-white' :
                                     'text-white/20 hover:bg-white/[0.03] hover:text-white/40'}`}
                  >
                    <span>{day}</span>
                    {hasOrders && (
                      <div className="flex gap-0.5 mt-0.5">
                        {statuses.map((s, si) => (
                          <div key={si} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black/40' : (STATUS_MAP[s]?.dot || 'bg-white/30')}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/5">
            {Object.entries(STATUS_MAP).map(([, v]) => (
              <div key={v.label} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
                <span className="text-[10px] text-white/30">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAINEL LATERAL — pedidos do dia seleccionado */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-black italic uppercase tracking-tight">
              {selectedDay
                ? <span>Dia <span className="text-primary">{selectedDay}</span> de {monthName}</span>
                : 'Selecciona um dia'}
            </h3>
            {selectedDay && (
              <p className="text-[10px] text-white/30 mt-0.5">{selectedOrders.length} pedido{selectedOrders.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="overflow-y-auto max-h-[420px]">
            {!selectedDay ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <ChevronLeft size={28} className="mb-2 opacity-20 rotate-180" />
                <p className="text-sm font-bold">Clica num dia no calendário</p>
              </div>
            ) : selectedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <p className="text-sm font-bold">Nenhum pedido neste dia</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {selectedOrders.map((order: any) => {
                  const customer = order.customer as any;
                  const plan     = order.plan as any;
                  const status   = STATUS_MAP[order.status] || { badge: 'bg-white/5 text-white/40', label: order.status };
                  return (
                    <div key={order._id} className="p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{customer?.name || '—'}</p>
                          <p className="text-[10px] text-white/30 font-mono">{order.orderNumber}</p>
                          <p className="text-xs text-white/50 mt-1">{plan?.name || '—'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-primary">{order.amount} MT</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${status.badge}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
