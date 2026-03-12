import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, BookOpen, LogOut, Bell, X, Check, CalendarDays, ExternalLink, FileText } from 'lucide-react';
import { OverviewTab } from './components/OverviewTab.tsx';
import { StockTab } from './components/StockTab.tsx';
import { PlansTab } from './components/PlansTab.tsx';
import { CalendarTab } from './components/CalendarTab.tsx';
import { CustomersTab } from './components/CustomersTab.tsx'; // <-- Adicionado
import { useAuth } from '../../context/AuthContext.tsx';
import api from '../../lib/api';

type Tab = 'overview' | 'plans' | 'stock' | 'calendar' | 'customers';

const getProofUrl = (filename: string) =>
  `${(import.meta.env.VITE_API_URL as string)?.replace('/api', '')}/uploads/${filename}`;

const isPdf = (filename: string) => filename?.toLowerCase().endsWith('.pdf');

// ─── Painel de Comprovantes ───────────────────────
const ProofPanel = ({ onClose, onCountChange }: { onClose: () => void; onCountChange: (n: number) => void }) => {
  const [orders, setOrders]         = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [selected, setSelected]     = useState<string | null>(null);
  const [processing, setProcessing] = useState('');
  const [approved, setApproved]     = useState<any | null>(null);

  const fetchOrders = () => {
    setIsLoading(true);
    api.get('/admin/orders?status=proof_submitted')
      .then(res => {
        const list = res.data.data?.orders || [];
        setOrders(list);
        onCountChange(list.length);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleApprove = async (order: any) => {
    setProcessing(order._id);
    try {
      const res = await api.post(`/admin/orders/${order._id}/approve`);
      const updatedOrder = res.data.data?.order || order;
      setOrders(o => o.filter(x => x._id !== order._id));
      onCountChange(orders.length - 1);
      setApproved(updatedOrder);
    } catch {}
    finally { setProcessing(''); }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await api.post(`/admin/orders/${id}/reject`);
      setOrders(o => o.filter(x => x._id !== id));
      onCountChange(orders.length - 1);
    } catch {}
    finally { setProcessing(''); }
  };

  const buildWhatsAppLink = (order: any) => {
    const customer = order.customer as any;
    const plan     = order.plan as any;
    const stock    = order.stock as any;
    const phone    = customer?.phone?.replace(/\D/g, '').replace(/^258/, '') || '';
    const msg = `Olá ${customer?.name?.split(' ')[0] || 'Cliente'} 👋

✅ *O teu pedido foi confirmado!*

📦 *Plano:* ${plan?.name || '—'}
🔢 *Pedido:* ${order.orderNumber}

*🔐 Credenciais de acesso:*
📧 Email: ${stock?.email || '(em breve)'}
🔑 Senha: ${stock?.password || '(em breve)'}${stock?.pin ? `\n📌 PIN: ${stock.pin}` : ''}${stock?.profileName ? `\n👤 Perfil: ${stock.profileName}` : ''}

Qualquer dúvida estamos aqui! 🙏
_Elber Streaming_`;

    return `https://wa.me/258${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20" onClick={onClose}>
      <div
        className="w-full max-w-md h-[85vh] rounded-[2rem] border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl"
        style={{ background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(24px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h3 className="font-black uppercase italic tracking-tight">Comprovantes</h3>
            <p className="text-[10px] text-white/30 mt-0.5">A aguardar verificação</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {approved && (
          <div className="mx-4 mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl shrink-0">
            <p className="text-xs font-bold text-primary mb-0.5">✅ Pedido aprovado!</p>
            <p className="text-[10px] text-white/40 mb-3">Envia as credenciais ao cliente:</p>
            <div className="flex gap-2">
              <a
                href={buildWhatsAppLink(approved)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.519 5.853L.057 23.886a.5.5 0 0 0 .611.61l6.101-1.598A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.523-5.188-1.432l-.372-.22-3.853 1.01 1.028-3.752-.241-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Enviar WhatsApp
              </a>
              <button
                onClick={() => setApproved(null)}
                className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mt-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin" style={{ color: '#00ffff' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/20">
              <Check size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-bold">Nenhum comprovante pendente</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.map(order => {
                const customer  = order.customer as any;
                const plan      = order.plan as any;
                const isOpen    = selected === order._id;
                const isBusy    = processing === order._id;
                const proofUrl  = order.proofImage ? getProofUrl(order.proofImage) : null;
                const proofIsPdf = order.proofImage ? isPdf(order.proofImage) : false;

                return (
                  <div key={order._id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm">{customer?.name || '—'}</p>
                        <p className="text-[10px] text-white/30 font-mono">{order.orderNumber}</p>
                        <p className="text-xs text-white/50 mt-0.5">
                          {plan?.name} · <span className="text-primary font-black">{order.amount} MT</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-white/20">{new Date(order.createdAt).toLocaleDateString('pt-PT')}</span>
                    </div>

                    {proofUrl && (
                      proofIsPdf ? (
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary font-bold mb-3 transition-colors"
                        >
                          <FileText size={13} />
                          Abrir PDF do comprovante
                          <ExternalLink size={11} className="opacity-50" />
                        </a>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelected(isOpen ? null : order._id)}
                            className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary font-bold mb-2 transition-colors"
                          >
                            <ExternalLink size={13} />
                            {isOpen ? 'Ocultar comprovante' : 'Ver comprovante'}
                          </button>
                          {isOpen && (
                            <div className="mb-3 rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                              <img
                                src={proofUrl}
                                alt="Comprovante"
                                className="w-full object-contain max-h-56"
                                onError={e => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = 'none';
                                  el.parentElement!.innerHTML = `
                                    <a href="${proofUrl}" target="_blank"
                                      class="flex items-center justify-center gap-2 py-5 text-xs text-primary font-bold">
                                      Não carregou — clica para abrir
                                    </a>`;
                                }}
                              />
                            </div>
                          )}
                        </>
                      )
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(order)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-40"
                      >
                        {isBusy
                          ? <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                          : <Check size={12} />
                        }
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(order._id)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-40"
                      >
                        <X size={12} /> Rejeitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard Principal ──────────────────────────
export const AdminDashboard = () => {
  const { user, logout }            = useAuth();
  const [activeTab, setActiveTab]   = useState<Tab>('overview');
  const [showProofs, setShowProofs] = useState(false);
  const [proofCount, setProofCount] = useState(0);

  const initial   = user?.name?.charAt(0).toUpperCase() || 'A';
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(res => setProofCount(res.data.data?.proofPending || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col fixed h-full bg-black z-20">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(32,214,199,0.3)]">
            <LayoutDashboard className="text-black" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black italic tracking-tighter text-xl leading-none">ELBER</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Admin Pro</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Resumo Geral"    active={activeTab === 'overview'}  onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={BookOpen}        label="Planos"           active={activeTab === 'plans'}     onClick={() => setActiveTab('plans')} />
          <SidebarItem icon={Package}         label="Estoque & Contas" active={activeTab === 'stock'}     onClick={() => setActiveTab('stock')} />
          <SidebarItem icon={CalendarDays}    label="Calendário"       active={activeTab === 'calendar'}  onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={Users}           label="Clientes"         active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
        </nav>

        <button onClick={logout}
          className="flex items-center gap-3 p-4 rounded-2xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 font-bold text-sm">
          <LogOut size={18} /> Sair do Painel
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <p className="text-white/30 text-sm">Bem-vindo de volta,</p>
            <h2 className="text-xl font-black text-white">Hey, <span className="text-primary">{firstName}</span> 👋</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProofs(v => !v)}
              className="relative p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-white/40 hover:text-primary"
            >
              <Bell size={20} />
              {proofCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                  {proofCount > 9 ? '9+' : proofCount}
                </span>
              )}
            </button>
            <div className="text-right mr-2">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">Admin Mode</p>
              <p className="text-sm font-bold">{user?.name || 'Administrador'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-black text-primary italic">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview'  && <OverviewTab />}
        {activeTab === 'plans'     && <PlansTab />}
        {activeTab === 'stock'     && <StockTab />}
        {activeTab === 'calendar'  && <CalendarTab />}
        {activeTab === 'customers' && <CustomersTab />} {/* <-- Renderização da aba adicionada */}
      </main>

      {showProofs && (
        <ProofPanel
          onClose={() => setShowProofs(false)}
          onCountChange={setProofCount}
        />
      )}
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick}
    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 ${
      active ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(32,214,199,0.05)]' : 'text-white/30 hover:bg-white/5 hover:text-white'
    }`}>
    <Icon size={20} className="mr-3" />
    <span className="font-bold text-sm tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#20D6C7]" />}
  </button>
);