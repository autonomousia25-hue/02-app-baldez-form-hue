import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ArrowUp, 
  History, 
  Target, 
  Users, 
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  ClipboardCheck,
  Info,
  Scale,
  Camera
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

interface Expertise {
  id: string;
  area: string;
  descricao: string;
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    missao: '',
    historia: '',
    contato_email: '',
    contato_whatsapp: ''
  });

  // Dynamic Lists
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);

  // Current Inputs
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>({
    id: '',
    nome: '',
    oab: '',
    bioCurta: '',
    obs: ''
  });

  const [currentExpertise, setCurrentExpertise] = useState<Expertise>({
    id: '',
    area: '',
    descricao: ''
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleCopyLink = () => {
    const link = 'https://02-app-baldez-form-hue.vercel.app/docs/manual_equipe.md';
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'contato_whatsapp') {
      setFormData({ ...formData, [name]: handlePhoneMask(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Specialist Handlers
  const addSpecialist = () => {
    if (!currentSpecialist.nome) return alert('Insira o nome do especialista.');
    setSpecialists([...specialists, { ...currentSpecialist, id: crypto.randomUUID() }]);
    setCurrentSpecialist({ id: '', nome: '', oab: '', bioCurta: '', obs: '' });
  };

  const removeSpecialist = (id: string) => setSpecialists(specialists.filter(s => s.id !== id));

  // Expertise Handlers
  const addExpertise = () => {
    if (!currentExpertise.area) return alert('Insira a área de atuação.');
    setExpertises([...expertises, { ...currentExpertise, id: crypto.randomUUID() }]);
    setCurrentExpertise({ id: '', area: '', descricao: '' });
  };

  const removeExpertise = (id: string) => setExpertises(expertises.filter(e => e.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (specialists.length === 0) return alert('⚠️ Adicione ao menos um especialista na equipe.');
    if (expertises.length === 0) return alert('⚠️ Adicione ao menos uma área de atuação.');
    
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        identidade: {
          missao: formData.missao,
          historia: formData.historia
        },
        areas_atuacao: expertises,
        equipe: specialists,
        contato: {
          email: formData.contato_email,
          whatsapp: formData.contato_whatsapp
        }
      };

      const { error } = await supabase
        .from('conteudo_site_solicitacoes')
        .insert([
          { 
            secao: 'geral_v5_final', 
            conteudo: payload,
            contato_solicitante: formData.contato_email || formData.contato_whatsapp
          }
        ]);

      if (error) {
        console.error('Supabase Error:', error);
        throw new Error(`Erro no Banco: ${error.message}`);
      }

      // Success Flow
      setSuccess(true);
      setFormData({ missao: '', historia: '', contato_email: '', contato_whatsapp: '' });
      setSpecialists([]);
      setExpertises([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission Error:', err);
      setErrorMsg(err.message || 'Erro de conexão.');
      alert(`Falha ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <header className="flex flex-col items-center mb-16 text-center">
          <div className="h-24 mb-6">
            <img src="/baldez-logo-desktop.png" alt="Baldez" className="h-full object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl mb-4 uppercase font-bold tracking-tight">
            Refinamento de Conteúdo <br/><span className="text-gold">BALDEZ ADVOGADOS</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-xs md:text-sm">
            Portal exclusivo para envio estruturado de atualizações do Site Web App.
          </p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex flex-col items-center gap-6 text-center mb-12 py-16">
            <div className="bg-green-500/20 p-6 rounded-full animate-pulse">
              <CheckCircle2 size={64} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">DADOS ENVIADOS COM SUCESSO!</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                Sua solicitação foi processada e já está no pipeline do Squad de Infraestrutura.
              </p>
              <button onClick={() => setSuccess(false)} className="mt-8 btn-primary !w-auto !px-10 !py-3 !text-sm">
                Realizar Novo Envio
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="glass-card border-red-500 flex items-start gap-3 text-red-400 mb-12">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold">Erro de Infraestrutura:</p>
              <p className="text-sm opacity-80">{errorMsg}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-16">
            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <History className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Identidade Baldez</h2>
              </div>
              <div className="form-group">
                <label>Missão do Escritório</label>
                <textarea name="missao" rows={3} value={formData.missao} onChange={handleChange} placeholder="Ex: Atendimento humanizado..." />
                <p className="heuristic-help"><Info size={12} /> H10: Define o tom de voz da página inicial.</p>
              </div>
              <div className="form-group">
                <label>Nossa História</label>
                <textarea name="historia" rows={5} value={formData.historia} onChange={handleChange} placeholder="Trajetória..." />
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Target className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Áreas de Atuação</h2>
              </div>

              {expertises.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expertises.map((e) => (
                    <div key={e.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-start">
                      <div>
                        <p className="text-gold font-bold text-sm uppercase tracking-widest">{e.area}</p>
                        <p className="text-xs text-slate-400 mt-1">{e.descricao}</p>
                      </div>
                      <button type="button" onClick={() => removeExpertise(e.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white/5 p-8 rounded-2xl border border-gold/20 space-y-6">
                <div className="form-group">
                  <label className="text-[10px]">Título da Área (Ex: Direito Civil)</label>
                  <input value={currentExpertise.area} onChange={(e) => setCurrentExpertise({...currentExpertise, area: e.target.value})} placeholder="Área" />
                </div>
                <div className="form-group">
                  <label className="text-[10px]">Breve Descrição</label>
                  <textarea rows={2} value={currentExpertise.descricao} onChange={(e) => setCurrentExpertise({...currentExpertise, descricao: e.target.value})} placeholder="O que fazemos nesta área..." />
                </div>
                <button type="button" onClick={addExpertise} className="w-full py-4 border-2 border-gold/40 text-gold rounded-xl font-bold hover:bg-gold hover:text-navy transition-all uppercase text-xs tracking-widest">
                  <Plus size={18} /> Inserir Área na Lista
                </button>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Users className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Equipe de Especialistas</h2>
              </div>

              {specialists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialists.map((s) => (
                    <div key={s.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">{s.nome}</p>
                        <p className="text-[10px] text-gold uppercase">{s.oab}</p>
                      </div>
                      <button type="button" onClick={() => removeSpecialist(s.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white/5 p-8 rounded-2xl border border-gold/20 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group"><label className="text-[10px]">Nome</label><input value={currentSpecialist.nome} onChange={(e) => setCurrentSpecialist({...currentSpecialist, nome: e.target.value})} placeholder="Nome" /></div>
                  <div className="form-group"><label className="text-[10px]">OAB / Cargo</label><input value={currentSpecialist.oab} onChange={(e) => setCurrentSpecialist({...currentSpecialist, oab: e.target.value})} placeholder="OAB" /></div>
                </div>
                <div className="form-group"><label className="text-[10px]">Bio Curta</label><input value={currentSpecialist.bioCurta} onChange={(e) => setCurrentSpecialist({...currentSpecialist, bioCurta: e.target.value})} placeholder="Resumo..." /></div>
                <button type="button" onClick={addSpecialist} className="w-full py-4 border-2 border-gold/40 text-gold rounded-xl font-bold hover:bg-gold hover:text-navy transition-all uppercase text-xs tracking-widest">
                  <Plus size={18} /> Inserir Advogado na Lista
                </button>
              </div>

              <div className="bg-gold/5 p-5 rounded-xl border border-gold/20 flex items-center gap-4">
                <Camera className="text-gold" size={24} />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lembre-se de enviar a foto vertical de cada especialista via WhatsApp para o Squad.
                </p>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Scale className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Contato para Validação</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="form-group"><label>E-mail</label><input name="contato_email" type="email" value={formData.contato_email} onChange={handleChange} placeholder="contato@email.com" /></div>
                <div className="form-group"><label>WhatsApp</label><input name="contato_whatsapp" type="text" value={formData.contato_whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" /></div>
              </div>
            </section>

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl">
              {loading ? <Loader2 className="animate-spin" size={28} /> : <><CheckCircle2 size={28} /> Finalizar Envio Baldez</>}
            </button>
          </form>
        )}

        <footer className="mt-20 text-center text-slate-500 text-[10px] md:text-xs py-10 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados.</p>
          <button onClick={handleCopyLink} className="mt-6 text-gold hover:text-white transition-colors flex items-center gap-2 mx-auto">
            {copied ? <ClipboardCheck size={14} /> : <Plus size={14} />} 
            {copied ? 'Link do Manual' : 'Link do Manual'}
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
