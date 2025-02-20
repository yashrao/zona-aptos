import React, { useState, useRef, useEffect } from 'react';

interface PositionSizeSliderProps {
  maxPositionSize: number;
  positionsize: number;
  setpositionsize: React.Dispatch<React.SetStateAction<number>>;
  positionSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  shortSelected: boolean;
  longSelected: boolean;
  percentageOfMaxPosition: number[];
  updateAmounts: (newPositionSize: number) => void;
}

export default function PositionSlider({
  maxPositionSize,
  positionsize,
  setpositionsize,
  positionSliderChange,
  shortSelected,
  longSelected,
  percentageOfMaxPosition,
  updateAmounts,
}: PositionSizeSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPositionSize = Number(event.target.value);
    const formattedPositionSize = Number(newPositionSize.toFixed(2));
    setpositionsize(formattedPositionSize);
    updateAmounts(formattedPositionSize);
    positionSliderChange(event);
  };

  const calculatePositionFromX = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newPositionSize = Number((percentage * maxPositionSize).toFixed(2));
    return newPositionSize;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newPosition = calculatePositionFromX(e.clientX);
    if (newPosition !== undefined) {
      setpositionsize(newPosition);
      updateAmounts(newPosition);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newPosition = calculatePositionFromX(e.clientX);
    if (newPosition !== undefined) {
      setpositionsize(newPosition);
      updateAmounts(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleButtonClick = (percentage: number) => {
    const newPositionSize = Number((percentage * maxPositionSize).toFixed(2));
    setpositionsize(newPositionSize);
    updateAmounts(newPositionSize);
  };

  const currentPercentage = Math.round((positionsize / maxPositionSize) * 100);

  const getButtonStyle = (buttonPercentage: number) => {
    const isActive = currentPercentage === buttonPercentage;
    if (isActive) {
      if (longSelected) {
        return "text-zona-green border-zona-green";
      } else if (shortSelected) {
        return "text-[#D8515F] border-[#D8515F]";
      }
    }
    return "text-white border-transparent";
  };

  return (
    <div className="col-span-2 px-4 py-4 bg-[#0F1216] rounded-[8px] mt-4 border-[0.5px] border-[#222226] flex flex-col h-full">
      <div className="flex-grow flex flex-col justify-between">
        <div className="relative h-[25px] mb-4 flex justify-center">
          <div className="w-[90%] relative" ref={sliderRef}>
            <input
              type="range"
              min="0"
              max={maxPositionSize}
              step="0.01"
              value={positionsize}
              onChange={handleSliderChange}
              className="absolute mt-4 w-full h-3 rounded-[3px] appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-0
              [&::-webkit-slider-thumb]:h-0
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-transparent
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-0
              [&::-moz-range-thumb]:h-0
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-transparent
              [&::-ms-thumb]:appearance-none
              [&::-ms-thumb]:w-0
              [&::-ms-thumb]:h-0
              [&::-ms-thumb]:rounded-full
              [&::-ms-thumb]:bg-transparent"
              style={{
                background: `linear-gradient(to right, ${shortSelected ? "#D8515F" : "#23F98A"} 0%, ${shortSelected ? "#D8515F" : "#23F98A"} ${currentPercentage}%, #222226 ${currentPercentage}%, #222226 100%)`,
              }}
            />
            <div
              className="absolute top-0 pointer-events-auto cursor-grab active:cursor-grabbing"
              style={{ left: `calc(${currentPercentage}% - 18px)` }}
              onMouseDown={handleMouseDown}
            >
              <div className={`mt-[6px] w-[46px] h-[30px] rounded-[29px] bg-[#222226] border-[2px] ${
                shortSelected ? "border-[#D8515F]" : "border-[#23F98A]"
              } flex items-center justify-center text-[13px] text-white select-none`}>
                {currentPercentage}%
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-x-4 mt-5">
          {[25, 50, 75, 100].map((percentage) => (
            <button
              key={percentage}
              type="button"
              className={`${getButtonStyle(percentage)} p-2 w-full rounded-[8px] bg-[#222226] border-[1px] transition-colors duration-200 hover:bg-[#2f3039] hover:border-[#383945]`}
              onClick={() => handleButtonClick(percentage / 100)}
            >
            <span
              className={`${getButtonStyle(percentage)} ${
                currentPercentage === percentage ? "font-bold" : ""
              } text-[18px]`}
            >
              {percentage}%
            </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
