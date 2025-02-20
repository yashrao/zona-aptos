import React from 'react';

type TimeFrame = '7D' | '30D' | '90D' | '180D' | '1Y' | '5Y';

interface TimeframeSelectorProps {
  timeframes: TimeFrame[];
  timeRange: TimeFrame;
  onTimeFrameChange: (newTimeFrame: TimeFrame) => void;
  isMobile: boolean;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ timeframes, timeRange, onTimeFrameChange, isMobile }) => {
  const position = isMobile
    ? { right: '70px', bottom: '340px' }
    : { right: '80px', top: '8px' };

  return (
    <div className="absolute z-10" style={position}>
      <div className="rounded-[6px] p-[2px] flex bg-[rgba(30,34,45,0.5)]">
        {timeframes.map((item) => (
          <button
            key={item}
            className={`
              px-2 py-1 text-[14px] rounded-[4px] transition-all duration-200 relative
              ${item === timeRange 
                ? "bg-[#23F98A] text-black font-semibold" 
                : "text-white font-light hover:bg-[#2C2C2E]"}
            `}
            onClick={() => onTimeFrameChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeSelector;