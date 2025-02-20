import React, { useState, useRef, useEffect } from "react";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import { useWaitForTransactionReceipt } from "wagmi";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
  useWatchContractEvent,
} from "wagmi";
import { Transaction, TransactionStatus } from "@/types/transaction";
import TradeCloseConfirmationModal from "./TradeCloseConfirmationModal";
import TradeResolveModal from "@/components/trade/tradecomponents/TradeResolveModal";
import { getContracts, fetchPositionEvents} from "@/contract/contracts";
import { parseAbi, ReadContractParameters } from "viem";
import { markets, getMarketType } from "@/components/utils/mappings";
import { formatDate } from "@/components/utils/dateutils";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

interface PositionDetailsTableProps {
  city: string;
  type: string;
  newTransaction: Transaction | undefined;
  timeframes: number[];
  positions: any;
  historyFetched: boolean;
  setHistoryFetched: (value: boolean) => void;
  //transactions2: Transaction[];
  mappedTransactions: any;
  setMappedTransactions: (value: any) => void;
  updateTransaction: (id: string, status: TransactionStatus) => void;
  removeTransaction: (id: string) => void;
  currentIndexPrice: number;
  currentIndexCurrency: string;
  coinListings: any[];
  direction: "Above" | "Below";
}

function formatGuess(guess: number, currency: string) {
  function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return numberWithCommas(guess) + " " + currency;
}

const calculateTimeRemaining = (
  startTime: number, // Timestamp in milliseconds
  duration: string, // Duration string (e.g., "1h", "2h", "4h")
): string => {
  const now = Date.now();

  // Helper function to convert duration string to milliseconds
  const getDurationMs = (dur: string): number => {
    const value = parseInt(dur);
    if (dur.endsWith("h")) return value * 60 * 60 * 1000; // Hours to ms
    if (dur.endsWith("m")) return value * 60 * 1000; // Minutes to ms
    if (dur.endsWith("s")) return value * 1000; // Seconds to ms
    return 0;
  };

  const durationMs = getDurationMs(duration);

  // Align the start time to the beginning of the hour
  const alignedStartTime = new Date(startTime);
  alignedStartTime.setMinutes(0, 0, 0);
  const alignedStartTimeMs = alignedStartTime.getTime();

  const endTimeMs = alignedStartTimeMs + durationMs;

  const timeRemainingMs = endTimeMs - now;

  if (timeRemainingMs <= 0) {
    return "Expired";
  }

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    // Build the formatted string
    let result = "";
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0 || hours === 0) {
      result += `${minutes}m `;
    }
    if (minutes === 0 && seconds > 0) {
      result += `${seconds}s`;
    }

    return result.trim();
  };

  return formatTimeRemaining(timeRemainingMs);
};

