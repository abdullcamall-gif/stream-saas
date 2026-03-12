import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.password) {
      setError('Preencha todos os campos.');
      return;
    }
    setIsLoading(true);
    try {
      const fullPhone = `+258${form.phone.replace(/\D/g, '')}`;
      await login({ phone: fullPhone, password: form.password });

      // State React ainda não actualizou neste tick — lê do localStorage
      const parsed = JSON.parse(localStorage.getItem('ss_user') || '{}');
      if (parsed?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)' }} />

      {/* Grade decorativa */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo / Marca */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border border-primary/30"
            style={{ background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(0,255,255,0.05))' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" className="text-primary" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">StreamSaas</h1>
          <p className="text-white/30 text-sm mt-1">Entra na tua conta</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] p-7 relative"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>

          {/* Linha decorativa topo */}
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Número</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm font-mono">+258</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="84 000 0000"
                  autoComplete="tel"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 pl-14 pr-4 py-3.5 rounded-xl outline-none text-sm transition-all duration-200 focus:border-primary/50 focus:bg-white/[0.06]"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3.5 rounded-xl outline-none text-sm transition-all duration-200 focus:border-primary/50 focus:bg-white/[0.06] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: isLoading
                  ? 'rgba(0,255,255,0.15)'
                  : 'linear-gradient(135deg, #00ffff, #00cccc)',
                color: '#000',
                boxShadow: isLoading ? 'none' : '0 0 30px rgba(0,255,255,0.25)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  A entrar...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-white/25 text-sm mt-6">
          Não tens conta?{' '}
          <Link to="/register" className="font-bold transition-colors" style={{ color: '#00ffff' }}>
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  );
};
