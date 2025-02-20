import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import PriceTracker from "@/components/markets/PriceTracker";
import { PriceData } from "@/components/markets/pricedata";

interface Market {
  city: string;
  code: string;
  flag: string;
  type: string;
}

interface CoinListing {
  currency: string;
  market: string;
  positionSize: number;
  lastDayPosition: number;
  entryPrice: number;
  oraclePrice: number;
  estLiquidationPrice: number;
  estPnL: number;
  fundingFees: number;
  usd: number;
  type: string;
}

interface MarketSelectorProps {
  coinListings: any[];
  city: string;
  setCity: (city: string) => void;
  markets: any[];
  type: string;
  setType: (type: string) => void;
  isMobile?: boolean; // Add this prop
}

const MarketSelector: React.FC<MarketSelectorProps> = ({
  coinListings,
  city,
  setCity,
  type,
  setType,
  markets,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelectMarket = (
    market: string,
    type: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setCity(market);
    setType(type);
    setIsOpen(false);
  };

  const handlePricesUpdate = useCallback(
    (newPrices: Record<string, PriceData | null>) => {
      setPrices(newPrices);
    },
    [],
  );

  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "∞" : "0.00%";
    const change = ((current - previous) / previous) * 100;
    const formattedChange = (
      Math.round((change + Number.EPSILON) * 100) / 100
    ).toFixed(2);
    return change > 0 ? `+${formattedChange}%` : `${formattedChange}%`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add effect to listen for TradeDropdown opening
  useEffect(() => {
    const handleCloseMarketSelector = () => {
      setIsOpen(false);
    };

    window.addEventListener("closeMarketSelector", handleCloseMarketSelector);

    return () => {
      window.removeEventListener(
        "closeMarketSelector",
        handleCloseMarketSelector,
      );
    };
  }, []);

  const selectedMarket = markets.find(
    (m) => m.city === city && m.type === type,
  );
  const selectedCoinListing = coinListings.find(
    (listing) => listing.market === city && listing.type === type,
  );

  // Separate price lookup based on market type
  const selectedPrice =
    type === "Real Estate"
      ? prices[`${selectedMarket?.city} Index`]
      : prices[`${selectedMarket?.city} Air Quality Index`]; // Use Air Quality specific price

  const change = selectedPrice
    ? calculateChange(selectedPrice.current, selectedPrice["24h"])
    : selectedCoinListing
      ? calculateChange(
          selectedCoinListing.positionSize,
          selectedCoinListing.lastDayPosition,
        )
      : "0.00%";

  const priceChangeColor = !change.startsWith("-")
    ? "text-[#23F98A]"
    : "text-[#D8515F]";
  const marketType = selectedMarket ? selectedMarket.type : "";
  const marketIndexText = `${selectedMarket?.city} ${marketType}`;

  const [activeTab, setActiveTab] = useState("all");

  const filteredMarkets = markets.filter((market) => {
    if (activeTab === "all") return true;
    if (activeTab === "air-quality") return market.type === "Air Quality";
    if (activeTab === "real-estate") return market.type === "Real Estate";
    return true;
  });

  const [screenWidth, setScreenWidth] = useState(1920);
  const [screenScale, setScreenScale] = useState(1);

  useEffect(() => {
    const updateScreenMetrics = () => {
      setScreenWidth(window.innerWidth);
      setScreenScale(window.devicePixelRatio);
    };

    // Initial check
    updateScreenMetrics();

    // Add event listeners
    window.addEventListener("resize", updateScreenMetrics);
    window.matchMedia("(resolution: 1dppx)").addListener(updateScreenMetrics);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateScreenMetrics);
      window
        .matchMedia("(resolution: 1dppx)")
        .removeListener(updateScreenMetrics);
    };
  }, []);

  // Dynamic size helper functions
  const getIconSize = () => {
    if (isMobile) return 24;

    // Base size based on screen width
    let baseSize;
    if (screenWidth >= 1700) baseSize = 34;
    else if (screenWidth >= 1600) baseSize = 34;
    else if (screenWidth >= 1500) baseSize = 34;
    else if (screenWidth >= 1400) baseSize = 32;
    else if (screenWidth >= 1300) baseSize = 30;
    else if (screenWidth >= 1200) baseSize = 28;
    else if (screenWidth >= 1100) baseSize = 27;
    else if (screenWidth >= 1000) baseSize = 26;
    else if (screenWidth >= 900) baseSize = 25;
    else if (screenWidth >= 800) baseSize = 24;
    else if (screenWidth >= 700) baseSize = 23;
    else if (screenWidth >= 600) baseSize = 22;
    else baseSize = 20;

    // Adjust for scale
    if (screenScale >= 2) return Math.floor(baseSize * 1); // 200% scale
    if (screenScale >= 1.75) return Math.floor(baseSize * 1); // 175% scale
    if (screenScale >= 1.5) return Math.floor(baseSize * 1); // 150% scale
    if (screenScale >= 1.25) return Math.floor(baseSize * 1); // 125% scale
    if (screenScale >= 1.1) return Math.floor(baseSize * 1); // 110% scale
    return baseSize; // 100% scale
  };

  const getTextSize = () => {
    if (isMobile) return "text-[11px]";

    // Base size based on screen width
    let baseSize;
    if (screenWidth >= 1700) baseSize = 17;
    else if (screenWidth >= 1600) baseSize = 15;
    else if (screenWidth >= 1500) baseSize = 14;
    else if (screenWidth >= 1400) baseSize = 13;
    else if (screenWidth >= 1300) baseSize = 12;
    else if (screenWidth >= 1200) baseSize = 11;
    else if (screenWidth >= 1100)
      baseSize = 10; //150% scale
    else if (screenWidth >= 1000) baseSize = 10;
    else if (screenWidth >= 900) baseSize = 10;
    else if (screenWidth >= 800) baseSize = 10;
    else if (screenWidth >= 700) baseSize = 10;
    else if (screenWidth >= 600) baseSize = 10;
    else baseSize = 10;

    // Adjust for scale
    if (screenScale >= 2) baseSize = Math.floor(baseSize * 1); // 200% scale
    if (screenScale >= 1.75) baseSize = Math.floor(baseSize * 1); // 175% scale
    if (screenScale >= 1.5) baseSize = Math.floor(baseSize * 1); // 150% scale
    if (screenScale >= 1.25) baseSize = Math.floor(baseSize * 1); // 125% scale
    if (screenScale >= 1.1) baseSize = Math.floor(baseSize * 1); // 110% scale

    return `text-[${baseSize}px]`;
  };

  const getDropdownTextSize = () => {
    if (isMobile) return "text-[11px]";

    // Base size based on screen width
    let baseSize;
    if (screenWidth >= 1700)
      baseSize = 14; //100% scale
    else if (screenWidth >= 1600) baseSize = 13;
    else if (screenWidth >= 1500)
      baseSize = 13; //110% scale
    else if (screenWidth >= 1400) baseSize = 13;
    else if (screenWidth >= 1300)
      baseSize = 12; //125% scale
    else if (screenWidth >= 1200) baseSize = 12;
    else if (screenWidth >= 1100)
      baseSize = 10; //150% scale
    else if (screenWidth >= 1000) baseSize = 10;
    else if (screenWidth >= 900) baseSize = 10;
    else if (screenWidth >= 800) baseSize = 10;
    else if (screenWidth >= 700) baseSize = 10;
    else if (screenWidth >= 600) baseSize = 10;
    else baseSize = 10;

    // Adjust for scale
    if (screenScale >= 2) baseSize = Math.floor(baseSize * 1); // 200% scale
    if (screenScale >= 1.75) baseSize = Math.floor(baseSize * 1); // 175% scale
    if (screenScale >= 1.5) baseSize = Math.floor(baseSize * 1); // 150% scale
    if (screenScale >= 1.25) baseSize = Math.floor(baseSize * 1); // 125% scale
    if (screenScale >= 1.1) baseSize = Math.floor(baseSize * 1); // 110% scale

    return `text-[${baseSize}px]`;
  };

  return (
    <div
      className={`w-full rounded-[8px] border-[0.5px] border-[#222226] ${isMobile ? "h-[45px]" : "h-[70px]"} relative transition-all duration-300 ease-in-out ${isOpen ? "bg-[#1A1D24]" : "bg-[#0F1216]"}`}
      ref={dropdownRef}
    >
      <PriceTracker onPricesUpdate={handlePricesUpdate} />
      <div
        className={`flex items-center justify-between ${isMobile ? "p-2" : "p-3"} cursor-pointer h-full transition-all duration-300 ease-in-out`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center space-x-2">
          {selectedMarket && (
            <div className="flex items-center space-x-2">
              <Image
                src={selectedMarket.flag}
                alt={`${selectedMarket.city} flag`}
                width={getIconSize()}
                height={getIconSize()}
              />
              <Image
                src={
                  selectedMarket.type === "Air Quality"
                    ? "/images/logo/aqi_icon.svg"
                    : "/images/logo/rei_icon.svg"
                }
                alt={`${selectedMarket.type} icon`}
                width={getIconSize()}
                height={getIconSize()}
              />
            </div>
          )}
          <span className={`text-white font-medium ${getTextSize()}`}>
            {marketIndexText}
          </span>
          <span
            className={`text-[#AFAFAF] ${isOpen ? "rotate-180" : "rotate-0"} transition-transform duration-300 ${getTextSize()}`}
            style={{ display: "inline-block" }}
          >
            ▼
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`${getTextSize()} text-[#FFFFFF] font-medium`}>
            {selectedPrice
              ? `${selectedCoinListing?.currency} ${selectedPrice.current.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : selectedCoinListing
                ? `${selectedCoinListing.currency} ${selectedCoinListing.positionSize.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "-"}
          </div>
          <div className={`${getTextSize()} ${priceChangeColor}`}>{change}</div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-[8px] shadow-lg bg-card-border ring-1 ring-card-border ring-opacity-5 transition-all duration-200 z-50">
          <div className="p-2">
            <div className="w-full bg-card-bg rounded-[8px] p-2 transition-colors duration-200">
              <div className="flex space-x-4 mb-4 px-2 py-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg ${getDropdownTextSize()} font-medium transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-[#2f3039] text-white"
                      : "text-text-grey hover:text-white"
                  }`}
                >
                  All Markets
                </button>
                <button
                  onClick={() => setActiveTab("air-quality")}
                  className={`px-3 py-1 rounded-lg ${getDropdownTextSize()} font-medium transition-all duration-200 ${
                    activeTab === "air-quality"
                      ? "bg-[#2f3039] text-white"
                      : "text-text-grey hover:text-white"
                  }`}
                >
                  Air Quality
                </button>
                <button
                  onClick={() => setActiveTab("real-estate")}
                  className={`px-3 py-1 rounded-lg ${getDropdownTextSize()} font-medium transition-all duration-200 ${
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
                  <div className={`${getDropdownTextSize()}`}>Market</div>
                  {activeTab === "air-quality" && (
                    <div
                      className={`${getDropdownTextSize()} text-[#AFAFAF] mt-3`}
                    >
                      Coming soon.
                    </div>
                  )}
                </div>
                <div className={`${getDropdownTextSize()} text-right mx-4`}>
                  Index Value
                </div>
              </div>
              {filteredMarkets.map((market, index) => {
                const coinListing = coinListings.find(
                  (listing) =>
                    listing.market === market.city &&
                    listing.type === market.type,
                );
                const priceData = prices[`${market.city} Index`];
                const change = priceData
                  ? calculateChange(priceData.current, priceData["24h"])
                  : coinListing
                    ? calculateChange(
                        coinListing.positionSize,
                        coinListing.lastDayPosition,
                      )
                    : "0.00%";
                const priceChangeColor = !change.startsWith("-")
                  ? "text-[#23F98A]"
                  : "text-[#D8515F]";
                const marketIndexText = `${market.city} ${market.type}`;
                const marketTypeIcon =
                  market.type === "Air Quality"
                    ? "/images/logo/aqi_icon.svg"
                    : "/images/logo/rei_icon.svg";

                return (
                  <div
                    key={market.city}
                    className="grid grid-cols-[60%_40%] gap-2 p-2 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2f3039] hover:to-[#383945] rounded-lg group"
                    onClick={(e) =>
                      handleSelectMarket(market.city, market.type, e)
                    }
                  >
                    <div className="flex items-center space-x-2 mx-4">
                      <Image
                        src={market.flag}
                        alt={`${market.city} flag`}
                        width={getIconSize() - 6}
                        height={getIconSize() - 6}
                        className="rounded-full"
                      />
                      <Image
                        src={marketTypeIcon}
                        alt={`${market.type} icon`}
                        width={getIconSize() - 6}
                        height={getIconSize() - 6}
                        className="rounded-full"
                      />
                      <span
                        className={`${getDropdownTextSize()} font-medium text-text-grey group-hover:text-white transition-colors duration-200`}
                      >
                        {marketIndexText}
                      </span>
                    </div>
                    <div className="text-right mx-4">
                      <div
                        className={`${getDropdownTextSize()} text-text-grey group-hover:text-white transition-colors duration-200`}
                      >
                        {priceData
                          ? `${coinListing?.currency} ${priceData.current.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : coinListing
                            ? `${coinListing.currency} ${coinListing.positionSize.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "-"}
                      </div>
                      <div
                        className={`${getDropdownTextSize()} ${priceChangeColor} transition-colors duration-200`}
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

export default MarketSelector;
