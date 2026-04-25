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
  Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    missao: '',
    historia: '',
    valores: '',
    especialidades: '',
    equipe_nome: '',
    equipe_oab: '',
    equipe_cargo: '',
    equipe_bio_curta: '',
    equipe_bio_completa: '',
    depoimento: '',
    contato_email: '',
    contato_whatsapp: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('conteudo_site_solicitacoes')
        .insert([
          { 
            secao: 'geral', 
            conteudo: formData,
            contato_solicitante: formData.contato_email || formData.contato_whatsapp
          }
        ]);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Erro ao enviar:', err);
      alert('Houve um erro ao enviar. Verifique o console ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <main className="container">
        <header className="flex flex-col items-center mb-16 text-center">
          <img 
            src="/baldez-logo-desktop.png" 
            alt="Baldez Advogados" 
            className="h-24 mb-6 transition-all duration-500 hover:scale-105"
          />
          <h1 className="text-4xl md:text-5xl mb-4">Refinamento de Conteúdo</h1>
          <p className="text-slate-400 max-w-xl">
            Este portal é exclusivo para a equipe da Baldez Advogados Associados enviar atualizações estruturadas para o novo projeto.
          </p>
        </header>

        {success && (
          <div className="glass-card border-green-500 flex items-center gap-3 text-green-400 mb-8 animate-bounce">
            <CheckCircle2 size={24} />
            <p className="font-bold">Solicitação enviada com sucesso! Analisaremos em breve.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEÇÃO 1: IDENTIDADE */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <History className="text-gold" size={28} />
              <h2 className="text-2xl">Identidade e Trajetória</h2>
            </div>

            <div className="form-group">
              <label>Missão do Escritório</label>
              <textarea 
                name="missao"
                rows={3} 
                onChange={handleChange}
                placeholder="Ex: Transformar desafios jurídicos em soluções com expertise..."
              />
              <p className="heuristic-help">
                H10: Este texto aparecerá no topo da página 'Sobre Nós'. Ajuda o cliente a entender o propósito central do escritório.
              </p>
            </div>

            <div className="form-group">
              <label>Nossa História</label>
              <textarea 
                name="historia"
                rows={5} 
                onChange={handleChange}
                placeholder="Descreva a fundação e evolução do escritório..."
              />
              <p className="heuristic-help">
                H2: Correspondência com o mundo real - Conte a história cronologicamente para facilitar a leitura.
              </p>
            </div>
          </section>

          {/* SEÇÃO 2: ÁREAS DE ATUAÇÃO */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-gold" size={28} />
              <h2 className="text-2xl">Áreas de Atuação</h2>
            </div>
            
            <div className="form-group">
              <label>Novas Especialidades ou Alterações</label>
              <textarea 
                name="especialidades"
                rows={4}
                onChange={handleChange}
                placeholder="Ex: Direito Previdenciário (Foco em pedidos de aposentadoria...), Direito Civil..."
              />
              <p className="heuristic-help">
                H4: Consistência - Siga o padrão 'Título: Descrição Curta' para manter o visual do menu.
              </p>
            </div>
          </section>

          {/* SEÇÃO 3: EQUIPE */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-gold" size={28} />
              <h2 className="text-2xl">Equipe de Elite</h2>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
              <div className="flex items-center gap-3 mb-4 text-gold">
                <ImageIcon size={20} />
                <span className="font-bold text-sm uppercase tracking-widest">Solicitação de Imagem (Vertical)</span>
              </div>
              <p className="text-sm mb-4">
                Envie a foto em **posição vertical** e formato **PNG** para o suporte técnico via WhatsApp.
              </p>
              <a 
                href="https://wa.me/5512996088349?text=Olá! Estou enviando as fotos verticais em PNG para o perfil da equipe."
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Enviar foto do especialista
              </a>
            </div>

            <div className="grid gap-6">
              <div className="form-group">
                <label>Nome do Especialista</label>
                <input name="equipe_nome" type="text" onChange={handleChange} placeholder="Nome completo" />
              </div>
              <div className="form-group">
                <label>OAB e Cargo</label>
                <input name="equipe_oab" type="text" onChange={handleChange} placeholder="Ex: OAB/MA 00.000 | Sócio" />
              </div>
            </div>

            <div className="form-group mt-6">
              <label>Bio Curta (Para o Card)</label>
              <textarea name="equipe_bio_curta" rows={2} onChange={handleChange} placeholder="Resumo profissional rápido..." />
              <p className="heuristic-help">H10: Ajuda na tomada de decisão rápida do cliente ao navegar pelos advogados.</p>
            </div>

            <div className="form-group">
              <label>Perfil Completo (Para o Modal)</label>
              <textarea name="equipe_bio_completa" rows={4} onChange={handleChange} placeholder="Histórico acadêmico e profissional detalhado..." />
            </div>
          </section>

          {/* SEÇÃO 4: PROVA SOCIAL E CONTATO */}
          <section className="glass-card">
            <div className="flex items-center gap-3 mb-8">
              <Award className="text-gold" size={28} />
              <h2 className="text-2xl">Prova Social & Contato</h2>
            </div>

            <div className="form-group">
              <label>Novos Depoimentos</label>
              <textarea name="depoimento" rows={3} onChange={handleChange} placeholder="Nome do Cliente: 'Seu depoimento aqui...'" />
            </div>

            <hr className="border-white/10 my-8" />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label>E-mail para Retorno</label>
                <input name="contato_email" type="email" onChange={handleChange} placeholder="seu@email.com" />
              </div>
              <div className="form-group">
                <label>WhatsApp para Retorno</label>
                <input name="contato_whatsapp" type="text" onChange={handleChange} placeholder="(99) 99999-9999" />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 py-4 text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <CheckCircle2 size={24} />
                Finalizar e Enviar para o Squad
              </>
            )}
          </button>
        </form>

        <footer className="mt-16 text-center text-slate-500 text-sm py-8 border-t border-white/5">
          <p>© 2026 Baldez Advogados Associados. Desenvolvido pelo Squad Agêntico de Elite.</p>
        </footer>
      </main>

      {/* Botões Flutuantes */}
      <div className="floating-container">
        {showTopButton && (
          <button 
            onClick={scrollToTop}
            className="fab fab-top"
            aria-label="Voltar ao topo"
          >
            <ArrowUp size={24} />
          </button>
        )}
        
        <a 
          href="https://wa.me/5512996088349?text=Olá! Tenho uma dúvida sobre o formulário de atualização Baldez."
          className="fab fab-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Dúvidas no WhatsApp"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
}

export default App;
