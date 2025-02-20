import React from 'react';

interface TooltipProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
}

export const MarketTooltip: React.FC<TooltipProps> = ({ 
  content, 
  className = '', 
  children,
}) => {
  return (
    <div className="relative inline-block">
      {children}
      <div 
        className={`
          invisible group-hover:visible 
          absolute z-50 
          left-[150px]
          top-[-43px]
          px-4 py-3
          text-[16px] 
          bg-[#0F1216] 
          text-white 
          rounded-md 
          min-w-[250px]
          max-w-[500px]
          whitespace-pre-wrap
          border border-[#222226]
          shadow-lg
          ${className}
        `}
      >
        {content}
        <div 
          className="
            absolute 
            left-[-5px]
            top-1/2 transform -translate-y-1/2
            rotate-45 w-2 h-2 
            bg-[#0F1216] 
            border-l border-b
            border-[#222226]
          "
        ></div>
      </div>
    </div>
  );
};

export default MarketTooltip;