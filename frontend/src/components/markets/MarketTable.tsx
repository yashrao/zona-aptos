import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import PriceTracker from "./PriceTracker";
import { PriceData } from "./pricedata";
import { useRouter } from "next/router";
import { markets } from "../utils/mappings";
import Image from "next/image";

interface MarketTableProps {
  currencyDisplay: "local" | "usd";
  isMobile?: boolean;
}

const MarketTable: React.FC<MarketTableProps> = ({
  currencyDisplay,
  isMobile = false,
}) => {
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const [sortColumn, setSortColumn] = useState<"24h" | "7d" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [marketsDisplay, setMarketsDisplay] = useState<any[]>(markets);

  const handlePricesUpdate = useCallback(
    (newPrices: Record<string, PriceData | null>) => {
      console.log("Prices updated in MarketTable:", newPrices);
      setPrices(newPrices);
    },
    [],
  );

  const roundToTwoDecimalPlaces = (num: number) => {
    return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
  };

  const calculateChange = (
    current: number | undefined,
    previous: number | undefined,
  ): string => {
    if (!current || !previous) return "-";
    if (previous === 0) return current > 0 ? "∞" : "0.00%";
    const change = ((current - previous) / previous) * 100;
    return roundToTwoDecimalPlaces(change) + "%";
  };

  const handleSort = (column: "24h" | "7d") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const router = useRouter();

  const handleClickMarket = useCallback(
    (city: string) => {
      router.push({
        pathname: "/trade",
        query: { selectedCity: city },
      });
    },
    [router],
  );

  const sortedMarkets = useMemo(() => {
    if (!sortColumn) return markets;
    return [...markets].sort((a, b) => {
      const aChange = calculateChange(
        prices[a.city]?.current,
        prices[a.city]?.[sortColumn as "24h" | "7d"],
      );
      const bChange = calculateChange(
        prices[b.city]?.current,
        prices[b.city]?.[sortColumn as "24h" | "7d"],
      );
      return sortDirection === "asc"
        ? parseFloat(aChange) - parseFloat(bChange)
        : parseFloat(bChange) - parseFloat(aChange);
    });
  }, [markets, prices, sortColumn, sortDirection]);

  const renderChangeCell = (
    change: string,
    value: number | undefined,
    currency: string,
  ) => (
    <td
      className={`bg-[#0F1216] py-4 px-4 text-left group-hover:bg-[#1A1D21] transition-colors duration-200 ${change.startsWith("-") ? "text-[#D8515F]" : "text-[#23F98A]"}`}
    >
      <div>{change}</div>
      <div className="text-xs text-[#AFAFAF]">
        {value
          ? (() => {
              if (currencyDisplay === "local") {
                return `${currency} ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
              } else {
                const usdPrice = convertToUSD(value, currency);
                return `USD ${usdPrice.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`;
              }
            })()
          : "-"}
      </div>
    </td>
  );

  const renderSortableHeader = (title: string, column: "24h" | "7d") => (
    <th
      className={`px-4 font-light cursor-pointer ${sortColumn === column ? "text-white" : "text-[#AFAFAF]"}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        <span className={sortColumn === column ? "font-bold" : ""}>
          {title}
        </span>
        <span className="ml-2 flex flex-col items-center justify-center h-3 leading-[1.3]">
          <span
            className={`text-[0.5em] transition-opacity duration-300 ease-in-out ${sortColumn === column && sortDirection === "asc" ? "opacity-100" : "opacity-30"}`}
          >
            ▲
          </span>
          <span
            className={`text-[0.5em] transition-opacity duration-300 ease-in-out ${sortColumn === column && sortDirection === "desc" ? "opacity-100" : "opacity-30"}`}
          >
            ▼
          </span>
        </span>
      </div>
    </th>
  );

  const convertToUSD = (amount: number, currency: string): number => {
    // This is a placeholder exchange rate. In a real application, you'd fetch real-time exchange rates.
    const exchangeRates: Record<string, number> = {
      HKD: 0.13,
      SGD: 0.74,
      AED: 0.27,
      AUD: 0.66,
      GBP: 1.24,
    };
    return amount * (exchangeRates[currency] || 1);
  };

  const formatPrice = (
    price: number,
    display: string,
    currency: string,
  ): string => {
    const value = display === "local" ? price : convertToUSD(price, currency);
    const currencySymbol = display === "local" ? currency : "USD";
    return `${currencySymbol} ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatChange = (change: number): string => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  const formatVolume = (
    volume: number,
    display: string,
    currency: string,
  ): string => {
    const value = display === "local" ? volume : convertToUSD(volume, currency);
    const currencySymbol = display === "local" ? currency : "USD";
    return `${currencySymbol} ${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? "text-zona-green" : "text-zona-red";
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <PriceTracker onPricesUpdate={handlePricesUpdate} />

        {sortedMarkets.map((market, index) => {
          const priceData = prices[market.city];
          const change24h = calculateChange(
            priceData?.current,
            priceData?.["24h"],
          );
          const change7d = calculateChange(
            priceData?.current,
            priceData?.["7d"],
          );

          return (
            <div
              key={index}
              className="bg-[#000000] border border-[#222226] rounded-lg p-4 space-y-2"
              onClick={() => handleClickMarket(market.city)}
            >
              {/* Market (formerly City) */}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#AFAFAF]">Market</span>
                <div className="flex items-center gap-2">
                  <Image
                    src={market.flag}
                    alt={market.city}
                    width={20}
                    height={20}
                  />
                  <span className="text-[12px] text-white">{market.city}</span>
                </div>
              </div>

              {/* Market Type */}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#AFAFAF]">Market Type</span>
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo/rei_icon.svg"
                    alt="Real Estate"
                    width={20}
                    height={20}
                  />
                  <span className="text-[12px] text-white">Real Estate</span>
                </div>
              </div>

              {/* Index Value */}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#AFAFAF]">Index Value</span>
                <span className="text-[12px] text-white">
                  {priceData
                    ? `${currencyDisplay === "local" ? market.currency : "USD"} ${(currencyDisplay === "local" ? priceData.current : convertToUSD(priceData.current, market.currency)).toLocaleString("en-US", { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2,
                        useGrouping: true 
                      })}`
                    : "Loading"}
                </span>
              </div>

              {/* 24h Change */}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#AFAFAF]">24h Change</span>
                <span
                  className={`text-[12px] ${change24h.startsWith("-") ? "text-zona-red" : "text-zona-green"}`}
                >
                  {change24h}
                </span>
              </div>

              {/* 7d Change */}
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#AFAFAF]">7d Change</span>
                <span
                  className={`text-[12px] ${change7d.startsWith("-") ? "text-zona-red" : "text-zona-green"}`}
                >
                  {change7d}
                </span>
              </div>

              {/* Trade Button - with synchronized hover effect */}
              <div className="flex justify-center pt-2">
                <span className="text-[#FFFFFF] hover:text-[#23F98A] transition-all duration-200 group">
                  Trade
                  <span className="text-xs ml-0.5 text-[#FFFFFF] group-hover:text-[#23F98A] transition-all duration-200">
                    ↗
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <PriceTracker onPricesUpdate={handlePricesUpdate} />
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[#AFAFAF] text-[14px] text-left">
            <th className="px-4 font-light">Market</th>
            <th className="px-4 font-light">Market Type</th>
            <th className="px-4 font-light">Index Value</th>
            {renderSortableHeader("24h Change", "24h")}
            {renderSortableHeader("7D Change", "7d")}
            <th className="px-4 font-light"></th>
          </tr>
        </thead>
        <tbody>
          {sortedMarkets.map((market) => {
            const priceData = prices[market.city];
            return (
              <tr
                key={market.city}
                onClick={() => handleClickMarket(market.city)}
                className="cursor-pointer group"
              >
                <td className="bg-[#0F1216] py-4 px-4 rounded-l-xl group-hover:bg-[#1A1D21] transition-colors duration-200">
                  <div className="flex items-center">
                    <img
                      src={market.flag}
                      alt={`${market.city} logo`}
                      className="w-8 h-8 mr-2"
                    />
                    <span className="text-white">{market.city}</span>
                  </div>
                </td>
                <td className="bg-[#0F1216] py-4 px-4 group-hover:bg-[#1A1D21] transition-colors duration-200">
                  <div className="flex items-center">
                    <img
                      src="/images/logo/rei_icon.svg"
                      alt="Real Estate"
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-white">Real Estate</span>
                  </div>
                </td>
                <td className="bg-[#0F1216] py-4 px-4 text-white group-hover:bg-[#1A1D21] transition-colors duration-200">
                  {priceData
                    ? (() => {
                        if (currencyDisplay === "local") {
                          return `${market.currency} ${priceData.current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        } else {
                          const usdPrice = convertToUSD(priceData.current, market.currency);
                          return `USD ${usdPrice.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}`;
                        }
                      })()
                    : "Loading"}
                </td>
                {renderChangeCell(
                  calculateChange(priceData?.current, priceData?.["24h"]),
                  priceData?.["24h"],
                  market.currency,
                )}
                {renderChangeCell(
                  calculateChange(priceData?.current, priceData?.["7d"]),
                  priceData?.["7d"],
                  market.currency,
                )}
                <td className="bg-[#0F1216] py-4 px-4 rounded-r-xl group-hover:bg-[#1A1D21] transition-colors duration-200">
                  <span className="text-[#AFAFAF] hover:text-[#23F98A] transition-all duration-200">
                    Trade
                  </span>
                  <span className="text-xs ml-0.5 text-[#AFAFAF] group-hover:text-[#23F98A] transition-all duration-200">
                    ↗
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
