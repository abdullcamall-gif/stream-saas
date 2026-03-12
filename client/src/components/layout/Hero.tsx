import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const slides = [
  {
    image: 'https://marketeer.b-cdn.net/wp-content/uploads/2026/01/Disney-1.jpg',
    title: 'Netflix Premium',
    desc: 'Contas exclusivas em 4K Ultra HD. Entrega imediata via M-Pesa.'
  },
  {
    image: 'https://www.sidify.fr/images/guide/spotify-decouverte.jpg',
    title: 'Spotify Family',
    desc: 'Sua música sem anúncios e offline. Ativação direta no seu email.'
  },
  {
    image: 'https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/19369474/Screen_Shot_2019_11_12_at_7.27.13_AM.png?w=1600&h=900&fit=crop',
    title: 'Disney+ / Prime',
    desc: 'O melhor do cinema na sua casa. Planos mensais acessíveis.'
  }
];

export const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden px-4 md:px-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-4 md:inset-10 rounded-[3rem] overflow-hidden z-0"
        >
          {/* Overlay Escuro para leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
          <img src={slides[index].image} className="w-full h-full object-cover" alt="Slide" />
        </motion.div>
      </AnimatePresence>

      {/* Conteúdo do Texto */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col items-start px-12">
        <motion.div
          key={`text-${index}`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="max-w-xl"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight uppercase tracking-tighter">
            {slides[index].title.split(' ')[0]} <br />
            <span className="text-primary italic">{slides[index].title.split(' ')[1]}</span>
          </h1>
          <p className="text-lg text-textMain/80 mb-8">{slides[index].desc}</p>
          <div className="flex gap-4">
            <button className="bg-primary text-background font-black py-4 px-10 rounded-2xl hover:bg-primaryHover transition-all shadow-xl shadow-primary/20">
              ASSINAR AGORA
            </button>
            {/* Botão WhatsApp */}
            <a 
              href="https://wa.me/258878107200?text=Olá! Gostaria de saber mais sobre os planos de streaming."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white font-bold py-4 px-6 rounded-2xl transition-all"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};