import { Hero } from '../../components/layout/Hero';
import { Services } from './Services'; 
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, ChevronDown, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

// Sub-componente FAQ Refinado para o fundo Black
const FAQItem = ({ question, answer, icon: Icon }: { question: string, answer: string, icon: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className={`group border-b border-white/5 transition-all duration-300 ${isOpen ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}
    >
      <button 
        className="w-full py-7 px-4 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <span className={`transition-colors ${isOpen ? 'text-primary' : 'text-text-main/20'}`}>
            <Icon size={20} />
          </span>
          <span className={`font-bold text-lg tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-text-main'}`}>
            {question}
          </span>
        </div>
        <ChevronDown className={`text-primary transition-transform duration-500 ${isOpen ? 'rotate-180' : 'opacity-20'}`} size={20} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-14 pb-8 text-text-main/50 text-sm leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Home = () => {
  return (
    <div className="relative bg-black overflow-x-hidden">
      {/* 1. HERO SLIDER */}
      <Hero />

      {/* 2. SERVIÇOS (GRID DE PLANOS) */}
      <div id="servicos" className="relative z-10 bg-black">
        <Services />
      </div>

      {/* 3. SEÇÃO SOBRE (ABOUT) */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full opacity-30" />
          <img 
            src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1470" 
            alt="Streaming Life"
            className="relative rounded-[3rem] border border-white/5 shadow-2xl w-full grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 text-primary font-black text-xs tracking-[0.3em] mb-4 uppercase">
            <Info size={16} /> Sobre a Elber Streaming Service
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic mb-6 leading-[0.9] uppercase tracking-tighter">
            O melhor do <span className="text-primary">Mundo</span> no seu ecrã.
          </h2>
          <p className="text-text-main/50 text-lg leading-relaxed mb-10 font-medium">
            Simplificamos o entretenimento em Moçambique. Esqueça os cartões internacionais; 
            aqui você paga com o que já usa no dia a dia e recebe acesso instantâneo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
              <h4 className="text-primary font-black text-xl italic uppercase tracking-tighter">Ativação Instantânea</h4>
              <p className="text-[10px] text-text-main/30 uppercase font-bold tracking-widest mt-1">Via WhatsApp API</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
              <h4 className="text-primary font-black text-xl italic uppercase tracking-tighter">Suporte Local</h4>
              <p className="text-[10px] text-text-main/30 uppercase font-bold tracking-widest mt-1">Disponível 24/7</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. SEÇÃO FAQ */}
      <section id="faq" className="py-32 px-6 bg-black relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Dúvidas Comuns
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
          </div>

          <div className="border-t border-white/5">
            <FAQItem 
              icon={Globe}
              question="Como recebo meus dados de acesso?" 
              answer="A entrega é automática. Após a confirmação do pagamento, os dados (email e senha) são enviados diretamente para o seu WhatsApp e ficam salvos no seu painel de cliente aqui no site." 
            />
            <FAQItem 
              icon={Smartphone}
              question="Quais são os métodos de pagamento?" 
              answer="Aceitamos pagamentos via M-Pesa, e-Mola e Transferência Bancária (BIM ou BCI). O processo é simples: você faz o envio e anexa o comprovativo ou aguarda a confirmação via sistema." 
            />
            <FAQItem 
              icon={ShieldCheck}
              question="O serviço tem garantia de funcionamento?" 
              answer="Com certeza. Todas as nossas contas possuem garantia total durante todo o período da subscrição. Se houver qualquer interrupção, a nossa equipa de suporte resolve ou substitui a conta em tempo recorde." 
            />
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-text-main/20 text-sm font-bold uppercase tracking-widest mb-4">Ainda tem dúvidas?</p>
            <a 
              href="https://wa.me/258869227783"
              className="text-primary font-black uppercase tracking-[0.2em] text-xs hover:tracking-[0.3em] transition-all"
            >
              Contactar Suporte →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};