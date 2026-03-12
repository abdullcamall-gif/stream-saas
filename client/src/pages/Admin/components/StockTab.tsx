import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import api from '../../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-primary/10 text-primary',
  sold:      'bg-white/5 text-white/30',
  expired:   'bg-red-500/10 text-red-400',
  suspended: 'bg-orange-500/10 text-orange-400',
};

const emptyForm = { planId: '', email: '', password: '', pin: '', profileName: '', expiresAt: '' };

export const StockTab = () => {
  const [stock, setStock]           = useState<any[]>([]);
  const [plans, setPlans]           = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [form, setForm]             = useState({ ...emptyForm });
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      const [stockRes, plansRes] = await Promise.all([
        api.get('/admin/stock'),
        api.get('/admin/plans'),
      ]);
      setStock(stockRes.data.data?.stocks || []);
      setPlans(Array.isArray(plansRes.data.data?.plans) ? plansRes.data.data.plans : []);
    } catch {
      setError('Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.planId || !form.email || !form.password) { setError('Plano, email e senha são obrigatórios.'); return; }
    setIsSaving(true); setError('');
    try {
      const payload: any = {
        plan: form.planId, email: form.email, password: form.password,
        ...(form.pin && { pin: form.pin }),
        ...(form.profileName && { profileName: form.profileName }),
        ...(form.expiresAt && { expiresAt: form.expiresAt }),
      };
      if (editingId) { await api.put(`/admin/stock/${editingId}`, payload); showSuccess('Conta actualizada!'); }
      else           { await api.post('/admin/stock', payload); showSuccess('Conta adicionada!'); }
      setForm({ ...emptyForm }); setEditingId(null); fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao guardar.');
    } finally { setIsSaving(false); }
  };

  const handleEdit = (item: any) => {
    setForm({ planId: item.plan?._id || item.plan || '', email: item.email, password: item.password,
      pin: item.pin || '', profileName: item.profileName || '',
      expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : '' });
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apagar esta conta do estoque?')) return;
    try { await api.delete(`/admin/stock/${id}`); showSuccess('Conta removida.'); fetchData(); }
    catch { setError('Erro ao apagar.'); }
  };

  const filtered = Array.isArray(stock) ? stock.filter(s => {
    const planId = s.plan?._id || s.plan;
    if (filterPlan && planId !== filterPlan) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  }) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Gestão de <span className="text-primary">Estoque</span></h2>
        <p className="text-white/40 mt-2 font-medium">Abasteça o sistema com credenciais de streaming.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* FORMULÁRIO */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] sticky top-8">
            <h3 className="font-black italic uppercase text-lg mb-8 tracking-tight">{editingId ? 'Editar' : 'Nova'} <span className="text-primary">Conta</span></h3>
            {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4"><X size={13} className="text-red-400 shrink-0" /><span className="text-red-400 text-xs">{error}</span></div>}
            {success && <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4"><Check size={13} className="text-primary shrink-0" /><span className="text-primary text-xs">{success}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Plano</label>
                <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))}
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold appearance-none">
                  <option value="">Seleccionar plano...</option>
                  {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              {[
                { label: 'E-mail de Acesso', field: 'email', type: 'email', placeholder: 'conta@email.com' },
                { label: 'Senha', field: 'password', type: 'text', placeholder: 'senha da conta' },
                { label: 'PIN (opcional)', field: 'pin', type: 'text', placeholder: 'ex: 1234' },
                { label: 'Nome do Perfil (opcional)', field: 'profileName', type: 'text', placeholder: 'ex: Perfil 1' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(form as any)[field]}
                    onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); }}
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold" />
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Expira em (opcional)</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold" />
              </div>
              <div className="flex gap-3 pt-2">
                {editingId && (
                  <button type="button" onClick={() => { setForm({ ...emptyForm }); setEditingId(null); setError(''); }}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-4 bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> : <Plus size={14} />}
                  {editingId ? 'Actualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
              className="flex-1 bg-white/[0.02] border border-white/10 p-3 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold appearance-none text-white/50">
              <option value="">Todos os planos</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 bg-white/[0.02] border border-white/10 p-3 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold appearance-none text-white/50">
              <option value="">Todos os status</option>
              <option value="available">Disponível</option>
              <option value="sold">Vendido</option>
              <option value="expired">Expirado</option>
              <option value="suspended">Suspenso</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><svg className="animate-spin" style={{ color: '#00ffff' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 border border-white/5 rounded-[2.5rem]">
              <Plus size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-bold">Nenhuma conta no estoque</p>
              <p className="text-xs mt-1">Usa o formulário para adicionar credenciais</p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02]">
                  <tr className="text-[10px] uppercase font-black text-white/20 tracking-[0.2em] border-b border-white/5">
                    <th className="p-5">Plano</th><th className="p-5">E-mail</th><th className="p-5">Status</th><th className="p-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(item => {
                    const plan = item.plan as any;
                    return (
                      <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-5">
                          <span className="font-bold text-sm block">{plan?.name || '—'}</span>
                          {item.expiresAt && <span className="text-[10px] text-white/20">Expira: {new Date(item.expiresAt).toLocaleDateString('pt-PT')}</span>}
                        </td>
                        <td className="p-5">
                          <span className="text-sm font-mono text-white/60">{item.email}</span>
                          {item.profileName && <span className="block text-[10px] text-white/20">Perfil: {item.profileName}</span>}
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[item.status] || 'bg-white/5 text-white/30'}`}>{item.status}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-white/20 hover:text-primary transition-colors"><Edit3 size={15} /></button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
