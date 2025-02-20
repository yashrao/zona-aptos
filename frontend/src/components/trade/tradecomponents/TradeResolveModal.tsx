import React, { useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import Image from "next/image";
import {
  getContracts,
  fetchPlayerPositions,
} from "@/contract/contracts";
import { decodeFunctionResult, parseAbi, ReadContractParameters } from "viem";
import { markets, getMarketType } from "@/components/utils/mappings";
import { formatDate } from "@/components/utils/dateutils";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

interface TradeResolveModalProps {
  simulateContractData: any;
  city: string;
  type: string;
  historyFetched: boolean;
  setHistoryFetched: (value: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  transactions: Transaction[];
  timeframes: number[];
  mappedTransactions: any[];
  setMappedTransactions: (value: any[]) => void;
  currentMarketPrice: number;
  currentMarketCurrency: string;
}

const TradeResolveModal: React.FC<TradeResolveModalProps> = ({
  city,
  type,
  historyFetched,
  setHistoryFetched,
  isOpen,
  onClose,
  transaction,
  transactions,
  timeframes,
  mappedTransactions,
  setMappedTransactions,
  currentMarketPrice,
  currentMarketCurrency,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<boolean | null>(
    null,
  );
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const { account, connected, signAndSubmitTransaction } = useWallet();

  function handleClose() {
    setDisplayResult(false);
    onClose();
  }

  const [displayResult, setDisplayResult] = useState(false);

  // Handle the transaction hash after the writeContract call
  //const handleConfirm = async () => {
  //  console.log(simulateContractData);
  //  if (simulateContractData) {
  //    try {
  //      setIsResolving(true);
  //      console.log("Calling writeContractAsync...");

  //      // Log the simulateContractData to ensure it's valid
  //      console.log("Simulate Contract Data:", simulateContractData);

  //      // Call writeContractAsync and wait for the transaction hash
  //      const hash = await writeContractAsync(simulateContractData.request);

  //      if (!hash) {
  //        throw new Error(
  //          "Transaction hash is undefined. Check wallet connection and network.",
  //        );
  //      }

  //      console.log("Transaction hash:", hash);
  //      setTransactionHash(hash); // Set the transaction hash
  //      setDisplayResult(true);
  //      setHistoryFetched(false);
  //    } catch (error) {
  //      console.error("Error resolving position:", error);
  //      setIsResolving(false);
  //    }
  //  }
  //};

  const formatDuration = (duration: string) => {
    const durationMap: { [key: string]: string } = {
      "1h": "1 hour",
      "2h": "2 hours",
      "4h": "4 hours",
      "6h": "6 hours",
      "8h": "8 hours",
      "24h": "24 hours",
    };
    return durationMap[duration] || duration;
  };

  const contracts = getContracts(undefined);

  useEffect(() => {
    async function fetchHistoricalEvents() {
      if (!contracts?.master || !account) return;

      //try {
      //  const logs = await publicClient?.getLogs({
      //    address: contracts.master,
      //    event: parseAbi([
      //      "event PositionResolved(address indexed player, bytes32 indexed oracleKey, uint256 guess, bool long, uint256 timeframe, uint256 timestamp, bool won, uint256 finalValue)",
      //    ])[0],
      //    args: {
      //      player: address,
      //    },
      //    fromBlock: BigInt(contracts.startBlock),
      //    toBlock: "latest",
      //  });

      //  const parsedEvents = logs
      //    ?.map((log: any) => {
      //      if (!log.args) {
      //        console.warn("Skipping log with missing args:", log);
      //        return null;
      //      }

      //      const {
      //        player,
      //        oracleKey,
      //        guess,
      //        long,
      //        timeframe,
      //        timestamp,
      //        won,
      //        finalValue,
      //      } = log.args;

      //      return {
      //        player,
      //        oracleKey: oracleKey?.toString(),
      //        guess: guess?.toString(),
      //        long,
      //        timeframe: timeframe?.toString(),
      //        date: formatDate(timestamp?.toString()), // Format the timestamp
      //        won,
      //        finalValue: finalValue?.toString(),
      //      };
      //    })
      //    .filter(Boolean);
      //  return parsedEvents;
      //} catch (error) {
      //  console.error("Failed to fetch historical events:", error);
      //}
    }

    fetchHistoricalEvents().then((res) => {
      if (res !== undefined) {
        //setResolutionResult(res[res?.length - 1]?.won);
        if (
          contracts !== undefined &&
          account !== undefined
        ) {
          //const calls = buildPlayerPositionsCall(address, contracts);
          //fetchPlayerPositions(publicClient, calls).then((positions) => {
          //  //const newMapped = [];
          //  if (Array.isArray(positions)) {
          //    var index = 0;
          //    const newMappedTransactions = positions
          //      .filter((position: any) => position.isOccupied) // Filter only occupied positions
          //      .map((position) => {
          //        index++;
          //        return {
          //          id: position.oracleKey + "_" + index.toString(),
          //          marketType: markets.find(
          //            (market) => market.oracleKey === position.oracleKey,
          //          )?.type,
          //          entryPrice: Number(position.guess) / 100,
          //          type: position.long ? "long" : "short",
          //          cityName: markets.find(
          //            (market) => market.oracleKey === position.oracleKey,
          //          )?.city,
          //          startTime: Number(position.timestamp) * 1000,
          //          timeframe: Number(position.timeframe),
          //          duration: `${Number(position.timeframe)}h`,
          //          currency: markets.find(
          //            (market) => market.oracleKey === position.oracleKey,
          //          )?.currency,
          //        };
          //      });
          //    setMappedTransactions(newMappedTransactions);
          //  }
          //});
        }
        setIsResolving(false);
      }
    });
  }, []);

  if (!isOpen || !transaction) return null;

  const marketFlag = markets.find((m) => m.city === transaction.cityName)?.flag;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-[600px] bg-[#0F1216] rounded-[16px] p-6 z-50">
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300"
          onClick={handleClose}
        >
          ✕
        </button>

        {!isTxConfirmed || !displayResult ? (
          <>
            {/* Regular modal content */}
            <div className="mb-6">
              <h2 className="text-[24px] font-bold text-white mb-2">
                Resolve Position
              </h2>
              <p className="text-[#AFAFAF]">
                Review your position details before resolving
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Market Info */}
              <div className="flex items-center space-x-3 p-4 bg-[#1A1D21] rounded-[8px]">
                <div className="flex items-center space-x-2">
                  {marketFlag && (
                    <Image
                      src={marketFlag}
                      alt={`${transaction.cityName} flag`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <Image
                    src={
                      transaction.marketType === "Air Quality"
                        ? "/images/logo/aqi_icon.svg"
                        : "/images/logo/rei_icon.svg"
                    }
                    alt={transaction.marketType}
                    width={32}
                    height={32}
                  />
                </div>
                <div>
                  <div className="text-white font-medium">
                    {transaction.cityName}
                  </div>
                  <div className="text-[#AFAFAF] text-sm">
                    {transaction.marketType}
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#1A1D21] rounded-[8px]">
                  <div className="text-[#AFAFAF] mb-1">Entry Value</div>
                  <div className="text-white font-medium">
                    {transaction.currency}{" "}
                    {transaction.entryPrice.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-[#1A1D21] rounded-[8px]">
                  <div className="text-[#AFAFAF] mb-1">Direction</div>
                  <div
                    className={`font-medium ${transaction.type === "long" ? "text-zona-green" : "text-zona-red"}`}
                  >
                    {transaction.type === "long" ? "ABOVE" : "BELOW"}
                  </div>
                </div>
              </div>
            </div>

            <button
              className={`w-full p-4 ${transaction.type === "long"
                ? "bg-zona-green hover:bg-black hover:text-zona-green hover:border-zona-green"
                : "bg-zona-red hover:bg-black hover:text-zona-red hover:border-zona-red"
                } border-2 border-transparent text-black font-bold rounded-[8px] transition-all duration-200`}
              onClick={handleConfirm}
              disabled={isResolving}
            >
              {isResolving ? "Resolving..." : "Confirm Resolution"}
            </button>
          </>
        ) : (
          <div className="text-center py-8" onClick={handleClose}>
            <h2
              className={`text-[42px] font-bold mb-4 ${resolutionResult ? "text-zona-green" : "text-zona-red"
                }`}
            >
              {resolutionResult ? "Congratulations!" : "Better luck next time!"}
            </h2>
            <p className="text-white text-[20px] font-bold leading-relaxed">
              Your Prediction
            </p>
            <p className="text-[#AFAFAF] text-[16px] font-light leading-relaxed mb-10">
              You predicted that the {transaction.cityName}{" "}
              {transaction.marketType} index would be <br />
              {transaction.type === "long" ? "above" : "below"}{" "}
              {transaction.currency} {transaction.entryPrice.toLocaleString()}{" "}
              in {formatDuration(transaction.duration)}.
            </p>
            <p className="text-white text-[20px] font-bold leading-relaxed">
              Your Result
            </p>
            <p className="text-[#AFAFAF] text-[16px] font-light leading-relaxed mb-4">
              {resolutionResult
                ? `As you predicted, the ${transaction.cityName} ${transaction.marketType} index was`
                : `The ${transaction.cityName} ${transaction.marketType} index was not`}
              <br />
              <span
                className={
                  resolutionResult ? "text-zona-green" : "text-zona-red"
                }
              >
                {transaction.type === "long" ? "ABOVE" : "BELOW"} {""}
                {transaction.currency} {transaction.entryPrice.toLocaleString()}
              </span>
            </p>

            <div className="flex justify-center mt-10 mb-6">
              <div className={resolutionResult ? "" : "translate-x-8"}>
                <Image
                  src={
                    resolutionResult
                      ? "/images/logo/resolve_win.svg"
                      : "/images/logo/resolve_loss.svg"
                  }
                  alt={
                    resolutionResult
                      ? "Resolution success"
                      : "Resolution failed"
                  }
                  width={160}
                  height={160}
                />
              </div>
            </div>

            {resolutionResult ? (
              <p className="text-white text-[16px] font-light">
                Your result has been recorded.
                <br />
                Bet more.
              </p>
            ) : (
              <p className="text-white text-[16px] font-light">Bet more.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeResolveModal;