const PositionDetailsTable: React.FC<PositionDetailsTableProps> = ({
  city,
  type,
  historyFetched,
  setHistoryFetched,
  newTransaction,
  timeframes,
  //transactions2, // DEBUG ONLY
  setMappedTransactions,
  mappedTransactions,
  positions,
  updateTransaction,
  removeTransaction,
  currentIndexPrice,
  currentIndexCurrency,
  coinListings,
  direction,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [estimatedPnL, setEstimatedPnL] = useState(0);
  const [tradingFees, setTradingFees] = useState(0);
  const [selectedMarketInfo, setSelectedMarketInfo] = useState<
    (typeof markets)[0] | undefined
  >(undefined);
  const [isExpiredTransactions, setIsExpiredTransactions] = useState<string[]>(
    [],
  );
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const contracts = getContracts(undefined);

  //const { data: hash, writeContract } = useWriteContract();
//  const { data: resolveData } = useSimulateContract({
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      try {
        if (!contracts?.master || !account) return;
        //if (parsedEvents !== undefined) {
        //  setEvents(parsedEvents);
        //}
        const res = await fetchPositionEvents(contracts?.master);
        console.log(res)
      } catch (error) {
        console.error("Failed to fetch historical events:", error);
      }
    };

    fetchHistoricalEvents();
  }, [account, contracts?.master, connected]);

  //useWatchContractEvent({
  //  address: contracts?.master,
  //  abi: masterAbi,
  //  eventName: "PositionResolved",
  //  onLogs: (logs) => {
  //    const newEvents = logs
  //      .map((log: any) => {
  //        if (!log.args) {
  //          console.warn("Skipping log with missing args:", log);
  //          return null;
  //        }

  //        const {
  //          player,
  //          oracleKey,
  //          guess,
  //          long,
  //          timeframe,
  //          timestamp,
  //          won,
  //          finalValue,
  //        } = log.args;

  //        return {
  //          player,
  //          oracleKey: oracleKey.toString(),
  //          guess: guess.toString(),
  //          long,
  //          timeframe: timeframe.toString(),
  //          timestamp: timestamp.toString(),
  //          date: formatDate(timestamp?.toString()),
  //          won,
  //          finalValue: finalValue.toString(),
  //        };
  //      })
  //      .filter(Boolean);

  //    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
  //  },
  //});

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const expiredIds: string[] = [];
      mappedTransactions.forEach((transaction: any) => {
        const remainingTime = calculateTimeRemaining(
          transaction.startTime,
          transaction.duration,
        );
        if (remainingTime === "Expired") {
          expiredIds.push(transaction.id);
        }
      });
      setIsExpiredTransactions(expiredIds);
    }, 1000);

    return () => clearInterval(timer);
  }, [mappedTransactions]);

  const handleCloseClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    const marketInfo = markets.find((m) => m.city === transaction.market);
    setSelectedMarketInfo(marketInfo);
    const currentMarketPrice =
      coinListings.find((listing) => listing.market === transaction.market)
        ?.positionSize ?? currentIndexPrice;
    const entryPrice = transaction.entryPrice;
    const pnl =
      transaction.type === "long"
        ? (currentMarketPrice - entryPrice) * transaction.amount
        : (entryPrice - currentMarketPrice) * transaction.amount;
    setEstimatedPnL(pnl);
    const fees = transaction.amount * currentMarketPrice * 0.001;
    setTradingFees(fees);
    setIsModalOpen(true);
  };

  const handleConfirmClose = () => {
    if (selectedTransaction) {
      removeTransaction(selectedTransaction.id);
    }
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setSelectedMarketInfo(undefined);
  };

  const handleResolveClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsResolveModalOpen(true);
  };

  function renderHistoryContent() {
    return (
      <div className="relative">
        {/* Desktop view - hide on mobile */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-[#0F1216]">
              <table className="w-full min-w-[800px] table-fixed">
                <thead className="border-b border-gray-700">
                  <tr className="bg-[#0F1216]">
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-4 bg-[#0F1216]">
                      Date
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-4 bg-[#0F1216]">
                      Market
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-4 bg-[#0F1216]">
                      Market Type
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-3 bg-[#0F1216]">
                      Entry Value
                    </th>
                    <th className="w-[10%] py-3.5 text-left text-[12px] font-semibold text-white px-3 bg-[#0F1216]">
                      Duration
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-3 bg-[#0F1216]">
                      Direction
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-2 bg-[#0F1216]">
                      Result
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body - updated scrollbar styling */}
            <div
              className="h-[270px] overflow-y-scroll overflow-x-hidden
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-[#ffffff33]
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-zona-green
              [&::-webkit-scrollbar-thumb]:transition-colors
              [&::-webkit-scrollbar-thumb]:duration-1000"
            >
              <table className="w-full min-w-[800px] table-fixed bg-[#0F1216]">
                <tbody className="divide-y divide-gray-800">
                  {!events || events.length === 0 ? (
                    <tr className="bg-[#0F1216]">
                      <td
                        colSpan={7}
                        className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-500 text-left bg-[#0F1216]"
                      >
                        No trade history found.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {events
                        .sort(
                          (a, b) => Number(b.timestamp) - Number(a.timestamp),
                        )
                        .slice(0, 5)
                        .map((event, index) => {
                          const market = markets.find(
                            (m) => m.oracleKey === event.oracleKey,
                          );
                          const marketType = market?.type || "Unknown";

                          return (
                            <tr key={index} className="bg-[#0F1216]">
                              <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white bg-[#0F1216]">
                                {event.date}
                              </td>
                              <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white bg-[#0F1216]">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 mr-0 flex items-center justify-left">
                                    <Image
                                      src={
                                        market?.flag ||
                                        "/images/logo/default_logo.svg"
                                      }
                                      alt={market?.city || "Unknown"}
                                      width={24}
                                      height={24}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                          "/images/logo/default_logo.svg";
                                      }}
                                    />
                                  </div>
                                  <div>{market?.city || "Unknown"}</div>
                                </div>
                              </td>
                              <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white bg-[#0F1216]">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 mr-0 flex items-center justify-left">
                                    <Image
                                      src={
                                        marketType === "Real Estate"
                                          ? "/images/logo/rei_icon.svg"
                                          : "/images/logo/aqi_icon.svg"
                                      }
                                      alt={marketType}
                                      width={24}
                                      height={24}
                                    />
                                  </div>
                                  <div>{marketType}</div>
                                </div>
                              </td>
                              <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white bg-[#0F1216]">
                                {market?.currency || ""}{" "}
                                {Number(event.guess / 100).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </td>
                              <td className="w-[10%] whitespace-nowrap py-4 px-4 text-[12px] text-white bg-[#0F1216]">
                                {event.timeframe}h
                              </td>
                              <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] bg-[#0F1216]">
                                <span
                                  className={
                                    event.long
                                      ? "text-zona-green"
                                      : "text-zona-red"
                                  }
                                >
                                  {event.long ? "Above" : "Below"}
                                </span>
                              </td>
                              <td
                                className={`whitespace-nowrap py-4 px-4 text-[12px] font-bold ${
                                  event.won
                                    ? "text-zona-green"
                                    : "text-zona-red"
                                } bg-[#0F1216]`}
                              >
                                {event.won ? "Win" : "Loss"}
                              </td>
                            </tr>
                          );
                        })}
                      <tr className="bg-[#0F1216] hover:bg-[#222226] transition-colors duration-200">
                        <td
                          colSpan={7}
                          className="whitespace-nowrap py-4 px-4 text-sm font-medium text-white text-center cursor-pointer"
                          onClick={() => (window.location.href = "/portfolio")}
                        >
                          Show more
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile view - hide on desktop */}
        <div className="md:hidden space-y-1">
          {!events || events.length === 0 ? (
            <div className="text-sm font-medium text-gray-500 text-center">
              No trade history found.
            </div>
          ) : (
            events
              .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
              .slice(0, 5)
              .map((event, index) => {
                const market = markets.find(
                  (m) => m.oracleKey === event.oracleKey,
                );
                return (
                  <div
                    key={index}
                    className="bg-[#000000] border border-[#222226] rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">Date</span>
                      <span className="text-[12px] text-white">
                        {event.date}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">Market</span>
                      <div className="flex items-center gap-2">
                        <Image
                          src={market?.flag || "/images/logo/default_logo.svg"}
                          alt={market?.city || "Unknown"}
                          width={20}
                          height={20}
                        />
                        <span className="text-[12px] text-white">
                          {market?.city || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Market Type
                      </span>
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            market?.type === "Real Estate"
                              ? "/images/logo/rei_icon.svg"
                              : "/images/logo/aqi_icon.svg"
                          }
                          alt={market?.type || "Unknown"}
                          width={20}
                          height={20}
                        />
                        <span className="text-[12px] text-white">
                          {market?.type || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Entry Value
                      </span>
                      <span className="text-[12px] text-white">
                        {market?.currency || ""}{" "}
                        {Number(event.guess / 100).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Duration
                      </span>
                      <span className="text-[12px] text-white">
                        {event.timeframe}h
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Direction
                      </span>
                      <span
                        className={`text-[12px] ${event.long ? "text-zona-green" : "text-zona-red"}`}
                      >
                        {event.long ? "Above" : "Below"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">Result</span>
                      <span
                        className={`text-[12px] font-bold ${event.won ? "text-zona-green" : "text-zona-red"}`}
                      >
                        {event.won ? "Win" : "Loss"}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    );
  }

  function renderTableContent() {
    return (
      <div className="relative">
        {/* Desktop view - hide on mobile */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-[#0F1216]">
              <table className="w-full min-w-[800px] table-fixed">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-4">
                      Market
                    </th>
                    <th className="w-[20%] py-3.5 text-left text-[12px] font-semibold text-white px-4">
                      Market Type
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-3">
                      Entry Value
                    </th>
                    <th className="w-[10%] py-3.5 text-left text-[12px] font-semibold text-white px-3">
                      Duration
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-3">
                      Direction
                    </th>
                    <th className="w-[15%] py-3.5 text-left text-[12px] font-semibold text-white px-3 relative">
                      <div className="relative inline-block group">
                        <span className="border-b border-dotted border-white cursor-help">
                          Time to Resolution
                        </span>
                        <span className="absolute top-full left-1/3 transform -translate-x-1/2 mt-2 px-3 py-3 bg-[#222226] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none text-center">
                          Resolutions occur at
                          <br />
                          the beginning of each hour.
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body - updated scrollbar styling */}
            <div
              className="h-[270px] overflow-y-scroll overflow-x-hidden
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-[#ffffff33]
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-zona-green
              [&::-webkit-scrollbar-thumb]:transition-colors
              [&::-webkit-scrollbar-thumb]:duration-1000"
            >
              <table className="w-full min-w-[800px] table-fixed bg-[#0F1216]">
                <tbody className="divide-y divide-gray-800">
                  {mappedTransactions.length > 0 ? (
                    mappedTransactions.map((transaction: any) => {
                      const remainingTime = calculateTimeRemaining(
                        transaction.startTime,
                        transaction.duration,
                      );
                      const isExpired =
                        isExpiredTransactions.includes(transaction.id) ||
                        remainingTime === "Expired";
                      return (
                        <tr key={transaction.id} className="bg-[#0F1216]">
                          <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white">
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-0 flex items-center justify-left">
                                <Image
                                  src={
                                    markets.find(
                                      (m) => m.city === transaction.cityName,
                                    )?.flag || "/images/logo/default_logo.svg"
                                  }
                                  alt={transaction.cityName}
                                  width={24}
                                  height={24}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "/images/logo/default_logo.svg";
                                  }}
                                />
                              </div>
                              <div>{transaction.cityName}</div>
                            </div>
                          </td>
                          <td className="w-[20%] whitespace-nowrap py-4 px-4 text-[12px] text-white">
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-0 flex items-center justify-left">
                                <Image
                                  src={
                                    transaction.marketType === "Real Estate"
                                      ? "/images/logo/rei_icon.svg"
                                      : "/images/logo/aqi_icon.svg"
                                  }
                                  alt={transaction.marketType}
                                  width={24}
                                  height={24}
                                />
                              </div>
                              <div>{transaction.marketType}</div>
                            </div>
                          </td>
                          <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white">
                            {transaction.currency}{" "}
                            {Number(transaction.entryPrice).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </td>
                          <td className="w-[10%] whitespace-nowrap py-4 px-4 text-[12px] text-white">
                            {transaction.timeframe}h
                          </td>
                          <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px]">
                            <span
                              className={
                                transaction.type === "long"
                                  ? "text-zona-green"
                                  : "text-zona-red"
                              }
                            >
                              {transaction.type === "long" ? "Above" : "Below"}
                            </span>
                          </td>
                          <td className="w-[15%] whitespace-nowrap py-4 px-4 text-[12px] text-white">
                            {isExpired ? (
                              <button
                                type="button"
                                className={`w-100% p-2 rounded-[8px] border-2 border-transparent bg-[#222226] ${
                                  transaction.type === "long"
                                    ? "hover:text-zona-green hover:border-zona-green"
                                    : "hover:text-zona-red hover:border-zona-red"
                                }`}
                                onClick={() => handleResolveClick(transaction)}
                              >
                                Resolve
                              </button>
                            ) : (
                              remainingTime
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="bg-[#0F1216]">
                      <td
                        colSpan={6}
                        className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-500 text-left"
                      >
                        No positions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile view - hide on desktop */}
        <div className="md:hidden space-y-1">
          {mappedTransactions.length === 0 ? (
            <div className="text-sm font-medium text-gray-500 text-center">
              No positions found.
            </div>
          ) : (
            mappedTransactions.map((transaction: any) => {
              const remainingTime = calculateTimeRemaining(
                transaction.startTime,
                transaction.duration,
              );
              const isExpired =
                isExpiredTransactions.includes(transaction.id) ||
                remainingTime === "Expired";

              return (
                <div
                  key={transaction.id}
                  className="bg-[#000000] border border-[#222226] rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">Market</span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          markets.find((m) => m.city === transaction.cityName)
                            ?.flag || "/images/logo/default_logo.svg"
                        }
                        alt={transaction.cityName}
                        width={20}
                        height={20}
                      />
                      <span className="text-[12px] text-white">
                        {transaction.cityName}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">
                      Market Type
                    </span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          transaction.marketType === "Real Estate"
                            ? "/images/logo/rei_icon.svg"
                            : "/images/logo/aqi_icon.svg"
                        }
                        alt={transaction.marketType}
                        width={20}
                        height={20}
                      />
                      <span className="text-[12px] text-white">
                        {transaction.marketType}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">
                      Entry Value
                    </span>
                    <span className="text-[12px] text-white">
                      {transaction.currency}{" "}
                      {Number(transaction.entryPrice).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">Duration</span>
                    <span className="text-[12px] text-white">
                      {transaction.timeframe}h
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">
                      Direction
                    </span>
                    <span
                      className={`text-[12px] ${transaction.type === "long" ? "text-zona-green" : "text-zona-red"}`}
                    >
                      {transaction.type === "long" ? "Above" : "Below"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#AFAFAF]">
                      Time to Resolution
                    </span>
                    {isExpired ? (
                      <button
                        type="button"
                        className={`text-[12px] p-2 rounded-[8px] border-2 border-transparent bg-[#222226] ${
                          transaction.type === "long"
                            ? "hover:text-zona-green hover:border-zona-green"
                            : "hover:text-zona-red hover:border-zona-red"
                        }`}
                        onClick={() => handleResolveClick(transaction)}
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[12px] text-white">
                        {remainingTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111111] rounded-[8px] border-[0.5px] border-[#222226] -mt-2">
      <div
        className="overflow-x-auto overflow-y-hidden
        [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar]:w-0
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-[#ffffff33]
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-zona-green
        [&::-webkit-scrollbar-thumb]:transition-colors
        [&::-webkit-scrollbar-thumb]:duration-1000"
      >
        <div className="min-w-[300px] md:min-w-[800px]">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-t-[6px] bg-[#222226] p-1">
              {["Position", "History"].map((tab, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-[12px] font-medium leading-5 text-white
                     focus:outline-none focus:ring-0
                     ${selected ? "bg-[#111111] shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white"}`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="h-[310px] overflow-y-auto scrollbar-hide md:overflow-y-hidden">
              <Tab.Panel>
                <div className="w-full">{renderTableContent()}</div>
              </Tab.Panel>
              <Tab.Panel className="bg-[#0F1216]">
                <div className="w-full h-full bg-[#0F1216]">
                  {renderHistoryContent()}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
      <TradeCloseConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmClose}
        transaction={selectedTransaction}
        estimatedPnL={estimatedPnL}
        tradingFees={tradingFees}
        marketInfo={selectedMarketInfo}
        currentMarketPrice={
          coinListings.find(
            (listing) => listing.market === selectedTransaction?.market,
          )?.positionSize ?? currentIndexPrice
        }
      />
      <TradeResolveModal
        city={city}
        type={type}
        historyFetched={historyFetched}
        setHistoryFetched={setHistoryFetched}
        transactions={mappedTransactions}
        timeframes={timeframes}
        mappedTransactions={mappedTransactions}
        setMappedTransactions={setMappedTransactions}
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        currentMarketPrice={
          coinListings.find(
            (listing) => listing.market === selectedTransaction?.market,
          )?.positionSize ?? currentIndexPrice
        }
        currentMarketCurrency={currentIndexCurrency}
      />
    </div>
  );
};

export default PositionDetailsTable;
