import React from 'react';
import { motion } from 'framer-motion';
import { X, Scale } from 'lucide-react';

interface CardPreviewProps {
  member: {
    nome: string;
    cargo: string;
    oab?: string;
    bio?: string;
    imagem?: string;
  };
  onClose: () => void;
}

const CardPreview: React.FC<CardPreviewProps> = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-navy-light border border-gold/30 rounded-sm overflow-hidden shadow-glow"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-gold hover:bg-gold hover:text-navy transition-all"
          style={{ background: 'rgba(11, 26, 48, 0.5)' }}
        >
          <X size={20} />
        </button>

        {/* Card Header (Image Space) */}
        <div className="aspect-vertical bg-navy relative overflow-hidden">
          {member.imagem ? (
            <img 
              src={member.imagem} 
              alt={member.nome} 
              className="w-full h-full object-cover transition-all" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gold/20 gap-4">
              <Scale size={64} />
              <p className="text-[10px] uppercase tracking-widest font-black">Foto do Especialista</p>
            </div>
          )}
          <div className="absolute inset-0 bg-grad-bottom" style={{ opacity: 0.6 }} />
        </div>

        {/* Card Body */}
        <div className="p-8 text-center">
          <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-black mb-2 block">
            {member.cargo}
          </span>
          <h3 className="text-2xl font-serif mb-4 text-white">
            {member.nome || 'Nome do Advogado'}
          </h3>
          {member.oab && (
            <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-4">
              OAB {member.oab}
            </p>
          )}
          <p className="text-slate-400 text-xs leading-relaxed font-light line-clamp-3">
            {member.bio || 'Biografia curta aparecerá aqui...'}
          </p>
          
          <div className="mt-8 pt-6 border-t border-gold/10">
            <button className="text-gold text-[10px] uppercase tracking-[0.3em] font-black flex items-center gap-2 mx-auto cursor-pointer border-none bg-transparent">
              Ver Perfil Completo
              <div style={{ width: '16px', height: '1px', background: 'var(--gold)', transition: 'width 0.3s' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardPreview;
