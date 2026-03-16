import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import api from '../../../lib/api';

const SERVICES = ['Netflix', 'Spotify', 'Prime Video', 'Disney+', 'HBO Max', 'Crunchyroll', 'Apple Music', 'IPTV'];
const DURATIONS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];

const emptyForm = { service: SERVICES[0], duration: DURATIONS[1], price: '', description: '', isActive: true };

export const PlansTab = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPlans = async () => {
    try {
      const res = await api.get('/admin/plans');
      setPlans(res.data.data?.plans || res.data.data || []);
    } catch {
      setError('Erro ao carregar planos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.price) { setError('Preço é obrigatório.'); return; }

    // Nome gerado automaticamente: "Netflix Mensal"
    const name = `${form.service} ${form.duration}`;

    setIsSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/admin/plans/${editingId}`, {
          service: form.service,
          name,
          duration: form.duration,
          price: Number(form.price),
          description: form.description,
          isActive: form.isActive,
        });
        showSuccess('Plano actualizado!');
      } else {
        await api.post('/admin/plans', {
          service: form.service,
          name,
          duration: form.duration,
          price: Number(form.price),
          description: form.description,
          isActive: form.isActive,
        });
        showSuccess('Plano criado!');
      }
      setForm({ ...emptyForm });
      setEditingId(null);
      fetchPlans();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao guardar plano.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (plan: any) => {
    setForm({
      service: plan.service,
      duration: plan.duration,
      price: String(plan.price),
      description: plan.description || '',
      isActive: plan.isActive,
    });
    setEditingId(plan._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar este plano?')) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      showSuccess('Plano apagado.');
      fetchPlans();
    } catch {
      setError('Erro ao apagar plano.');
    }
  };

  const handleToggle = async (plan: any) => {
    try {
      await api.put(`/admin/plans/${plan._id}`, { ...plan, isActive: !plan.isActive });
      fetchPlans();
    } catch {
      setError('Erro ao alterar estado.');
    }
  };

  // Agrupa planos por serviço para mostrar na lista
  const grouped = SERVICES.map(s => ({
    service: s,
    plans: plans.filter(p => p.service === s),
  })).filter(g => g.plans.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
          Gestão de <span className="text-primary">Planos</span>
        </h2>
        <p className="text-white/40 mt-2 font-medium">Cria os planos por serviço e duração. O nome é gerado automaticamente.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* FORMULÁRIO */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] sticky top-8">
            <h3 className="font-black italic uppercase text-lg mb-2 tracking-tight">
              {editingId ? 'Editar' : 'Novo'} <span className="text-primary">Plano</span>
            </h3>

            {/* Preview do nome */}
            <p className="text-xs text-white/20 mb-6 font-mono">
              → <span className="text-primary/60">{form.service} {form.duration}</span>
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <X size={13} className="text-red-400 shrink-0" />
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4">
                <Check size={13} className="text-primary shrink-0" />
                <span className="text-primary text-xs">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Serviço */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Serviço</label>
                <select
                  value={form.service}
                  onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold appearance-none"
                >
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Duração</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} type="button"
                      onClick={() => setForm(f => ({ ...f, duration: d }))}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        form.duration === d
                          ? 'bg-primary/10 border-primary/40 text-primary'
                          : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preço */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Preço (MZN)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="ex: 500"
                    value={form.price}
                    onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setError(''); }}
                    className="w-full bg-black border border-white/10 p-4 pr-16 rounded-2xl outline-none focus:border-primary/50 text-sm font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold">MT</span>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Descrição (opcional)</label>
                <textarea
                  placeholder="Descrição breve..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-primary/50 text-sm resize-none"
                />
              </div>

              {/* Activo toggle */}
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-xs font-bold text-white/50">Plano Activo</span>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${form.isActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                {editingId && (
                  <button type="button"
                    onClick={() => { setForm({ ...emptyForm }); setEditingId(null); setError(''); }}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-4 bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    : <Plus size={14} />
                  }
                  {editingId ? 'Actualizar' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LISTA AGRUPADA POR SERVIÇO */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin" style={{ color: '#00ffff' }} width="28" height="28"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 border border-white/5 rounded-[2.5rem]">
              <Plus size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-bold">Nenhum plano criado ainda</p>
              <p className="text-xs mt-1">Usa o formulário ao lado para criar o primeiro plano</p>
            </div>
          ) : grouped.map(({ service, plans: sPlans }) => (
            <div key={service} className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
              {/* Header do serviço */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#20D6C7]" />
                <span className="font-black text-sm uppercase tracking-widest">{service}</span>
                <span className="ml-auto text-[10px] text-white/20 font-bold">{sPlans.length} plano{sPlans.length !== 1 ? 's' : ''}</span>
              </div>

              <table className="w-full text-left">
                <tbody className="divide-y divide-white/5">
                  {sPlans.map(plan => (
                    <tr key={plan._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-white/50">{plan.duration}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-primary italic">{plan.price} MT</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggle(plan)}
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                            plan.isActive
                              ? 'bg-primary/10 text-primary hover:bg-primary/20'
                              : 'bg-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-primary shadow-[0_0_8px_#20D6C7]' : 'bg-white/20'}`} />
                          {plan.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(plan)}
                            className="p-2 text-white/20 hover:text-primary transition-colors">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(plan._id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
