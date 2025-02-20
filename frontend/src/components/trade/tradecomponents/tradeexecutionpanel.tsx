import React, { useState, useEffect, useCallback } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Transaction, TransactionStatus } from "@/types/transaction";
import {
  getContracts,
  fetchPlayerPositions,
  aptos,
  getPlayerInfo,
  getActivePlayers,
} from "@/contract/contracts";
import { markets, getMarketType } from "@/components/utils/mappings";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";

interface TradeExecutionPanelProps {
  city: string;
  currentIndexPrice: string;
  currentIndexCurrency: string;
  setNewTransaction: (value: any) => void;
  positions: any;
  longSelected: boolean;
  shortSelected: boolean;
  marginRequired: number;
  tradingFees: number;
  leverage: number;
  setPricePosition: (value: boolean) => void;
  setSelectedPrice: (value: number) => void;
  setPositionTaken: (value: boolean) => void;
  isConnected: boolean;
  positionsize: number;
  transactions: any[];
  updateTransaction: (id: string, status: TransactionStatus) => void;
  addTransaction: (transaction: Transaction) => void;
  mappedTransactions: any[];
  setMappedTransactions: (value: any) => void;
  tradeMarketPrice: number;
  tradeMarket: string;
  longPnL: number;
  shortPnL: number;
  longEstLiquidationPrice: string;
  shortEstLiquidationPrice: string;
  oneDayChangePercentage: string;
  historyFetched: boolean;
  setHistoryFetched: (value: boolean) => void;
  duration: string;
  setDuration: (duration: string) => void;
  direction: "Above" | "Below";
  setDirection: (direction: string) => void;
  type: string;
}

