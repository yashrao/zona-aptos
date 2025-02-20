import React from 'react';

interface TooltipProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
  direction?: 'up' | 'down';
  arrowOffset?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  className = '', 
  children,
  direction = 'down',
  arrowOffset = '50%'
}) => {
  return (
    <div className="relative inline-block">
      {children}
      <div 
        className={`
          invisible group-hover:visible 
          absolute z-50 
          px-4 py-3
          text-[20px] 
          bg-[#0F1216] 
          text-white 
          rounded-md 
          whitespace-nowrap
          border border-[#222226]
          shadow-lg
          ${className}
        `}
      >
        {content}
        <div 
          className={`
            absolute 
            ${direction === 'down' ? 'bottom-[-5px]' : 'top-[-5px]'}
            left-[${arrowOffset}] transform -translate-x-1/2 
            rotate-45 w-2 h-2 
            bg-[#0F1216] 
            ${direction === 'down' ? 'border-r border-b' : 'border-l border-t'}
            border-[#222226]
          `}
        ></div>
      </div>
    </div>
  );
};

export default Tooltip;