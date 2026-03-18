import { PlayCircle, Instagram, Facebook, Twitter, MessageCircle, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Efeito de iluminação de fundo no rodapé */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUNA 1: Brand & Bio */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <PlayCircle className="text-primary w-8 h-8 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-text-main italic uppercase">ELBER</span>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Streaming Service</span>
              </div>
            </Link>
            <p className="text-text-main/50 text-sm leading-relaxed">
              A maior plataforma de revenda de streaming em Moçambique. Conectamos você ao melhor do entretenimento mundial de forma rápida, segura e acessível.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/20 hover:text-primary transition-all border border-white/5"><Instagram size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/20 hover:text-primary transition-all border border-white/5"><Facebook size={18} /></a>
              <a href="#" className="p-2 rounded-lg bg-surface hover:bg-primary/20 hover:text-primary transition-all border border-white/5"><Twitter size={18} /></a>
            </div>
          </div>

          {/* COLUNA 2: Navegação Rápida */}
          <div>
            <h4 className="text-text-main font-black italic mb-6 uppercase tracking-widest text-sm">Navegação</h4>
            <ul className="space-y-4 text-sm text-text-main/50 font-medium">
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">Início</Link></li>
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços Disponíveis</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">Quem Somos</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">Central de Ajuda (FAQ)</a></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors opacity-30">Admin Login</Link></li>
            </ul>
          </div>

          {/* COLUNA 3: Contatos & Suporte */}
          <div>
            <h4 className="text-text-main font-black italic mb-6 uppercase tracking-widest text-sm">Suporte</h4>
            <ul className="space-y-4 text-sm text-text-main/50">
              <li className="flex items-center gap-3">
                <div className="text-primary"><MessageCircle size={18} /></div>
                <span>+258 87 922 7783</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-primary"><Mail size={18} /></div>
                <span>suporte@elberstreaming.co.mz</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-primary"><MapPin size={18} /></div>
                <span>Maputo, Moçambique</span>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: Pagamentos */}
          <div className="bg-surface/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <h4 className="text-text-main font-black italic mb-4 uppercase tracking-widest text-xs">Pagamento Seguro</h4>
            <p className="text-[10px] text-text-main/40 mb-6 font-bold uppercase tracking-tighter">Aceitamos pagamentos via Carteira Móvel</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-xl border border-white/5 grayscale hover:grayscale-0 transition-all cursor-default">
                <span className="text-xs font-black text-red-600">M-PESA</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-xl border border-white/5 grayscale hover:grayscale-0 transition-all cursor-default">
                <span className="text-xs font-black text-orange-500">e-Mola</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-primary font-bold">
              <ExternalLink size={12} />
              NexusDev
            </div>
          </div>

        </div>

        {/* BARRA DE DIREITOS */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold text-text-main/30 uppercase tracking-[0.2em]">
          <p>© 2026 ELBER Streaming Service. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};