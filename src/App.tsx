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
  ClipboardCheck,
  Info
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
    if (specialists.length === 0) {
      alert('⚠️ Adicione ao menos um especialista na lista antes de enviar.');
      return;
    }
    
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
            secao: 'geral_v4', 
            conteudo: payload,
            contato_solicitante: formData.contato_email || formData.contato_whatsapp
          }
        ]);

      if (error) throw error;
      setSuccess(true);
      setFormData({ missao: '', historia: '', especialidades: '', depoimento: '', contato_email: '', contato_whatsapp: '' });
      setSpecialists([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erro ao enviar:', err);
      setErrorMsg(err.message || 'Falha de conexão com o Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <header className="flex flex-col items-center mb-16 text-center" style={{ minHeight: '220px' }}>
          <div className="h-24 mb-6 flex items-center justify-center">
            <img 
              src="/baldez-logo-desktop.png" 
              alt="Baldez Advogados" 
              className="h-full object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl mb-4 uppercase font-bold tracking-tight">
            Refinamento de Conteúdo <br/><span className="text-gold">PARA FINALIZAÇÃO DO SITE</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-xs md:text-sm leading-relaxed">
            Portal exclusivo para a equipe Baldez Advogados Associados. <br/>
            Envie atualizações estruturadas para o **PROJETO DO SITE WEB APP**.
          </p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex flex-col items-center gap-4 text-center mb-12 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={48} className="text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">ENVIADO COM SUCESSO!</h3>
              <p className="text-slate-300">Os dados foram recebidos pelo Squad Agêntico e serão processados em breve.</p>
              <button onClick={() => setSuccess(false)} className="mt-6 text-gold underline text-sm">Enviar nova atualização</button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="glass-card border-red-500 flex items-start gap-3 text-red-400 mb-12">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold">Erro técnico detectado:</p>
              <p className="text-sm opacity-80">{errorMsg}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-16">
            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <History className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Identidade e Trajetória</h2>
              </div>
              
              <div className="form-group">
                <label>Missão do Escritório</label>
                <textarea 
                  name="missao" 
                  rows={3} 
                  value={formData.missao} 
                  onChange={handleChange} 
                  placeholder="Ex: Proporcionar soluções jurídicas com excelência..." 
                />
                <p className="heuristic-help">
                  <Info size={12} /> H10: Ajuda na tomada de decisão - Este texto aparecerá logo abaixo da Hero do site.
                </p>
              </div>

              <div className="form-group">
                <label>Nossa História</label>
                <textarea 
                  name="historia" 
                  rows={5} 
                  value={formData.historia} 
                  onChange={handleChange} 
                  placeholder="Conte sobre a fundação e marcos..." 
                />
                <p className="heuristic-help">
                  <Info size={12} /> H2: Correspondência com o mundo real - Utilize linguagem profissional.
                </p>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Target className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Áreas de Atuação</h2>
              </div>
              <div className="form-group">
                <label>Especialidades (Área: Descrição)</label>
                <textarea 
                  name="especialidades" 
                  rows={4} 
                  value={formData.especialidades} 
                  onChange={handleChange} 
                  placeholder="Ex: Direito Civil: Atuação em contratos..." 
                />
                <p className="heuristic-help">
                  <Info size={12} /> H4: Consistência - Mantenha o padrão de dois pontos (:) para separar títulos.
                </p>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Users className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Equipe Baldez</h2>
              </div>

              {specialists.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest opacity-60">Membros na Lista:</p>
                  {specialists.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                      <div>
                        <p className="font-bold text-white">{s.nome}</p>
                        <p className="text-xs text-slate-400">{s.oab}</p>
                      </div>
                      <button type="button" onClick={() => removeSpecialist(s.id)} className="text-red-400 hover:text-red-300 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white/5 p-8 rounded-2xl border border-gold/20 shadow-inner space-y-6">
                <p className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                  <Plus size={16} /> Preencher Especialista
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="text-[10px]">Nome Completo</label>
                    <input name="nome" value={currentSpecialist.nome} onChange={handleSpecialistChange} placeholder="Nome" />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px]">OAB / Cargo</label>
                    <input name="oab" value={currentSpecialist.oab} onChange={handleSpecialistChange} placeholder="OAB" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-[10px]">Bio Curta (Para o Card)</label>
                  <input name="bioCurta" value={currentSpecialist.bioCurta} onChange={handleSpecialistChange} placeholder="Resumo profissional..." />
                </div>
                <div className="form-group">
                  <label className="text-[10px]">Observações Extras (Opcional)</label>
                  <input name="obs" value={currentSpecialist.obs} onChange={handleSpecialistChange} placeholder="Premiações, etc..." />
                </div>
                <button 
                  type="button" 
                  onClick={addSpecialist}
                  className="w-full py-4 border-2 border-gold/40 text-gold rounded-xl font-bold hover:bg-gold hover:text-navy transition-all uppercase text-sm tracking-widest"
                >
                  <Plus size={20} /> Inserir Especialista na Lista
                </button>
              </div>

              <div className="bg-gold/5 p-5 rounded-xl border border-gold/20 flex items-center gap-4">
                <ImageIcon className="text-gold" size={24} />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lembre-se de enviar a foto vertical de cada especialista via WhatsApp para o Squad.
                </p>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Award className="text-gold" size={28} />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Depoimentos & Contato</h2>
              </div>
              <div className="form-group">
                <label>Novos Depoimentos</label>
                <textarea name="depoimento" rows={3} value={formData.depoimento} onChange={handleChange} placeholder="Nome: 'Texto'..." />
              </div>
              <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-10">
                <div className="form-group">
                  <label>E-mail para Retorno</label>
                  <input name="contato_email" type="email" value={formData.contato_email} onChange={handleChange} placeholder="contato@email.com" />
                </div>
                <div className="form-group">
                  <label>WhatsApp para Retorno</label>
                  <input name="contato_whatsapp" type="text" value={formData.contato_whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" />
                </div>
              </div>
            </section>

            <div className="space-y-6">
              {specialists.length === 0 && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-bold animate-pulse">
                  <AlertCircle size={18} />
                  <span>ADICIONE AO MENOS UM ESPECIALISTA ANTES DE ENVIAR</span>
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading || specialists.length === 0}
                className={`btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl transition-all ${specialists.length === 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
              >
                {loading ? <Loader2 className="animate-spin" size={28} /> : <><CheckCircle2 size={28} /> Finalizar e Enviar para o Squad</>}
              </button>
            </div>
          </form>
        )}

        <footer className="mt-20 text-center text-slate-500 text-[10px] md:text-xs py-10 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados.</p>
          <button 
            onClick={handleCopyLink}
            className="mt-6 text-gold hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            {copied ? <ClipboardCheck size={14} /> : <Plus size={14} />} 
            {copied ? 'Link Copiado!' : 'Link do Manual da Equipe'}
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