const TradeExecutionPanel: React.FC<TradeExecutionPanelProps> = ({
  city,
  currentIndexPrice,
  currentIndexCurrency,
  setNewTransaction,
  positions,
  longSelected,
  shortSelected,
  marginRequired,
  tradingFees,
  leverage,
  setPricePosition,
  setSelectedPrice,
  setPositionTaken,
  isConnected,
  positionsize,
  transactions,
  updateTransaction,
  addTransaction,
  mappedTransactions,
  setMappedTransactions,
  tradeMarketPrice,
  tradeMarket,
  longPnL,
  shortPnL,
  longEstLiquidationPrice,
  shortEstLiquidationPrice,
  oneDayChangePercentage,
  historyFetched,
  setHistoryFetched,
  duration,
  setDuration,
  direction,
  setDirection,
  type,
}) => {
  const { openConnectModal } = useConnectModal();
  const [showPopup, setShowPopup] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);
  const contracts = getContracts(undefined);

  const [pendingTransaction, setPendingTransaction] = useState<any>();
  const { account, signAndSubmitTransaction } = useWallet();

  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [disableBet, setDisableBet] = useState(false);

  //const test = fetchPlayerPositions(
  //  contracts!.master,
  //  account?.address,
  //  "hongkong",
  //  0,
  //);

  getActivePlayers(
    "0xd157a46accb1dd16122980064f2bfb90046ea134a26354ab5d1d7729a26b5855",
  );

  //console.log(getPlayerInfo(account?.address));

  const startProgressBar = useCallback(() => {
    setProgressWidth(100);
    const interval = setInterval(() => {
      setProgressWidth((prevWidth) => {
        if (prevWidth <= 0) {
          clearInterval(interval);
          setShowPopup(false);
          return 0;
        }
        return prevWidth - 1;
      });
    }, 30);
    return interval;
  }, []);

  //const { isLoading: isConfirming, isSuccess: isConfirmed } =
  //  useWaitForTransactionReceipt({ hash });
  //const { data: receipt, isSuccess: isConfirmed } =
  //  useWaitForTransactionReceipt({
  //    hash: transactionHash as `0x${string}`,
  //  });

  //var { data: currentPositions } = useReadContract({
  //  address: contracts?.master,
  //  abi: masterAbi,
  //  functionName: "getPlayerPositions",
  //  args: [
  //    address ?? "0x0",
  //    markets.find((market) => market.city === city)!.identifier,
  //    type === "Real Estate" ? 0 : 1,
  //  ],
  //});

  //useEffect(() => {
  //  if (Array.isArray(currentPositions)) {
  //    const isPositionTaken = currentPositions?.find((position: any) => {
  //      return position.timeframe === BigInt(duration.replace("h", ""));
  //    })?.isOccupied;
  //    if (isPositionTaken) {
  //      setDisableBet(true);
  //    } else {
  //      setDisableBet(false);
  //    }
  //  }
  //}, [duration]);

  function getPredictionText(): string {
    const c = city;
    return `The ${c} ${type.toLowerCase()} index will be `;
  }

  const isLong = direction === "Above" ? true : false;
  const timeframes = ["1h", "2h", "4h", "6h", "8h", "24h"];
  const [betText, setBetText] = useState("Bet");
  const DEBUG = false;

  // TODO: add support for switching between real estate and air quality via the first arg
  //const { data: betData } = useSimulateContract({
  //  address: contracts?.master,
  //  abi: masterAbi,
  //  functionName: "createPosition",
  //  args: [
  //    type === "Real Estate" ? BigInt(0) : BigInt(1),
  //    markets.find((market) => {
  //      return market.city === city;
  //    })!.identifier,
  //    timeframes.indexOf(duration),
  //    isLong,
  //  ],
  //});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPopup) {
      interval = startProgressBar();
    }
    return () => clearInterval(interval);
  }, [showPopup, startProgressBar]);

  //useEffect(() => {
  //  if (isConfirmed) {
  //    setBetText("Bet"); // Reset the button text to "Bet" after confirmation
  //    // Transaction is confirmed
  //    setShowPopup(true);
  //    if (publicClient && contracts && address) {
  //      const cityName = markets.find(
  //        (market) => market.city === city,
  //      )?.identifier;
  //      const categoryId = type === "Real Estate" ? 0 : 1;
  //      var index = 0;
  //      const calls = buildPlayerPositionsCall(address, contracts);
  //    }
  //  }
  //}, [isConfirmed]);

  async function handleTradeExecution() {
    try {
      setBetText("Betting...");
      const identifier = markets.find((m) => {
        return m.city === city;
      })?.identifier;
      const cityNameBytes = new TextEncoder().encode(identifier);
      const transaction: InputTransactionData = {
        data: {
          function: `${contracts!.master}::master::create_position`,
          typeArguments: [],
          functionArguments: [
            contracts!.master, // oracle_addr
            type === "Real Estate" ? 0 : 1,
            cityNameBytes,
            Number(duration.replace("h", "")),
            isLong,
          ],
        },
      };
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setBetText("Bet");
    } catch (error) {
      console.error("Error fetching creating position:", error);
      setBetText("Bet");
      //throw error;
    }
  }

  //async function handleTradeExecution() {
  //  const betData = undefined;
  //  if (betData !== undefined) {
  //    try {
  //      setIsTransactionPending(true);
  //      setBetText("Betting...");

  //      // Write the contract and wait for the user to sign the transaction
  //      //const hash = await writeContractAsync(betData.request);
  //      //setTransactionHash(hash); // Set the transaction hash

  //      // Set the price position and selected price
  //      setPricePosition(true);
  //      //setSelectedPrice(leverage * currentIndexPrice);
  //      setPositionTaken(true);
  //      setHistoryFetched(false);
  //    } catch (error) {
  //      console.error("Transaction failed or was canceled:", error);
  //      setIsTransactionPending(false);
  //      setBetText("Bet"); // Reset the button text to "Bet"
  //    }
  //  } else {
  //    if (DEBUG) {
  //      // For debugging purposes, add the transaction and show the popup immediately
  //      //addTransaction(newTransaction);
  //      setPricePosition(true);
  //      //setSelectedPrice(leverage * currentIndexPrice);
  //      setPositionTaken(true);
  //      setShowPopup(true);
  //    }
  //    console.log(`DEBUG: betData is undefined`);
  //  }
  //}

  // Find the correct flag for the current city
  const currentMarket = markets.find((market) => market.city === city);
  const flagSrc = currentMarket ? currentMarket.flag : "";

  // Update the button to be disabled when conditions aren't met
  const isTradeDisabled = positionsize <= 0 || Number(currentIndexPrice) <= 0;

  const formatLiquidationPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (!numPrice || isNaN(numPrice)) return "-";
    return `$${numPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currentIndexCurrency}`;
  };

  return (
    <div className="col-span-2 relative">
      {/* Combined Panel for Duration, Direction, and Execution Price */}
      <div className="px-4 py-[12px] my-4 bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226]">
        {/* Duration Section */}
        <div className="mb-4">
          <div className="text-[#AFAFAF] mb-2">Duration</div>
          <div className="grid grid-cols-3 gap-2">
            {timeframes.map((time) => {
              const isPositionExists = mappedTransactions?.some(
                (transaction: any) =>
                  transaction.timeframe === parseInt(time.replace("h", "")) &&
                  transaction.cityName === city &&
                  transaction.marketType === type,
              );

              return (
                <div key={time} className="relative group">
                  <button
                    className={`w-full py-2 px-4 rounded-[8px] border hover:bg-[#1A1D21] ${isPositionExists
                      ? "bg-[#1A1D21] text-[#666666] border-transparent cursor-not-allowed opacity-50"
                      : duration === time
                        ? `bg-[#222226] text-${direction === "Above" ? "zona-green" : "zona-red"} font-bold border-${direction === "Above" ? "zona-green" : "zona-red"}`
                        : "bg-[#222226] text-[#AFAFAF] border-transparent"
                      }`}
                    onClick={() => !isPositionExists && setDuration(time)}
                    disabled={isPositionExists}
                  >
                    {time}
                  </button>
                  {isPositionExists && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#222226] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                      Position already active.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Direction Section */}
        <div className="mb-4">
          <div className="text-[#AFAFAF] mb-2">Direction</div>
          <div className="grid grid-cols-2 gap-2">
            {["Above", "Below"].map((dir) => (
              <button
                key={dir}
                className={`py-2 px-4 rounded-[8px] ${direction === dir
                  ? dir === "Above"
                    ? "bg-zona-green text-black font-bold"
                    : "bg-zona-red text-black font-bold"
                  : "bg-[#222226] text-[#AFAFAF] hover:bg-[#1A1D21]"
                  }`}
                onClick={() => setDirection(dir)}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Execution Price */}
        <div className="leading-7">
          <div className="flex items-center justify-between">
            <span className="text-[#AFAFAF]">Execution Value</span>
            <span className="text-[#FFFFFF]">
              {type === "Real Estate"
                ? `${currentIndexCurrency} ${currentIndexPrice}` // Real Estate: SGD 345.64
                : type === "Air Quality"
                  ? `AQHI ${currentIndexPrice}` // Air Quality: AQHI 3.64
                  : currentIndexPrice}{" "}
              {/* Other markets: Just the price */}
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Text */}
      <div className="px-4 py-[18px] my-4 bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226] text-center">
        <p>
          <span className="text-[#AFAFAF]">My prediction is</span>
          <br />
          <span className="text-[#FFFFFF] font-bold">
            {getPredictionText()}
            <br />
            <span
              className={
                direction === "Above" ? "text-zona-green" : "text-zona-red"
              }
            >
              {direction.toLowerCase()}{" "}
              <span style={{ whiteSpace: "nowrap" }}>
                {type === "Real Estate"
                  ? `${currentIndexCurrency} ${currentIndexPrice}`
                  : type === "Air Quality"
                    ? `AQHI ${currentIndexPrice}`
                    : currentIndexPrice}
              </span>{" "}
              in{" "}
              {duration === "1h"
                ? "1 hour"
                : duration === "2h"
                  ? "2 hours"
                  : duration === "4h"
                    ? "4 hours"
                    : duration === "6h"
                      ? "6 hours"
                      : duration === "8h"
                        ? "8 hours"
                        : duration === "24h"
                          ? "24 hours"
                          : duration}
              .
            </span>
          </span>
        </p>
      </div>

      {/* Bet Button */}
      <div className="mt-[2px] mb-[4px] md:mb-0">
        {isConnected ? (
          <button
            type="button"
            className={`w-full p-4 md:p-6 border-2 border-transparent ${disableBet
              ? "bg-[#024a25]"
              : direction === "Above"
                ? "bg-zona-green hover:bg-black hover:text-zona-green hover:border-zona-green"
                : "bg-zona-red hover:bg-black hover:text-zona-red hover:border-zona-red"
              } text-black font-bold rounded-interactive-button transition-all duration-200 ease-in-out`}
            onClick={handleTradeExecution}
            disabled={disableBet}
          >
            {betText}
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default TradeExecutionPanel;
