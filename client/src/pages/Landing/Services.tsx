import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

// Logos por nome do serviço
const SERVICE_LOGOS: Record<string, { logo: string; color: string }> = {
  netflix:     { logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', color: '#E50914' },
  spotify:     { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/1280px-Spotify_logo_with_text.svg.png', color: '#1DB954' },
  'prime video': { logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg', color: '#00A8E1' },
  'disney+':   { logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color: '#006E99' },
  'hbo max':   { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/HBO_Max_2024.svg/640px-HBO_Max_2024.svg.png', color: '#5822B4' },
  crunchyroll: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Crunchyroll_logo_2024.png/1280px-Crunchyroll_logo_2024.png', color: '#F47521' },
};

const getLogo = (name: string) => {
  const key = name.toLowerCase();
  return SERVICE_LOGOS[key] || { logo: '', color: '#00ffff' };
};

// Agrupa planos por serviço
const groupByService = (plans: any[]) => {
  const map: Record<string, { service: string; plans: any[] }> = {};
  for (const plan of plans) {
    const key = plan.service.toLowerCase();
    if (!map[key]) map[key] = { service: plan.service, plans: [] };
    map[key].plans.push(plan);
  }
  return Object.values(map);
};

const ServiceCard = ({ service, plans }: { service: string; plans: any[] }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const { logo } = getLogo(service);

  const handleSubscribe = () => {
    const plan = plans[selectedIdx];
    // ← Passa o _id real do MongoDB
    navigate(`/checkout/${plan._id}?price=${plan.price}MT&period=${plan.duration}&name=${encodeURIComponent(plan.name)}`);
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative group bg-surface/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all" />

      <div className="h-10 mb-8 flex items-center">
        {logo
          ? <img src={logo} alt={service} className="h-full object-contain filter brightness-125 group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-xl font-black text-primary italic">{service}</span>
        }
      </div>

      {/* Tabs de período */}
      <div className="flex bg-background/60 p-1.5 rounded-2xl mb-8 border border-white/5">
        {plans.map((plan: any, idx: number) => (
          <button
            key={plan._id}
            onClick={() => setSelectedIdx(idx)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              selectedIdx === idx
                ? 'bg-primary text-background shadow-lg'
                : 'text-text-main/40 hover:text-text-main'
            }`}
          >
            {plan.duration}
          </button>
        ))}
      </div>

      {/* Preço */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-text-main/30 uppercase tracking-[0.2em] mb-1">Preço com desconto</p>
        <div className="flex items-end gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={selectedIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-4xl font-black text-primary italic"
            >
              {plans[selectedIdx].price}MT
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <ul className="space-y-4 mb-10">
        {[
          { icon: <Zap size={14} />, text: 'Entrega Instantânea' },
          { icon: <ShieldCheck size={14} />, text: 'Garantia Elber MZ' },
          { icon: <CheckCircle2 size={14} />, text: 'Qualidade 4K Ultra HD' },
        ].map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 text-xs font-semibold text-text-main/60">
            <span className="text-primary/60">{item.icon}</span>
            {item.text}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-background transition-all shadow-xl hover:shadow-primary/20"
      >
        Assinar Agora
      </button>

      {selectedIdx === plans.length - 1 && plans.length > 1 && (
        <div className="absolute top-6 right-6 bg-primary/20 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/30 uppercase tracking-tighter animate-pulse">
          Melhor Valor
        </div>
      )}
    </motion.div>
  );
};

export const Services = () => {
  const [groups, setGroups] = useState<{ service: string; plans: any[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/plans')
      .then(res => {
        const plans = res.data.data?.plans || res.data.data || [];
        setGroups(groupByService(plans));
      })
      .catch(() => setError('Não foi possível carregar os planos.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="servicos" className="py-32 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            ⚡ Planos Flexíveis
          </div>
          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Nossos <span className="text-primary">Serviços</span>
          </h2>
          <p className="text-text-main/40 mt-6 text-lg font-medium">
            Escolha o plano ideal para você e receba seus dados de acesso automaticamente no WhatsApp.
            Sem complicação, sem cartão internacional.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-primary font-black text-2xl italic">M-PESA / E-MOLA</p>
          <p className="text-text-main/20 text-[10px] uppercase font-bold tracking-[0.3em]">Pagamento Facilitado</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <svg className="animate-spin" style={{ color: '#00ffff' }} width="32" height="32"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}

      {/* Erro */}
      {error && !isLoading && (
        <p className="text-center text-red-400 py-10">{error}</p>
      )}

      {/* Grid de cards */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {groups.map((g, i) => (
            <ServiceCard key={i} service={g.service} plans={g.plans} />
          ))}
        </div>
      )}
    </section>
  );
};
