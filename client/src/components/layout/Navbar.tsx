import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Menu, X, Search, History, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <nav className="fixed w-full z-50 h-20 flex items-center bg-background/20 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">

        {/* LADO ESQUERDO: Logo */}
        <Link to="/" className="flex items-center gap-2 group min-w-[200px]">
          <PlayCircle className="text-primary w-7 h-7 group-hover:rotate-12 transition-transform" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tighter text-text-main italic">ELBER</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Streaming Service</span>
          </div>
        </Link>

        {/* CENTRO: Menu */}
        <div className="hidden md:flex items-center gap-10 bg-white/5 px-8 py-2.5 rounded-full border border-white/5">
          <Link to="/" className="text-sm font-bold hover:text-primary transition-colors">Início</Link>
          <a href="#servicos" className="text-sm font-bold hover:text-primary transition-colors">Serviços</a>
          <a href="#about" className="text-sm font-bold hover:text-primary transition-colors">Sobre</a>
          <a href="#faq" className="text-sm font-bold hover:text-primary transition-colors">FAQ</a>
        </div>

        {/* LADO DIREITO */}
        <div className="hidden md:flex items-center justify-end gap-6 min-w-50">
          <button className="text-text-main/60 hover:text-primary transition-all hover:scale-110 cursor-pointer">
            <Search size={20} />
          </button>

          <Link to="/minha-conta" className="text-text-main/60 hover:text-primary transition-all hover:scale-110">
            <History size={20} />
          </Link>

          {/* Autenticado: Hey user + dropdown */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 text-primary pl-3 pr-2 h-10 rounded-full hover:bg-primary/20 transition-all"
              >
                <span className="text-xs font-black">Hey, {firstName}</span>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={13} />
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl border border-white/8 overflow-hidden shadow-2xl"
                  style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)' }}>

                  {/* Linha topo */}
                  <div className="h-px mx-4"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.3), transparent)' }} />

                  <div className="p-2 space-y-0.5">
                    {/* Nome */}
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs text-white/30 font-medium">Sessão activa</p>
                      <p className="text-sm font-black text-white truncate">{user?.name}</p>
                    </div>

                    <div className="h-px bg-white/[0.05] mx-1 mb-1" />

                    {/* Minha conta */}
                    <Link
                      to="/minha-conta"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/6 transition-all text-sm font-medium"
                    >
                      <History size={15} />
                      Minha Conta
                    </Link>

                    {/* Admin — só aparece se for admin */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
                      >
                        <LayoutDashboard size={15} />
                        Painel Admin
                      </Link>
                    )}

                    <div className="h-px bg-white/[0.05] mx-1 my-1" />

                    {/* Sair */}
                    <button
                      onClick={() => { setShowDropdown(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08] transition-all text-sm font-bold"
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Não autenticado: botão Login */
            <Link
              to="/login"
              className="flex items-center justify-center bg-primary/10 border border-primary/20 text-primary w-10 h-10 rounded-full hover:bg-primary hover:text-background transition-all"
              title="Entrar"
            >
              <User size={20} />
            </Link>
          )}
        </div>

        {/* MOBILE: Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-surface/95 backdrop-blur-2xl border-b border-primary/10 p-8 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-5 duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-bold border-b border-white/5 pb-2">Início</Link>
          <a href="#servicos" onClick={() => setIsOpen(false)} className="text-lg font-bold border-b border-white/5 pb-2">Serviços</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="text-lg font-bold border-b border-white/5 pb-2">Sobre</a>
          <a href="#faq" onClick={() => setIsOpen(false)} className="text-lg font-bold border-b border-white/5 pb-2">FAQ</a>

          <div className="flex items-center gap-8 mt-4">
            <button className="flex items-center gap-2 text-primary font-bold"><Search size={20} /> Buscar</button>
            <Link to="/minha-conta" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-primary font-bold"><History size={20} /> Histórico</Link>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3 mt-2">
              {/* Saudação mobile */}
              <p className="text-white/40 text-sm font-medium">Hey, <span className="text-primary font-black">{firstName}</span> 👋</p>

              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 bg-white/5 text-white text-center py-3.5 px-4 rounded-2xl font-bold text-sm">
                  <LayoutDashboard size={16} /> Painel Admin
                </Link>
              )}

              <button
                onClick={() => { setIsOpen(false); logout(); }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)}
              className="bg-primary text-background text-center py-4 rounded-2xl font-black uppercase tracking-widest mt-4">
              ENTRAR NO PERFIL
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
