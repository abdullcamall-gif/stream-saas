import { useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Smartphone, Upload, CheckCircle, X, FileImage, Building2 } from 'lucide-react';
import api from '../../lib/api';

// ← Substitui pelos teus dados reais
const PAYMENT_INFO: Record<string, { label: string; number: string; detail: string; type: 'mobile' | 'bank' }> = {
  mpesa:     { label: 'M-Pesa',          number: '84 123 4567',         detail: 'Número M-Pesa',       type: 'mobile' },
  emola:     { label: 'e-Mola',          number: '87 765 4321',         detail: 'Número e-Mola',       type: 'mobile' },
  bci:       { label: 'BCI',             number: '0001 0000 12345678 9', detail: 'NIB BCI',             type: 'bank'   },
  millenium: { label: 'Millennium BIM',  number: '0002 0000 98765432 1', detail: 'NIB Millennium BIM',  type: 'bank'   },
};

type PaymentMethodKey = keyof typeof PAYMENT_INFO;
type Step = 'form' | 'payment' | 'upload' | 'success';

export const Checkout = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const price = searchParams.get('price');
  const period = searchParams.get('period');
  const planName = searchParams.get('name') || `${planId} Premium`;

  const [step, setStep] = useState<Step>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>('mpesa');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = PAYMENT_INFO[paymentMethod].type === 'mobile';

  // ----- Step 1: Criar pedido -----
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMobile && !phone) { setError('Insere o teu número de telefone.'); return; }
    if (isMobile && phone.replace(/\D/g, '').length < 9) { setError('Número inválido.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const res = await api.post<{ data: { order: any } }>('/orders', {
        planId,
        paymentMethod,
        paymentPhone: isMobile ? `+258${phone.replace(/\D/g, '')}` : '+258000000000',
      });
      setOrderId(res.data.data!.order._id);
      setOrderNumber(res.data.data!.order.orderNumber);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_INFO[paymentMethod].number.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) { setError('Seleciona o comprovante de pagamento.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      await api.post(`/orders/${orderId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar comprovante.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">

        {step !== 'success' && (
          <button
            onClick={() => step === 'form' ? navigate(-1) : setStep(step === 'upload' ? 'payment' : 'form')}
            className="flex items-center gap-2 text-text-main/40 hover:text-primary mb-8 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft size={18} />
            {step === 'form' ? 'Voltar aos planos' : 'Voltar'}
          </button>
        )}

        {/* Progresso */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 mb-10">
            {(['form', 'payment', 'upload'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step === s ? 'bg-primary text-black' :
                  ['form','payment','upload'].indexOf(step) > i ? 'bg-primary/20 text-primary' :
                  'bg-white/5 text-white/20'
                }`}>{i + 1}</div>
                {i < 2 && <div className={`h-px w-8 transition-all duration-300 ${
                  ['form','payment','upload'].indexOf(step) > i ? 'bg-primary/40' : 'bg-white/10'
                }`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-white/30 font-medium">
              {step === 'form' ? 'Método de pagamento' : step === 'payment' ? 'Efectuar pagamento' : 'Enviar comprovante'}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ===== STEP 1: FORMULÁRIO ===== */}
          {step === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    {isMobile ? <Smartphone size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase italic leading-none">Forma de Pagamento</h2>
                    <p className="text-[10px] text-text-main/40 font-bold uppercase tracking-widest mt-1">
                      Mobile Money ou Transferência Bancária
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">

                  {/* Método — 2x2 grid */}
                  <div>
                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">
                      Método de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(PAYMENT_INFO) as PaymentMethodKey[]).map(m => (
                        <button key={m} type="button"
                          onClick={() => { setPaymentMethod(m); setPhone(''); setError(''); }}
                          className={`py-3.5 px-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                            paymentMethod === m
                              ? 'bg-primary/10 border-primary/40 text-primary'
                              : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                          }`}
                        >
                          {PAYMENT_INFO[m].type === 'bank'
                            ? <Building2 size={13} />
                            : <Smartphone size={13} />
                          }
                          {PAYMENT_INFO[m].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campo telefone — só para mobile money */}
                  {isMobile && (
                    <div>
                      <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 ml-1">
                        Número de Telefone
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25 font-mono text-sm">+258</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => { setPhone(e.target.value); setError(''); }}
                          placeholder="84 000 0000"
                          className="w-full bg-background/50 border border-white/10 pl-16 pr-5 py-5 rounded-2xl outline-none focus:border-primary/50 transition-all text-lg font-bold tracking-widest font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Info banco */}
                  {!isMobile && (
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-sm text-white/50 leading-relaxed">
                      Após clicar em continuar, vais ver o NIB e os dados para efectuar a transferência bancária.
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <X size={14} className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-xs">{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-background font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 text-lg uppercase tracking-widest disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        A processar...
                      </span>
                    ) : `Continuar → Pagar ${price}`}
                  </button>
                </form>
              </div>

              <OrderSummary planName={planName} price={price} period={period} />
            </motion.div>
          )}

          {/* ===== STEP 2: INSTRUÇÃO DE PAGAMENTO ===== */}
          {step === 'payment' && (
            <motion.div key="payment"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <h2 className="text-xl font-black uppercase italic mb-2">Efectua o Pagamento</h2>
                <p className="text-white/40 text-sm mb-8">
                  {isMobile
                    ? `Transfere o valor para o número abaixo via ${PAYMENT_INFO[paymentMethod].label}:`
                    : `Efectua uma transferência bancária para os dados abaixo (${PAYMENT_INFO[paymentMethod].label}):`
                  }
                </p>

                {/* Número / NIB */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                    {PAYMENT_INFO[paymentMethod].detail}
                  </p>
                  <p className={`font-black tracking-widest text-primary font-mono mb-4 ${isMobile ? 'text-4xl' : 'text-2xl'}`}>
                    {PAYMENT_INFO[paymentMethod].number}
                  </p>
                  <button onClick={copyNumber}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border ${
                      copied ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {copied ? '✓ Copiado!' : isMobile ? 'Copiar número' : 'Copiar NIB'}
                  </button>
                </div>

                {/* Valor */}
                <div className="flex justify-between items-center bg-white/[0.03] rounded-2xl p-4 mb-4 border border-white/5">
                  <span className="text-white/40 text-sm font-medium">Valor a transferir</span>
                  <span className="text-2xl font-black text-primary italic">{price}</span>
                </div>

                {/* Referência */}
                <div className="bg-white/[0.03] rounded-2xl p-4 mb-8 border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Referência do pedido</p>
                  <p className="font-mono font-bold text-white/60">{orderNumber}</p>
                </div>

                <button onClick={() => setStep('upload')}
                  className="w-full bg-primary hover:bg-primary-hover text-background font-black py-5 rounded-2xl transition-all text-sm uppercase tracking-widest"
                >
                  Já paguei → Enviar Comprovante
                </button>
              </div>

              <OrderSummary planName={planName} price={price} period={period} />
            </motion.div>
          )}

          {/* ===== STEP 3: UPLOAD COMPROVANTE ===== */}
          {step === 'upload' && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div className="bg-surface/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase italic leading-none">Comprovante</h2>
                    <p className="text-[10px] text-text-main/40 font-bold uppercase tracking-widest mt-1">JPG, PNG ou PDF · Máx 5MB</p>
                  </div>
                </div>

                <form onSubmit={handleUploadProof} className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      proofFile
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {proofPreview ? (
                      <div className="space-y-3">
                        <img src={proofPreview} alt="Comprovante" className="max-h-40 mx-auto rounded-xl object-contain" />
                        <p className="text-xs text-primary font-bold">{proofFile?.name}</p>
                        <p className="text-[10px] text-white/30">Clica para trocar</p>
                      </div>
                    ) : proofFile ? (
                      <div className="space-y-3">
                        <FileImage size={40} className="mx-auto text-primary" />
                        <p className="text-xs text-primary font-bold">{proofFile.name}</p>
                        <p className="text-[10px] text-white/30">Clica para trocar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload size={32} className="mx-auto text-white/20" />
                        <p className="text-sm font-bold text-white/40">Clica para selecionar o comprovante</p>
                        <p className="text-[10px] text-white/20">Screenshot ou PDF do pagamento</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <X size={14} className="text-red-400 shrink-0" />
                      <span className="text-red-400 text-xs">{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading || !proofFile}
                    className="w-full bg-primary hover:bg-primary-hover text-background font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        A enviar...
                      </span>
                    ) : 'Enviar Comprovante'}
                  </button>
                </form>
              </div>

              <OrderSummary planName={planName} price={price} period={period} />
            </motion.div>
          )}

          {/* ===== STEP 4: SUCESSO ===== */}
          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6"
                style={{ boxShadow: '0 0 40px rgba(0,255,255,0.15)' }}>
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h2 className="text-3xl font-black italic mb-3">Comprovante Enviado!</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-2">
                O teu pedido <span className="text-white/60 font-mono font-bold">{orderNumber}</span> está a ser verificado.
              </p>
              <p className="text-white/30 text-sm mb-10">
                Assim que o admin confirmar o pagamento, as credenciais ficarão disponíveis na tua conta.
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/minha-conta')}
                  className="w-full bg-primary text-background font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
                >
                  Ver Minha Conta
                </button>
                <button onClick={() => navigate('/')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-bold py-4 rounded-2xl transition-all text-sm"
                >
                  Voltar ao Início
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

const OrderSummary = ({ planName, price, period }: { planName: string; price: string | null; period: string | null }) => (
  <div className="space-y-6">
    <div className="bg-surface/20 p-8 rounded-[2.5rem] border border-white/5">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-main/40 mb-6">Resumo da Assinatura</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{planName}</span>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase italic">{period}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-text-main/60">
          <span>Subtotal</span><span>{price}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-text-main/60">
          <span>Taxa de Ativação</span>
          <span className="text-green-400">Grátis</span>
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="font-black uppercase tracking-widest text-xs text-primary">Total a Pagar</span>
          <span className="text-3xl font-black italic text-primary">{price}</span>
        </div>
      </div>
    </div>
    <div className="flex items-start gap-4 p-6 bg-white/5 rounded-3xl border border-white/5">
      <ShieldCheck className="text-primary shrink-0" size={20} />
      <div>
        <p className="text-xs font-bold uppercase mb-1">Compra Protegida</p>
        <p className="text-[10px] text-text-main/40 leading-relaxed font-medium">
          Após verificação do comprovante pelo admin, as credenciais ficam disponíveis na tua conta em minutos.
        </p>
      </div>
    </div>
  </div>
);
