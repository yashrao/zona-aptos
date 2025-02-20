import React, { useState, useEffect } from "react";

type CurrencyCode = "HKD" | "SGD" | "AED" | "AUD" | "GBP" | "AQHI";

interface MarketStatsProps {
  tenTimesSelected: boolean;
  setTenTimesSelected: React.Dispatch<React.SetStateAction<boolean>>;
  longSelected: boolean;
  setLongSelected: React.Dispatch<React.SetStateAction<boolean>>;
  shortSelected: boolean;
  setShortSelected: React.Dispatch<React.SetStateAction<boolean>>;
  marketSelected: boolean;
  setMarketSelected: React.Dispatch<React.SetStateAction<boolean>>;
  limitSelected: boolean;
  setLimitSelected: React.Dispatch<React.SetStateAction<boolean>>;
  leverage: number;
  setOpenLeverageModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndexCurrency: CurrencyCode;
  city: string | null;
  amountUSD: string;
  updateAmounts: (usd: string) => void;
  accountBalance: number; // Added this property
}

export default function TradingPanel({
  tenTimesSelected,
  setTenTimesSelected,
  longSelected,
  setLongSelected,
  shortSelected,
  setShortSelected,
  marketSelected,
  setMarketSelected,
  limitSelected,
  setLimitSelected,
  leverage,
  setOpenLeverageModal,
  currentIndexCurrency,
  city,
  amountUSD,
  accountBalance,
  updateAmounts,
}: MarketStatsProps) {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!longSelected && !shortSelected) {
      setLongSelected(true);
    }
  }, []);

  useEffect(() => {
    // Only update display value when not editing
    if (!isEditing) {
      setDisplayValue(amountUSD);
    }
  }, [amountUSD]);

  const handleUSDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Allow empty input
    if (value === "") {
      setDisplayValue("");
      return;
    }

    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit decimal places to 2 if decimal exists
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Convert to number for comparison
    let numericValue = parseFloat(value);

    // Handle NaN case
    if (isNaN(numericValue)) {
      setDisplayValue("");
      return;
    }

    // Calculate maximum allowed value
    const maxAllowedValue = accountBalance * leverage;

    // Cap at maximum value if exceeded
    if (numericValue > maxAllowedValue) {
      value = maxAllowedValue.toFixed(2);
    }

    // Update display value with the raw input
    setDisplayValue(value);

    // Always update with two decimal places for the underlying value
    if (value) {
      updateAmounts(parseFloat(value).toFixed(2));
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setFocusedInput(null);

    // If empty or invalid, default to 0.00
    if (!displayValue) {
      setDisplayValue("0.00");
      updateAmounts("0.00");
      return;
    }

    const numericValue = parseFloat(displayValue);
    const maxAllowedValue = accountBalance * leverage;
    const limitedValue = Math.min(numericValue, maxAllowedValue);

    // Format to 2 decimal places
    const formattedValue = limitedValue.toFixed(2);
    setDisplayValue(formattedValue);
    updateAmounts(formattedValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setFocusedInput("usd");
  };

  const getBorderColor = (inputName: string) => {
    if (focusedInput === inputName) {
      if (longSelected) return "border-[#00F39E]";
      if (shortSelected) return "border-[#F84F4F]";
      return "border-white";
    }
    return "border-transparent";
  };

  const getInputTextColor = (value: string) => {
    return parseFloat(value) === 0 ? "text-[#AFAFAF]" : "text-white";
  };

  return (
    <div className="col-span-2 bg-[#0F1216] rounded-[8px] grid grid-cols-2 p-3 gap-x-[8px] gap-y-4 border-[0.5px] border-[#222226]">
      <button
        type="button"
        className="col-span-2 w-full bg-[#222226] p-2 text-white rounded-[6px] text-[14px] font-medium hover:bg-[#37363E] transition-colors duration-200"
        onClick={() => {
          setTenTimesSelected(!tenTimesSelected);
          setOpenLeverageModal(true);
        }}
      >
        <span className="text-[#AFAFAF]">Leverage: </span>
        <span>{leverage}x</span>
        <span className="ml-1 text-[10px] leading-none text-[#AFAFAF]">▼</span>
      </button>
      <button
        className={`col-span-1 px-4 py-[6px] bg-[#222226] rounded-[6px] w-full hover:bg-[#37363E] transition-colors duration-200 ${
          longSelected
            ? "border-[#00F39E] border text-[#00F39E] font-medium"
            : "text-white"
        }`}
        onClick={() => {
          setLongSelected(true);
          setShortSelected(false);
        }}
      >
        <span className="text-[16px]">Long</span>
      </button>
      <button
        className={`col-span-1 px-4 py-[6px] bg-[#222226] rounded-[6px] hover:bg-[#37363E] transition-colors duration-200 ${
          shortSelected
            ? "border-[#F84F4F] border font-medium text-[#F84F4F]"
            : "text-white"
        }`}
        type="button"
        onClick={() => {
          setShortSelected(true);
          setLongSelected(false);
        }}
      >
        <span className="text-[16px]">Short</span>
      </button>
      <div className="col-span-2 flex items-center space-x-4 mt-2">
        <button
          className={`text-left text-[16px] transition-all duration-200 ${
            marketSelected ? "text-white font-bold " : "text-[#AFAFAF]"
          }`}
          type="button"
          onClick={() => {
            setMarketSelected(true);
            setLimitSelected(false);
          }}
        >
          Market
        </button>
        <button
          className={`text-left text-[16px] transition-all duration-200 ${
            limitSelected ? "text-white font-bold " : "text-[#AFAFAF]"
          }`}
          type="button"
          onClick={() => {
            setLimitSelected(true);
            setMarketSelected(false);
          }}
        >
          Limit
        </button>
      </div>

      <div
        className={`col-span-2 bg-[#222226] w-full rounded-[6px] p-3 mt-2 border ${getBorderColor("usd")} transition-colors duration-200`}
      >
        <div className="flex justify-between items-center">
          <span className="text-[#AFAFAF] text-[16px] pl-1 whitespace-nowrap">
            Amount (USD)
          </span>
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-1">
            <input
              className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${getInputTextColor(displayValue)} text-right outline-none bg-transparent border-none ring-0 focus:outline-none focus:ring-0 focus:border-none p-0 text-[16px] leading-[24px] h-[24px] w-full`}
              onChange={handleUSDChange}
              value={displayValue}
              type="number"
              step="any"
              max={accountBalance * leverage}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <span className="text-[#AFAFAF] text-[16px] whitespace-nowrap leading-[24px]">
              USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
