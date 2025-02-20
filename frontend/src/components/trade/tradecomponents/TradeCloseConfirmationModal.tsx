import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Transaction } from '@/types/transaction';

interface TradeCloseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
  estimatedPnL: number;
  tradingFees: number;
  marketInfo?: { city: string; code: string; flag: string; currency: string };
  currentMarketPrice: number;
}

const TradeCloseConfirmationModal: React.FC<TradeCloseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  estimatedPnL,
  tradingFees,
  marketInfo,
  currentMarketPrice 
}) => {
  if (!isOpen || !transaction || !marketInfo) return null;

  const formatCurrency = (value: number | undefined, currency: string = 'USD', decimals: number = 2): string => {
    if (value === undefined || isNaN(value)) return `${currency} 0.00`;
    return `${currency} ${value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  const isLong = transaction.type === 'long';
  const directionColor = isLong ? 'text-zona-green' : 'text-zona-red';

  const [selectedPercentage, setSelectedPercentage] = useState<25 | 50 | 75 | 100>(100);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const calculatePercentageFromX = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(percentage * 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newPercentage = calculatePercentageFromX(e.clientX);
    if (newPercentage !== undefined) {
      setSelectedPercentage(newPercentage as 25 | 50 | 75 | 100);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newPercentage = calculatePercentageFromX(e.clientX);
    if (newPercentage !== undefined) {
      setSelectedPercentage(newPercentage as 25 | 50 | 75 | 100);
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

  // Add useRef for the modal container
  const modalRef = useRef<HTMLDivElement>(null);

  // Add useEffect for escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add this helper function near the top of the component
  const getThemeColor = () => {
    return isLong ? '#23F98A' : '#D8515F';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-50">
      <div ref={modalRef} className="bg-[#13141A] rounded-lg shadow-lg w-[400px] mt-56">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg text-white">Market Close</h2>
          <button onClick={onClose} className="text-[#AFAFAF] hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Position Info Box */}
          <div className="bg-[#1B1C21] p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src={marketInfo.flag} 
                alt={marketInfo.city} 
                width={24} 
                height={24}
                className="rounded-full"
              />
              <span className="text-white">{marketInfo.city}</span>
              <span className={directionColor}>
                {transaction.type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <div className="text-[#AFAFAF] text-sm">Position Size</div>
                <div className="text-white">{formatCurrency(transaction.amount, 'USD', 2)}</div>
              </div>
              <div>
                <div className="text-[#AFAFAF] text-sm">Est. PnL</div>
                <div className={
                  estimatedPnL === 0 
                    ? 'text-white' 
                    : estimatedPnL > 0 
                      ? 'text-zona-green' 
                      : 'text-zona-red'
                }>
                  {formatCurrency(estimatedPnL, 'USD')}
                </div>
              </div>
              <div>
                <div className="text-[#AFAFAF] text-sm">Oracle Price</div>
                <div className="text-white">{formatCurrency(currentMarketPrice, marketInfo.currency)}</div>
              </div>
              <div>
                <div className="text-[#AFAFAF] text-sm">Entry Price</div>
                <div className="text-white">{formatCurrency(transaction.entryPrice, marketInfo.currency)}</div>
              </div>
            </div>
          </div>

          {/* Close Section */}
          <div className="mb-4">
            <div className="relative h-[20px] mb-10 flex justify-center">
              <div className="w-[85%] relative" ref={sliderRef}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedPercentage}
                  onChange={(e) => setSelectedPercentage(Number(e.target.value) as 25 | 50 | 75 | 100)}
                  className="absolute mt-4 w-full h-2 rounded-[3px] appearance-none bg-transparent cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-[25px]
                    [&::-webkit-slider-thumb]:h-[25px]
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-transparent
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:w-[25px]
                    [&::-moz-range-thumb]:h-[25px]
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-transparent
                    [&::-ms-thumb]:appearance-none
                    [&::-ms-thumb]:w-[25px]
                    [&::-ms-thumb]:h-[25px]
                    [&::-ms-thumb]:rounded-full
                    [&::-ms-thumb]:bg-transparent"
                  style={{
                    background: `linear-gradient(to right, ${getThemeColor()} 0%, ${getThemeColor()} ${selectedPercentage}%, #222226 ${selectedPercentage}%, #222226 100%)`,
                  }}
                />
                <div
                  className="absolute top-0 pointer-events-auto cursor-grab active:cursor-grabbing"
                  style={{ left: `calc(${selectedPercentage}% - 18px)` }}
                  onMouseDown={handleMouseDown}
                >
                  <div className={`mt-[6px] w-[46px] h-[30px] rounded-[12px] bg-[#222226] border-[2px] ${
                    isLong ? 'border-[#23F98A]' : 'border-[#D8515F]'
                  } flex items-center justify-center text-[13px] text-white select-none`}>
                    {selectedPercentage}%
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => setSelectedPercentage(percentage as 25 | 50 | 75 | 100)}
                  className={`
                    flex-1 py-1 px-2 rounded-[10px] text-[14px]
                    ${selectedPercentage === percentage 
                      ? `bg-[#222226] ${isLong ? 'text-zona-green border-zona-green' : 'text-zona-red border-zona-red'} border` 
                      : 'bg-[#222226] text-white border border-transparent hover:bg-[#2f3039] hover:border-[#383945]'
                    }
                  `}
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>

          <div className="text-[#AFAFAF] text-sm mb-4">
            You will close {formatCurrency(transaction.amount, 'USD', 2)} with an estimated 
            <span className={`
              ${estimatedPnL > 0 ? 'text-zona-green' : estimatedPnL < 0 ? 'text-zona-red' : 'text-white'}
            `}>
              {estimatedPnL >= 0 ? ' profit ' : ' loss '} 
              of {formatCurrency(Math.abs(estimatedPnL), 'USD')}
            </span>
            {tradingFees > 0 && ` (including ${formatCurrency(tradingFees, 'USD')} in trading fees)`}
          </div>

          <button
            onClick={onConfirm}
            className={`w-full py-3 ${
              isLong 
                ? 'bg-zona-green hover:bg-black hover:text-zona-green border-zona-green' 
                : 'bg-zona-red hover:bg-black hover:text-zona-red border-zona-red'
            } text-black rounded-lg font-medium border`}
          >
            Market Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeCloseConfirmationModal;