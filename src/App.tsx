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
  Scale,
  Camera,
  FileText,
  Eye,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Tooltip from './components/Tooltip';
import CardPreview from './components/CardPreview';
import './index.css';

interface Specialist {
  id: string;
  nome: string;
  cargo: string;
  oab: string;
  bio: string;
  perfilCompleto: string;
  imagem?: string;
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
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMember, setPreviewMember] = useState<Specialist | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    missao: '',
    historia: '',
    contato_email: '',
    contato_whatsapp: ''
  });

  const [formErrors, setFormErrors] = useState({
    email: false,
    whatsapp: false
  });

  // Dynamic Lists
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);

  // Current Inputs
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>({
    id: '',
    nome: '',
    cargo: '',
    oab: '',
    bio: '',
    perfilCompleto: '',
    imagem: ''
  });

  const [currentExpertise, setCurrentExpertise] = useState<Expertise>({
    id: '', area: '', descricao: ''
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return phone.replace(/\D/g, '').length >= 10;
  };

  const handlePhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    const masked = numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
    return masked;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'contato_whatsapp') {
      const masked = handlePhoneMask(value);
      setFormData({ ...formData, [name]: masked });
      setFormErrors({ ...formErrors, whatsapp: !validatePhone(masked) && value !== '' });
    } else if (name === 'contato_email') {
      setFormData({ ...formData, [name]: value });
      setFormErrors({ ...formErrors, email: !validateEmail(value) && value !== '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Gera um nome de arquivo amigável baseado no nome do advogado
    const nameSlug = currentSpecialist.nome
      ? currentSpecialist.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9]/g, '-')     // Substitui caracteres especiais por hífens
          .replace(/-+/g, '-')            // Evita hífens duplos
          .replace(/^-|-$/g, '')          // Remove hífens no início/fim
      : 'advogado';
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      // Combina o nome do advogado com um pequeno ID único para evitar conflitos se subir a foto 2x
      const fileName = `${nameSlug}-${crypto.randomUUID().substring(0, 8)}.${fileExt}`;
      const filePath = `equipe/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('fotos-equipe').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('fotos-equipe').getPublicUrl(filePath);
      setCurrentSpecialist({ ...currentSpecialist, imagem: data.publicUrl });
    } catch (error: any) {
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const addSpecialist = () => {
    if (!currentSpecialist.nome || !currentSpecialist.cargo) return alert('Insira ao menos Nome e Cargo.');
    setSpecialists([...specialists, { ...currentSpecialist, id: crypto.randomUUID() }]);
    setCurrentSpecialist({ id: '', nome: '', cargo: '', oab: '', bio: '', perfilCompleto: '', imagem: '' });
  };

  const removeSpecialist = (id: string) => setSpecialists(specialists.filter(s => s.id !== id));
  const handlePreview = (member: Specialist) => { setPreviewMember(member); setShowPreview(true); };

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
    if (formErrors.email || formErrors.whatsapp) return alert('⚠️ Corrija os erros de validação antes de enviar.');
    
    setLoading(true);
    try {
      const payload = {
        versao_schema: '7.0_PREMIUM',
        identidade: { missao: formData.missao, historia: formData.historia },
        areas_atuacao: expertises,
        equipe: specialists,
        contato: { email: formData.contato_email, whatsapp: formData.contato_whatsapp }
      };
      const { error } = await supabase.from('conteudo_site_solicitacoes').insert([
        { secao: 'baldez_premium_v7', conteudo: payload, contato_solicitante: formData.contato_email || formData.contato_whatsapp }
      ]);
      if (error) throw error;
      setSuccess(true);
      setFormData({ missao: '', historia: '', contato_email: '', contato_whatsapp: '' });
      setSpecialists([]);
      setExpertises([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`⚠️ Falha no envio: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-navy">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-24 text-center"
        >
          <div className="h-20 md:h-28 mb-8">
            <img src="/baldez-logo-desktop.png" alt="Baldez" className="h-full object-contain" />
          </div>
          <h1 className="text-3xl md:text-5xl mb-6 uppercase font-serif font-medium tracking-tight leading-tight">
            Refinamento de <span className="text-gold italic">Informações</span><br/>
            <span className="text-white text-2xl md:text-3xl font-sans font-black tracking-[0.3em]">BALDEZ ADVOGADOS ASSOCIADOS</span>
          </h1>
          <div className="w-12 h-[2px] bg-gold mb-6" />
          <p className="text-slate-400 max-w-2xl text-[10px] md:text-xs uppercase tracking-[0.2em]">
            Portal exclusivo para envio de dados em conformidade com o Projeto Site Web App.
          </p>
        </motion.header>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border-gold flex flex-col items-center gap-8 text-center mb-12 py-20"
            >
              <div className="bg-gold/10 p-8 rounded-full border border-gold/30">
                <CheckCircle2 size={64} className="text-gold" />
              </div>
              <div>
                <h3 className="text-4xl font-serif text-white mb-6">DADOS ENVIADOS COM SUCESSO!</h3>
                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                  As informações foram consolidadas seguindo os padrões de excelência Baldez.
                </p>
                <button onClick={() => setSuccess(false)} className="mt-12 btn-primary !w-auto !px-16">Novo Envio</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-24">
            {/* Seção Identidade */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card space-y-12">
              <div className="flex items-center justify-between border-b border-gold/10 pb-8">
                <div className="flex items-center gap-4">
                  <History className="text-gold" size={24} />
                  <h2 className="text-2xl font-serif font-medium tracking-wide">Identidade Baldez</h2>
                </div>
                <Tooltip text="Defina a essência do escritório. A missão aparece na seção principal (Hero) e a história na seção 'Quem Somos'." />
              </div>
              <div className="form-group">
                <label>Missão do Escritório</label>
                <textarea name="missao" value={formData.missao} onChange={handleChange} placeholder="Ex: Defender o legado de nossos clientes com ética e expertise técnica superior..." />
              </div>
              <div className="form-group">
                <label>Nossa História</label>
                <textarea name="historia" rows={6} value={formData.historia} onChange={handleChange} placeholder="Descreva a trajetória do escritório..." />
              </div>
            </motion.section>

            {/* Seção Áreas de Atuação */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card space-y-12">
              <div className="flex items-center justify-between border-b border-gold/10 pb-8">
                <div className="flex items-center gap-4">
                  <Target className="text-gold" size={24} />
                  <h2 className="text-2xl font-serif font-medium tracking-wide">Áreas de Atuação</h2>
                </div>
                <Tooltip text="Liste os serviços oferecidos. Cada área terá um ícone exclusivo e descrição detalhada no site." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {expertises.map((e) => (
                    <motion.div key={e.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-navy-light/50 p-6 rounded-sm border border-gold/10 flex justify-between items-start group hover:border-gold/40 transition-all">
                      <div>
                        <p className="text-gold font-black text-[10px] uppercase tracking-[0.2em] mb-2">{e.area}</p>
                        <p className="text-[11px] text-slate-400 font-light leading-relaxed">{e.descricao}</p>
                      </div>
                      <button type="button" onClick={() => removeExpertise(e.id)} className="text-red-400/50 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={16} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="space-y-8 mt-4">
                <div className="form-group"><label>Área (Ex: Direito Tributário)</label><input value={currentExpertise.area} onChange={(e) => setCurrentExpertise({...currentExpertise, area: e.target.value})} placeholder="Título da área" /></div>
                <div className="form-group"><label>Descrição do Serviço</label><textarea rows={2} value={currentExpertise.descricao} onChange={(e) => setCurrentExpertise({...currentExpertise, descricao: e.target.value})} placeholder="Explique o que o escritório oferece..." /></div>
                <button type="button" onClick={addExpertise} className="btn-outline w-full mt-12"><Plus size={18} /> Inserir Área</button>
              </div>
            </motion.section>

            {/* Seção Equipe */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card space-y-12">
              <div className="flex items-center justify-between border-b border-gold/10 pb-8">
                <div className="flex items-center gap-4">
                  <Users className="text-gold" size={24} />
                  <h2 className="text-2xl font-serif font-medium tracking-wide">Equipe de Especialistas</h2>
                </div>
                <Tooltip text="Adicione os advogados. Use fotos verticais nítidas. O preview permite conferir o resultado final." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {specialists.map((s) => (
                    <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-navy-light/50 p-6 rounded-sm border border-gold/10 flex justify-between items-center group hover:border-gold/40 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-gold/30 overflow-hidden bg-navy">
                          {s.imagem ? <img src={s.imagem} alt={s.nome} className="w-full h-full object-cover" /> : <Scale className="w-full h-full p-3 text-gold/20" />}
                        </div>
                        <div><p className="font-bold text-white text-sm tracking-wide">{s.nome}</p><p className="text-[9px] text-gold uppercase font-black tracking-widest">{s.cargo}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handlePreview(s)} className="p-2 text-gold/50 hover:text-gold transition-colors border-none bg-transparent cursor-pointer"><Eye size={18} /></button>
                        <button type="button" onClick={() => removeSpecialist(s.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="space-y-8 mt-4">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="form-group"><label>Nome Completo</label><input value={currentSpecialist.nome} onChange={(e) => setCurrentSpecialist({...currentSpecialist, nome: e.target.value})} placeholder="Nome" /></div>
                  <div className="form-group"><label>Cargo / Função</label><input value={currentSpecialist.cargo} onChange={(e) => setCurrentSpecialist({...currentSpecialist, cargo: e.target.value})} placeholder="Ex: Sócio Fundador" /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="form-group"><label>Número OAB (Opcional)</label><input value={currentSpecialist.oab} onChange={(e) => setCurrentSpecialist({...currentSpecialist, oab: e.target.value})} placeholder="Ex: MA 11.061" /></div>
                  <div className="form-group">
                    <label>Foto do Advogado</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className={`btn-outline !py-4 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : (currentSpecialist.imagem ? <><Check size={18} /> Foto Carregada</> : <><Camera size={18} /> Upload de Foto</>)}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-group"><label>Bio Curta (Resumo do Card)</label><input value={currentSpecialist.bio} onChange={(e) => setCurrentSpecialist({...currentSpecialist, bio: e.target.value})} placeholder="Uma frase impactante sobre a atuação..." /></div>
                <div className="form-group"><label>Perfil Completo (Modal)</label><textarea rows={4} value={currentSpecialist.perfilCompleto} onChange={(e) => setCurrentSpecialist({...currentSpecialist, perfilCompleto: e.target.value})} placeholder="Formação, especializações e experiência..." /></div>
                <button type="button" onClick={addSpecialist} className="btn-outline w-full !bg-gold/5 mt-12"><Plus size={18} /> Inserir na Equipe</button>
              </div>
            </motion.section>

            {/* Seção Contato */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card space-y-12">
              <div className="flex items-center justify-between border-b border-gold/10 pb-8">
                <div className="flex items-center gap-4">
                  <Scale className="text-gold" size={24} />
                  <h2 className="text-2xl font-serif font-medium tracking-wide">Dados de Contato</h2>
                </div>
                <Tooltip text="Estes dados alimentam os links automáticos de contato no site." />
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="form-group">
                  <label>E-mail Corporativo</label>
                  <input name="contato_email" type="email" value={formData.contato_email} onChange={handleChange} className={formErrors.email ? 'border-red-400' : ''} placeholder="exemplo@baldez.adv.br" />
                  {formErrors.email && <p className="text-[10px] text-red-400 uppercase tracking-widest mt-1">E-mail inválido</p>}
                </div>
                <div className="form-group">
                  <label>WhatsApp (Link Direto)</label>
                  <input name="contato_whatsapp" type="text" value={formData.contato_whatsapp} onChange={handleChange} className={formErrors.whatsapp ? 'border-red-400' : ''} placeholder="(00) 00000-0000" />
                  {formErrors.whatsapp && <p className="text-[10px] text-red-400 uppercase tracking-widest mt-1">WhatsApp inválido</p>}
                </div>
              </div>
            </motion.section>

            <button type="submit" disabled={loading || formErrors.email || formErrors.whatsapp} className="btn-primary mt-12 !py-8 !text-base shadow-glow">
              {loading ? <Loader2 className="animate-spin" size={28} /> : <><FileText size={24} /> Finalizar e Consolidar Dados</>}
            </button>
          </form>
        )}

        <footer className="mt-16 text-center text-slate-500 text-[10px] uppercase tracking-[0.3em] py-8 border-t border-gold/10">
          <p>© 2026 Baldez Advogados Associados. Excelência em Advocacia.</p>
        </footer>
      </main>

      <div className="floating-container">
        {showTopButton && <button onClick={scrollToTop} className="fab fab-top"><ArrowUp size={24} /></button>}
        <a href="https://wa.me/5598987910719" className="fab fab-whatsapp" target="_blank" rel="noopener noreferrer"><MessageCircle size={28} /></a>
      </div>

      <AnimatePresence>{showPreview && previewMember && <CardPreview member={previewMember} onClose={() => setShowPreview(false)} />}</AnimatePresence>
    </div>
  );
}

export default App;
