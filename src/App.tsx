import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ArrowUp, 
  History, 
  Target, 
  Users, 
  Award, 
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './index.css';

interface Specialist {
  id: string;
  nome: string;
  oab: string;
  bioCurta: string;
  obs: string;
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    missao: '',
    historia: '',
    especialidades: '',
    depoimento: '',
    contato_email: '',
    contato_whatsapp: ''
  });

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
    nome: '',
    oab: '',
    bioCurta: '',
    obs: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://02-app-baldez-form-hue.vercel.app/docs/manual_equipe.md');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'contato_whatsapp') {
      setFormData({ ...formData, [name]: handlePhoneMask(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecialistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentSpecialist({ ...currentSpecialist, [e.target.name]: e.target.value });
  };

  const addSpecialist = () => {
    if (!currentSpecialist.nome) {
      alert('Por favor, insira ao menos o nome do especialista.');
      return;
    }
    setSpecialists([...specialists, currentSpecialist]);
    setCurrentSpecialist({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
      nome: '',
      oab: '',
      bioCurta: '',
      obs: ''
    });
  };

  const removeSpecialist = (id: string) => {
    setSpecialists(specialists.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (specialists.length === 0) return;
    
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        ...formData,
        equipe: specialists
      };

      const { error } = await supabase
        .from('conteudo_site_solicitacoes')
        .insert([
          { 
            secao: 'geral_v3', 
            conteudo: payload,
            contato_solicitante: formData.contato_email || formData.contato_whatsapp
          }
        ]);

      if (error) throw error;
      setSuccess(true);
      setFormData({ missao: '', historia: '', especialidades: '', depoimento: '', contato_email: '', contato_whatsapp: '' });
      setSpecialists([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      console.error('Erro ao enviar:', err);
      setErrorMsg(err.message || 'Erro de conexão com o banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <header className="flex flex-col items-center mb-16 text-center" style={{ minHeight: '280px' }}>
          <div className="h-24 mb-6 flex items-center justify-center overflow-hidden">
            <img 
              src="/baldez-logo-desktop.png" 
              alt="Baldez Advogados" 
              className="h-full object-contain transition-all duration-500 hover:scale-105"
            />
          </div>
          <h1 className="text-3xl md:text-5xl mb-4 leading-tight uppercase font-bold tracking-tight">
            Refinamento de Conteúdo <br/><span className="text-gold">PARA FINALIZAÇÃO DO SITE</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Portal exclusivo para a equipe Baldez Advogados Associados. <br className="hidden md:block"/>
            Envie as atualizações estruturadas para o **PROJETO DO SITE WEB APP**.
          </p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex items-center gap-3 text-green-400 mb-8 animate-bounce shadow-2xl shadow-green-500/20">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">Protocolo de envio confirmado!</p>
              <p className="text-sm">Os dados foram integrados ao pipeline do Squad.</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="glass-card border-red-500 flex items-start gap-3 text-red-400 mb-8 shadow-2xl shadow-red-500/20">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold">Falha na Submissão:</p>
              <p className="text-sm opacity-80">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <History className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Identidade e Trajetória</h2>
            </div>
            <div className="form-group">
              <label>Missão e Valores</label>
              <textarea name="missao" rows={3} value={formData.missao} onChange={handleChange} placeholder="Missão do escritório..." />
            </div>
            <div className="form-group">
              <label>História Baldez</label>
              <textarea name="historia" rows={5} value={formData.historia} onChange={handleChange} placeholder="Trajetória e marcos..." />
            </div>
          </section>

          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Áreas de Atuação</h2>
            </div>
            <div className="form-group">
              <label>Especialidades (Formato: Área: Descrição)</label>
              <textarea name="especialidades" rows={4} value={formData.especialidades} onChange={handleChange} placeholder="Ex: Direito do Trabalho: Defesa de direitos..." />
            </div>
          </section>

          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Equipe Baldez</h2>
            </div>

            {specialists.length > 0 && (
              <div className="mb-8 space-y-3">
                <p className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/20 pb-2">Membros Inseridos:</p>
                {specialists.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                    <div>
                      <p className="font-bold text-white">{s.nome}</p>
                      <p className="text-xs text-slate-400 uppercase">{s.oab}</p>
                    </div>
                    <button type="button" onClick={() => removeSpecialist(s.id)} className="text-red-400 hover:text-red-300 transition-colors p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 p-6 rounded-xl border border-gold/20 mb-8 shadow-inner">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="form-group">
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Nome</label>
                  <input name="nome" value={currentSpecialist.nome} onChange={handleSpecialistChange} placeholder="Nome" />
                </div>
                <div className="form-group">
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">OAB / Cargo</label>
                  <input name="oab" value={currentSpecialist.oab} onChange={handleSpecialistChange} placeholder="OAB" />
                </div>
              </div>
              <div className="form-group mb-6">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Bio Curta</label>
                <input name="bioCurta" value={currentSpecialist.bioCurta} onChange={handleSpecialistChange} placeholder="Resumo..." />
              </div>
              <div className="form-group mb-6">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Observações (Opcional)</label>
                <input name="obs" value={currentSpecialist.obs} onChange={handleSpecialistChange} placeholder="Premiações ou detalhes extras..." />
              </div>
              <button 
                type="button" 
                onClick={addSpecialist}
                className="w-full py-3 border-2 border-gold/40 text-gold rounded-lg font-bold hover:bg-gold hover:text-navy transition-all uppercase text-sm tracking-widest"
              >
                <Plus size={20} /> Adicionar à Lista
              </button>
            </div>

            <div className="bg-gold/5 p-5 rounded-lg border border-gold/20 flex items-start gap-4">
              <ImageIcon className="text-gold shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold uppercase mb-1 text-gold">Imagens Profissionais</p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  H6: Lembre-se de enviar as fotos (PNG) via WhatsApp para o Squad.
                </p>
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Award className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Depoimentos & Contato</h2>
            </div>
            <div className="form-group">
              <label>Depoimentos</label>
              <textarea name="depoimento" rows={3} value={formData.depoimento} onChange={handleChange} placeholder="Depoimentos..." />
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-10 border-t border-white/5 pt-8">
              <input name="contato_email" type="email" value={formData.contato_email} onChange={handleChange} placeholder="E-mail" />
              <input name="contato_whatsapp" type="text" value={formData.contato_whatsapp} onChange={handleChange} placeholder="WhatsApp" />
            </div>
          </section>

          <div className="space-y-4">
            {specialists.length === 0 && (
              <p className="text-center text-xs text-red-400 animate-pulse">
                ⚠️ É obrigatório inserir ao menos um especialista na equipe antes de enviar.
              </p>
            )}
            <button 
              type="submit" 
              disabled={loading || specialists.length === 0}
              className={`btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl transition-all ${specialists.length === 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'shadow-gold/10'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <><CheckCircle2 size={28} /> Finalizar e Enviar para o Squad</>}
            </button>
          </div>
        </form>

        <footer className="mt-20 text-center text-slate-500 text-[10px] md:text-xs py-10 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados.</p>
          <button 
            onClick={handleCopyLink}
            className="mt-4 text-gold hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            {copied ? <ClipboardCheck size={14} /> : <Plus size={14} />} 
            {copied ? 'Link Copiado!' : 'Copiar Link do Manual'}
          </button>
        </footer>
      </main>

      <div className="floating-container">
        {showTopButton && <button onClick={scrollToTop} className="fab fab-top"><ArrowUp size={24} /></button>}
        <a href="https://wa.me/5512996088349" className="fab fab-whatsapp" target="_blank" rel="noopener noreferrer"><MessageCircle size={28} /></a>
      </div>
    </div>
  );
}

export default App;
