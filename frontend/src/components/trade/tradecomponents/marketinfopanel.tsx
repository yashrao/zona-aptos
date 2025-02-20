import React, { useState, useEffect, useRef } from "react";
import { useReadContract, useAccount } from "wagmi";
import { getContracts } from "@/contract/contracts";

interface MarketInfoPanelProps {
  city: string;
  type: string;
  oraclePrice: string;
  timeframes: number[];
  markets: any[];
  oneDayPriceChange: number;
  oneDayChangePercentage: number;
  currentIndexCurrency: string;
}

interface InfoItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

const formatUTCTime = (date: Date) => {
  return date.toISOString().split("T")[1].split(".")[0] + " (UTC)";
};

const calculateChange = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? "∞" : "0.00%";
  const change = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(change * 100) / 100; // Round to 2 decimal places
  const formattedChange = roundedChange.toFixed(2); // Ensure 2 decimal places
  return change > 0 ? `+${formattedChange}%` : `${formattedChange}%`;
};

export default function MarketInfoPanel({
  city,
  type,
  oraclePrice,
  timeframes,
  markets,
  oneDayPriceChange,
  oneDayChangePercentage,
  currentIndexCurrency,
}: MarketInfoPanelProps) {
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contracts = getContracts(undefined);

  const [currentTime, setCurrentTime] = useState(formatUTCTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatUTCTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const infoItems = [
    {
      label: "24H Change",
      value: `${
        type === "Real Estate"
          ? `${oneDayPriceChange > 0 ? "+" : "-"}${currentIndexCurrency} ${Math.abs(
              oneDayPriceChange,
            ).toLocaleString("en-us", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : `${oneDayPriceChange > 0 ? "+" : "-"}AQHI ${Math.abs(
              oneDayPriceChange,
            ).toLocaleString("en-us", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
      } | ${calculateChange(oneDayPriceChange, oneDayPriceChange - oneDayPriceChange * (oneDayChangePercentage / 100))}`,
      valueClassName:
        oneDayPriceChange > 0
          ? "text-[#23F98A]"
          : oneDayPriceChange < 0
            ? "text-[#D8515F]"
            : "text-[#AFAFAF]",
    },
    {
      label: "Oracle Value",
      value:
        type === "Real Estate"
          ? `${currentIndexCurrency} ${oraclePrice}`
          : `AQHI ${oraclePrice}`,
    },
    {
      label: "Market Type",
      value: type,
    },
    {
      label: "UTC Time",
      value: currentTime,
    },
  ];

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const InfoItem: React.FC<InfoItemProps> = ({
    label,
    value,
    valueClassName = "text-[#FFFFFF]",
  }) => (
    <div className="flex-shrink-0 min-w-[150px] flex flex-col justify-center h-full">
      <p className="text-[13px] text-[#AFAFAF]">{label}</p>
      <span className={`text-[15px] font-light ${valueClassName}`}>
        {value}
      </span>
    </div>
  );

  const Divider: React.FC = () => (
    <div className="h-[20px] w-[1px] bg-[#222226] mx-4 my-auto"></div>
  );

  return (
    <div className="w-full h-[70px] bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226] overflow-hidden">
      <div
        className="overflow-x-auto h-full
          [&::-webkit-scrollbar]:h-[4px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-[#333333]
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-zona-green
          active:[&::-webkit-scrollbar-thumb]:bg-zona-green
          [&::-webkit-scrollbar-thumb]:transition-colors
          [&::-webkit-scrollbar-thumb]:duration-300"
        ref={scrollContainerRef}
      >
        <div
          className="flex items-center space-x-4 px-6 py-00 h-full"
          style={{ minWidth: isMobile ? "max-content" : "100%" }}
        >
          {infoItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <InfoItem
                label={item.label}
                value={item.value}
                valueClassName={item.valueClassName}
              />
              {index < infoItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
