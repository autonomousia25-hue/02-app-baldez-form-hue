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
  Camera,
  FileText
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './index.css';

interface Specialist {
  id: string;
  nome: string;
  cargo: string;
  oab: string;
  bio: string;
  perfilCompleto: string;
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

  // Current Inputs (PO Aligned)
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>({
    id: '',
    nome: '',
    cargo: '',
    oab: '',
    bio: '',
    perfilCompleto: ''
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
    if (!currentSpecialist.nome || !currentSpecialist.cargo) return alert('Insira Nome e Cargo do especialista.');
    setSpecialists([...specialists, { ...currentSpecialist, id: crypto.randomUUID() }]);
    setCurrentSpecialist({ id: '', nome: '', cargo: '', oab: '', bio: '', perfilCompleto: '' });
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
    
    if (specialists.length === 0) return alert('⚠️ Adicione ao menos um especialista.');
    if (expertises.length === 0) return alert('⚠️ Adicione ao menos uma área de atuação.');
    
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        versao_schema: '6.0_PO_ALIGNED',
        identidade: {
          missao: formData.missao,
          historia: formData.historia
        },
        areas_atuacao: expertises,
        equipe: specialists, // Já segue o padrão nome, cargo, oab, bio, perfilCompleto
        contato: {
          email: formData.contato_email,
          whatsapp: formData.contato_whatsapp
        }
      };

      const { error } = await supabase
        .from('conteudo_site_solicitacoes')
        .insert([
          { 
            secao: 'baldez_po_v6', 
            conteudo: payload,
            contato_solicitante: formData.contato_email || formData.contato_whatsapp
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({ missao: '', historia: '', contato_email: '', contato_whatsapp: '' });
      setSpecialists([]);
      setExpertises([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error:', err);
      setErrorMsg(err.message || 'Erro de conexão.');
      alert(`⚠️ Falha no envio: ${err.message}. Verifique as chaves da Vercel.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <header className="flex flex-col items-center mb-16 text-center">
          <div className="h-24 mb-6"><img src="/baldez-logo-desktop.png" alt="Baldez" className="h-full object-contain" /></div>
          <h1 className="text-3xl md:text-4xl mb-4 uppercase font-bold tracking-tight">Refinamento de Conteúdo <br/><span className="text-gold">BALDEZ ADVOGADOS</span></h1>
          <p className="text-slate-400 max-w-2xl text-xs md:text-sm">Portal exclusivo para envio de dados em conformidade com o Projeto Site Web App.</p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex flex-col items-center gap-6 text-center mb-12 py-16">
            <div className="bg-green-500/20 p-6 rounded-full animate-pulse"><CheckCircle2 size={64} className="text-green-400" /></div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">ENVIADO COM SUCESSO!</h3>
              <p className="text-slate-300 max-w-md mx-auto">Os dados estão em conformidade e foram integrados ao banco de dados.</p>
              <button onClick={() => setSuccess(false)} className="mt-8 btn-primary !w-auto !px-10 !py-3 !text-sm">Novo Envio</button>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-16">
            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <History className="text-gold" size={28} /><h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Identidade Baldez</h2>
              </div>
              <div className="form-group"><label>Missão do Escritório</label><textarea name="missao" rows={3} value={formData.missao} onChange={handleChange} placeholder="Missão..." /><p className="heuristic-help"><Info size={12} /> H10: Define o tom de voz da Hero.</p></div>
              <div className="form-group"><label>Nossa História</label><textarea name="historia" rows={5} value={formData.historia} onChange={handleChange} placeholder="Trajetória..." /></div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Target className="text-gold" size={28} /><h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Áreas de Atuação</h2>
              </div>
              {expertises.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expertises.map((e) => (
                    <div key={e.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-start">
                      <div><p className="text-gold font-bold text-xs uppercase tracking-widest">{e.area}</p><p className="text-[11px] text-slate-400 mt-1">{e.descricao}</p></div>
                      <button type="button" onClick={() => removeExpertise(e.id)} className="text-red-400"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white/5 p-8 rounded-2xl border border-gold/20 space-y-6">
                <div className="form-group"><label className="text-[10px]">Área (Ex: Direito do Trabalho)</label><input value={currentExpertise.area} onChange={(e) => setCurrentExpertise({...currentExpertise, area: e.target.value})} placeholder="Área" /></div>
                <div className="form-group"><label className="text-[10px]">O que fazemos (Descrição Curta)</label><textarea rows={2} value={currentExpertise.descricao} onChange={(e) => setCurrentExpertise({...currentExpertise, descricao: e.target.value})} placeholder="Descrição..." /></div>
                <button type="button" onClick={addExpertise} className="w-full py-4 border-2 border-gold/40 text-gold rounded-xl font-bold hover:bg-gold hover:text-navy transition-all uppercase text-xs tracking-widest"><Plus size={18} /> Inserir Área</button>
              </div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Users className="text-gold" size={28} /><h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Equipe de Especialistas</h2>
              </div>
              {specialists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialists.map((s) => (
                    <div key={s.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <div><p className="font-bold text-white text-sm">{s.nome}</p><p className="text-[10px] text-gold uppercase">{s.cargo}</p></div>
                      <button type="button" onClick={() => removeSpecialist(s.id)} className="text-red-400"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white/5 p-8 rounded-2xl border border-gold/20 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="form-group col-span-1"><label className="text-[10px]">Nome Completo</label><input value={currentSpecialist.nome} onChange={(e) => setCurrentSpecialist({...currentSpecialist, nome: e.target.value})} placeholder="Nome" /></div>
                  <div className="form-group col-span-1"><label className="text-[10px]">Cargo (Ex: Sócio)</label><input value={currentSpecialist.cargo} onChange={(e) => setCurrentSpecialist({...currentSpecialist, cargo: e.target.value})} placeholder="Cargo" /></div>
                  <div className="form-group col-span-1"><label className="text-[10px]">Número OAB</label><input value={currentSpecialist.oab} onChange={(e) => setCurrentSpecialist({...currentSpecialist, oab: e.target.value})} placeholder="OAB" /></div>
                </div>
                <div className="form-group"><label className="text-[10px]">Resumo do Card (Bio Curta)</label><input value={currentSpecialist.bio} onChange={(e) => setCurrentSpecialist({...currentSpecialist, bio: e.target.value})} placeholder="Bio curta..." /></div>
                <div className="form-group"><label className="text-[10px]">Perfil Completo (Detalhado para o Modal)</label><textarea rows={4} value={currentSpecialist.perfilCompleto} onChange={(e) => setCurrentSpecialist({...currentSpecialist, perfilCompleto: e.target.value})} placeholder="Biografia completa, formação, etc..." /></div>
                <button type="button" onClick={addSpecialist} className="w-full py-4 border-2 border-gold/40 text-gold rounded-xl font-bold hover:bg-gold hover:text-navy transition-all uppercase text-xs tracking-widest"><Plus size={18} /> Inserir Advogado</button>
              </div>
              <div className="bg-gold/5 p-5 rounded-xl border border-gold/20 flex items-center gap-4"><Camera className="text-gold" size={24} /><p className="text-[11px] text-slate-300">Envie a foto vertical (PNG) via WhatsApp para o Squad.</p></div>
            </section>

            <section className="glass-card space-y-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Scale className="text-gold" size={28} /><h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Contato</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="form-group"><label>E-mail</label><input name="contato_email" type="email" value={formData.contato_email} onChange={handleChange} placeholder="email@dominio.com" /></div>
                <div className="form-group"><label>WhatsApp</label><input name="contato_whatsapp" type="text" value={formData.contato_whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" /></div>
              </div>
            </section>

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl">
              {loading ? <Loader2 className="animate-spin" size={28} /> : <><FileText size={28} /> Finalizar e Consolidar Dados</>}
            </button>
          </form>
        )}

        <footer className="mt-20 text-center text-slate-500 text-[10px] md:text-xs py-10 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados.</p>
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
