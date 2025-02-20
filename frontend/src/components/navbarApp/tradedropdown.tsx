import React, { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PriceTracker from "../markets/PriceTracker";
import { PriceData } from "../markets/pricedata";
import { markets } from "../utils/mappings";

interface TradeDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  className: string;
}

const TradeDropdown: React.FC<TradeDropdownProps> = ({
  isOpen,
  onToggle,
  onClose,
  className,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const handleMouseEnter = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const handleMouseLeave = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleClick = useCallback(() => {
    router.push("/trade");
  }, [router]);

  const handleClickCity = useCallback(
    (city: string, marketType: string) => {
      let selectedCity = city;
      let type = marketType;

      if (marketType === "Air Quality") {
        selectedCity = city;
        type = "Air Quality";
      } else {
        selectedCity = city;
        type = "Real Estate";
      }

      router.push({
        pathname: "/trade",
        query: {
          selectedCity,
          type,
        },
      });
    },
    [router],
  );

  const handlePricesUpdate = useCallback(
    (newPrices: Record<string, PriceData | null>) => {
      console.log("New prices received:", newPrices); // Add this line for debugging
      setPrices(newPrices);
    },
    [],
  );

  const calculateChange = (
    current: number | undefined,
    previous: number | undefined,
  ): string => {
    if (!current || !previous) return "-";
    if (previous === 0) return current > 0 ? "∞" : "0.00%";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = (
      Math.round((change + Number.EPSILON) * 100) / 100
    ).toFixed(2);
    return (change > 0 ? "+" : "") + formattedChange + "%";
  };

  const filteredMarkets = markets.filter((market) => {
    if (activeTab === "all") return true;
    if (activeTab === "air-quality") return market.type === "Air Quality";
    if (activeTab === "real-estate") return market.type === "Real Estate";
    return true;
  });

  //console.log("Current prices state:", prices); // Add this line for debugging

  const isActive = router.pathname.startsWith("/trade");

  // Add effect to close MarketSelector when TradeDropdown opens
  useEffect(() => {
    if (isOpen) {
      // Dispatch a custom event when TradeDropdown opens
      const event = new CustomEvent("closeMarketSelector");
      window.dispatchEvent(event);
    }
  }, [isOpen]);

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center rounded-lg px-3 py-2 text-[14px] transition-colors duration-200 ${className}`}
        onClick={handleClick}
      >
        <span>Trade</span>
        <svg
          className="w-4 h-4 ml-1 fill-current transition-transform duration-200"
          viewBox="0 0 20 20"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 w-[550px] -mt-1 rounded-[8px] shadow-lg bg-card-border ring-1 ring-card-border ring-opacity-5 transition-all duration-200 z-50">
          <PriceTracker onPricesUpdate={handlePricesUpdate} />
          <div className="p-2">
            <div className="w-full bg-card-bg rounded-[8px] p-2 transition-colors duration-200">
              <div className="flex space-x-4 mb-4 px-2 py-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-[#2f3039] text-white"
                      : "text-text-grey hover:text-white"
                  }`}
                >
                  All Markets
                </button>
                <button
                  onClick={() => setActiveTab("air-quality")}
                  className={`px-3 py-1 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                    activeTab === "air-quality"
                      ? "bg-[#2f3039] text-white"
                      : "text-text-grey hover:text-white"
                  }`}
                >
                  Air Quality
                </button>
                <button
                  onClick={() => setActiveTab("real-estate")}
                  className={`px-3 py-1 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                    activeTab === "real-estate"
                      ? "bg-[#2f3039] text-white"
                      : "text-text-grey hover:text-white"
                  }`}
                >
                  Real Estate
                </button>
              </div>
              <div className="grid grid-cols-[60%_40%] gap-2 p-2 font-medium text-white">
                <div className="mx-4">
                  <div className="text-[14px]">Market</div>
                  {activeTab === "air-quality" && (
                    <div className="text-[14px] text-[#AFAFAF] mt-3">
                      Coming soon.
                    </div>
                  )}
                </div>
                <div className="text-[14px] text-right mx-4">Index Value</div>
              </div>
              {filteredMarkets.map((market, index) => {
                const priceData = prices[market.city];
                const change = calculateChange(
                  priceData?.current,
                  priceData?.ytd,
                );
                const isPositive = !change.startsWith("-");
                const marketTypeIcon =
                  market.type === "Air Quality"
                    ? "/images/logo/aqi_icon.svg"
                    : "/images/logo/rei_icon.svg";

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[60%_40%] gap-2 p-2 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2f3039] hover:to-[#383945] rounded-lg group"
                    onClick={() => handleClickCity(market.city, market.type)}
                  >
                    <div className="flex items-center space-x-2 mx-4">
                      <img
                        src={market.flag}
                        alt={market.city}
                        className="w-7 h-7 rounded-full"
                      />
                      <img
                        src={marketTypeIcon}
                        alt={market.type}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="text-[14px] font-medium text-text-grey group-hover:text-white transition-colors duration-200">
                        {market.city} {market.type}
                      </span>
                    </div>
                    <div className="text-right mx-4">
                      <div className="text-[14px] text-text-grey group-hover:text-white transition-colors duration-200">
                        {priceData?.current
                          ? `${market.currency} ${Number(priceData.current).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          : "-"}
                      </div>
                      <div
                        className={`text-[14px] ${
                          isPositive ? "text-[#23F98A]" : "text-[#D8515F]"
                        } transition-colors duration-200`}
                      >
                        {change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDropdown;
