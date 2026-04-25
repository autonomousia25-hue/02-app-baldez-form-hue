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
  AlertCircle
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './index.css';

interface Specialist {
  id: string;
  nome: string;
  oab: string;
  bioCurta: string;
  bioCompleta: string;
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados do formulário
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
    bioCompleta: ''
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
      bioCompleta: ''
    });
  };

  const removeSpecialist = (id: string) => {
    setSpecialists(specialists.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            secao: 'geral_v2', 
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
      setErrorMsg(err.message || 'Erro de conexão com o Supabase. Verifique se as variáveis de ambiente foram configuradas na Vercel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container px-4 md:px-0">
        <header className="flex flex-col items-center mb-16 text-center">
          <img 
            src="/baldez-logo-desktop.png" 
            alt="Baldez Advogados" 
            className="h-20 md:h-24 mb-6 transition-all duration-500 hover:scale-105"
          />
          <h1 className="text-3xl md:text-5xl mb-4 leading-tight uppercase font-bold tracking-tight">
            Refinamento de Conteúdo <br/><span className="text-gold">PARA FINALIZAÇÃO DO SITE</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Este portal é exclusivo para a equipe da Baldez Advogados Associados enviar atualizações estruturadas para o **PROJETO DO SITE WEB APP**.
          </p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex items-center gap-3 text-green-400 mb-8 animate-bounce shadow-2xl shadow-green-500/20">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-bold">Solicitação enviada com sucesso!</p>
              <p className="text-sm">O Squad Agêntico já recebeu seus dados para processamento.</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="glass-card border-red-500 flex items-start gap-3 text-red-400 mb-8 shadow-2xl shadow-red-500/20">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold">Houve um erro ao enviar:</p>
              <p className="text-sm opacity-80">{errorMsg}</p>
              <p className="text-xs mt-2 italic">⚠️ Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas na Vercel.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEÇÃO 1: IDENTIDADE */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
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
                H10: Ajuda na tomada de decisão - Este texto aparecerá logo abaixo da Hero do site.
              </p>
            </div>

            <div className="form-group">
              <label>Nossa História</label>
              <textarea 
                name="historia"
                rows={5} 
                value={formData.historia}
                onChange={handleChange}
                placeholder="Conte sobre a fundação e marcos importantes..."
              />
              <p className="heuristic-help">
                H2: Correspondência com o mundo real - Utilize linguagem que reflita a seriedade do escritório.
              </p>
            </div>
          </section>

          {/* SEÇÃO 2: ÁREAS DE ATUAÇÃO */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Áreas de Atuação</h2>
            </div>
            
            <div className="form-group">
              <label>Especialidades (Título: Descrição)</label>
              <textarea 
                name="especialidades"
                rows={4}
                value={formData.especialidades}
                onChange={handleChange}
                placeholder="Direito Civil: Atuação em contratos e responsabilidade..."
              />
              <p className="heuristic-help">
                H4: Consistência - Siga o padrão 'Nome da Área: Descrição' para uma exibição uniforme.
              </p>
            </div>
          </section>

          {/* SEÇÃO 3: EQUIPE (DINÂMICA) */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Equipe de Especialistas</h2>
            </div>

            {/* Lista de especialistas já adicionados */}
            {specialists.length > 0 && (
              <div className="mb-8 space-y-3">
                <p className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/20 pb-2">Membros Adicionados:</p>
                {specialists.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10 hover:border-gold/30 transition-all">
                    <div>
                      <p className="font-bold text-white">{s.nome}</p>
                      <p className="text-xs text-slate-400 uppercase">{s.oab}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeSpecialist(s.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário de Adição de Especialista */}
            <div className="bg-white/5 p-6 rounded-xl border border-gold/20 mb-8 shadow-inner">
              <p className="text-xs font-bold mb-6 flex items-center gap-2 text-gold uppercase tracking-widest">
                <Plus size={16} /> Preencher Novo Especialista
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="form-group">
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Nome Completo</label>
                  <input 
                    name="nome" 
                    value={currentSpecialist.nome} 
                    onChange={handleSpecialistChange} 
                    placeholder="Nome"
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">OAB e Cargo</label>
                  <input 
                    name="oab" 
                    value={currentSpecialist.oab} 
                    onChange={handleSpecialistChange} 
                    placeholder="Ex: OAB/SP 123.456"
                  />
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Bio Curta (Para o Card)</label>
                <input 
                  name="bioCurta" 
                  value={currentSpecialist.bioCurta} 
                  onChange={handleSpecialistChange} 
                  placeholder="Resumo das principais qualificações..."
                />
              </div>

              <button 
                type="button" 
                onClick={addSpecialist}
                className="w-full py-4 border-2 border-gold/40 text-gold rounded-lg font-bold hover:bg-gold hover:text-navy hover:border-gold transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest"
              >
                <Plus size={20} /> Inserir Especialista na Lista
              </button>
            </div>

            <div className="bg-gold/5 p-5 rounded-lg border border-gold/20 flex items-start gap-4">
              <ImageIcon className="text-gold shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold uppercase mb-1 text-gold">Aviso de Fotos Profissionais</p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  H6: Prevenção de erros - Lembre-se de enviar a foto vertical (PNG sem fundo ou com fundo neutro) de cada especialista para o WhatsApp <span className="text-gold font-bold">12 99608-8349</span> para indexação no site.
                </p>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: PROVA SOCIAL E CONTATO */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Award className="text-gold" size={28} />
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider">Depoimentos & Contato</h2>
            </div>

            <div className="form-group">
              <label>Novos Depoimentos de Clientes</label>
              <textarea 
                name="depoimento" 
                rows={3} 
                value={formData.depoimento}
                onChange={handleChange} 
                placeholder="Nome do Cliente: 'Depoimento dele aqui'..." 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-10 border-t border-white/5 pt-8">
              <div className="form-group">
                <label className="text-gold font-bold">E-mail para Retorno</label>
                <input 
                  name="contato_email" 
                  type="email" 
                  value={formData.contato_email}
                  onChange={handleChange} 
                  placeholder="contato@baldezadvogados.com.br" 
                />
              </div>
              <div className="form-group">
                <label className="text-gold font-bold">WhatsApp para Retorno</label>
                <input 
                  name="contato_whatsapp" 
                  type="text" 
                  value={formData.contato_whatsapp}
                  onChange={handleChange} 
                  placeholder="(12) 99999-9999" 
                />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading || (specialists.length === 0 && !formData.missao)}
            className="btn-primary flex items-center justify-center gap-3 py-6 text-xl shadow-2xl shadow-gold/10 group uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={28} />
            ) : (
              <>
                <CheckCircle2 size={28} className="group-hover:scale-110 transition-transform" />
                Finalizar e Enviar para o Squad
              </>
            )}
          </button>
        </form>

        <footer className="mt-20 text-center text-slate-500 text-[10px] md:text-xs py-10 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados. <br className="md:hidden" /> Desenvolvimento Premium pelo Squad Agêntico de Elite.</p>
        </footer>
      </main>

      <div className="floating-container">
        {showTopButton && (
          <button onClick={scrollToTop} className="fab fab-top" aria-label="Voltar ao Topo">
            <ArrowUp size={24} />
          </button>
        )}
        <a 
          href="https://wa.me/5512996088349?text=Olá! Tenho uma dúvida sobre o refinamento do site Baldez."
          className="fab fab-whatsapp" target="_blank" rel="noopener noreferrer"
          title="WhatsApp Suporte"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
}

export default App;
