import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children || <Info size={14} className="text-gold/60" />}
      <div className="tooltip-box">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
