import React, {
  FC,
  Fragment,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import Layout from "@/components/layouts";
import { TradeModal } from "@/components/trade/tradecomponents/trade-modal";
import { LeverageModal } from "@/components/trade/tradecomponents/leverage-modal";
import MarketSelector from "@/components/trade/tradecomponents/market-selector";
import TradingPanel from "@/components/trade/tradecomponents/market-stats";
import PositionSlider from "@/components/trade/tradecomponents/positionslider";
import MarketInfoPanel from "@/components/trade/tradecomponents/marketinfopanel";
import { CurrencyCode } from "@/components/trade/tradecomponents/types";
import CoinListings from "@/components/trade/tradecomponents/coinlistings";
import Link from "next/link";
import PositionDetailsTable from "@/components/trade/tradecomponents/PositionDetailsTable";
import TradeExecutionPanel from "@/components/trade/tradecomponents/tradeexecutionpanel";
import { updateAmounts } from "@/components/trade/tradecomponents/tradingcalculations";
import dynamic from "next/dynamic";
import TradingViewChart from "@/components/index-graphs/tradingview";
import { useRouter } from "next/router";
import { getContracts, fetchOracleValue } from "@/contract/contracts";
import { Transaction, TransactionStatus } from "@/types/transaction";
import { calculateTradeValues } from "@/components/trade/tradecomponents/tradingcalculations";
import { markets } from "@/components/utils/mappings";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { useIndex } from "@/components/utils/fetchData";

type Direction = "Above" | "Below";

export default function TradingInterface() {
  const { data: hongKongData, isLoading: isLoadingHongKong } = useIndex(
    "hongkong",
    "realestate",
    false,
  );
  const { data: dataSingapore, isLoading: isLoadingSingapore } = useIndex(
    "singapore",
    "realestate",
    false,
  );
  const { data: dataDubai, isLoading: isLoadingDubai } = useIndex(
    "dubai",
    "realestate",
    false,
  );
  const { data: dataLondon, isLoading: isLoadingLondon } = useIndex(
    "london",
    "realestate",
    false,
  );

  // Initialize with Hong Kong data
  const [cityData, setCityData] = useState(hongKongData);
  const [cityDataLoading, setCityDataLoading] = useState(isLoadingHongKong);
  const [city, setCity] = useState("Hong Kong");
  const [type, setType] = useState("Real Estate");
  const [historyFetched, setHistoryFetched] = useState(false);

  // Update cityData when initial data loads
  useEffect(() => {
    if (city === "Hong Kong" && hongKongData) {
      setCityData(hongKongData);
      setCityDataLoading(isLoadingHongKong);
    }
  }, [hongKongData, isLoadingHongKong]);

  // Handle market switching
  useEffect(() => {
    switch (city) {
      case "Hong Kong":
        setCityData(hongKongData);
        setCityDataLoading(isLoadingHongKong);
        break;
      case "Singapore":
        setCityData(dataSingapore);
        setCityDataLoading(isLoadingSingapore);
        break;
      case "Dubai":
        setCityData(dataDubai);
        setCityDataLoading(isLoadingDubai);
        break;
      case "London":
        setCityData(dataLondon);
        setCityDataLoading(isLoadingLondon);
        break;
    }
  }, [
    city,
    hongKongData,
    dataSingapore,
    dataDubai,
    dataLondon,
    isLoadingHongKong,
    isLoadingSingapore,
    isLoadingDubai,
    isLoadingLondon,
  ]);

  //const { data: dataHongKongAir, isLoading: isFetchedHongKongAir } = useIndex(
  //  "hongkong",
  //  "airquality",
  //);
  //const { data: dataDelhiAir, isLoading: isFetchedDelhiAir } = useIndex(
  //  "delhi",
  //  "airquality",
  //);
  //const { data: dataSydney, isLoading: isFetchedSydney } = useIndex(
  //  "sydney",
  //  "realestate",
  //);
  //const { data: dataMelbourne, isLoading: isFetchedMelbourne } = useIndex(
  //  "melbourne",
  //  "realestate",
  //);
  //const { data: dataBrisbane, isLoading: isFetchedBrisbane } = useIndex(
  //  "brisbane",
  //  "realestate",
  //);
  //const { data: dataAdelaide, isLoading: isFetchedAdelaide } = useIndex(
  //  "adelaide",
  //  "realestate",
  //);

  //const timeframes = [1, 2, 4, 6, 8, 24];
  const timeframes = [1, 2, 4, 6, 8, 24, 0]; // DEBUG ONLY

  const accountBalance = 1000;
  const [leverage, setLeverage] = useState(20);
  const [open, setOpen] = useState(false);
  const maxPositionSize = accountBalance * leverage;
  const [positionsize, setPositionsize] = useState(0);
  const [amountHKD, setAmountHKD] = useState(0.0);
  const [amountSGD, setAmountSGD] = useState(0.0);
  const [amountUSD, setAmountUSD] = useState(0);
  const [formattedOraclePrice, setFormattedOraclePrice] = useState("-");

  const [newTransaction, setNewTransaction] = useState<Transaction>();

  const percentageOfMaxPosition = [
    0.25 * maxPositionSize,
    0.5 * maxPositionSize,
    0.75 * maxPositionSize,
    maxPositionSize,
  ];

  const coinListings = [
    {
      flag: "🇭🇰",
      currency: "HKD",
      market: "Hong Kong",
      positionSize: hongKongData?.index?.slice(-1)[0] ?? 0,
      lastDayPosition: hongKongData?.index?.slice(-25)[0] ?? 0,
      entryPrice: hongKongData?.index?.slice(-1)[0] ?? 0,
      oraclePrice: hongKongData?.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (hongKongData?.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (hongKongData?.index?.slice(-1)[0] ?? 0) * 0.13,
      type: "Real Estate",
    },
    //{
    //  flag: "🇭🇰",
    //  currency: "AQHI",
    //  market: "Hong Kong",
    //  positionSize: dataHongKongAir?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataHongKongAir?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataHongKongAir?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataHongKongAir?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataHongKongAir?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: dataHongKongAir?.index?.slice(-1)[0] ?? 0,
    //  type: "Air Quality",
    //},
    //{
    //  flag: "IN",
    //  currency: "AQHI",
    //  market: "Delhi",
    //  positionSize: dataDelhiAir?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataDelhiAir?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataDelhiAir?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataDelhiAir?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataDelhiAir?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: dataDelhiAir?.index?.slice(-1)[0] ?? 0,
    //  type: "Air Quality",
    //},
    {
      flag: "🇸🇬",
      market: "Singapore",
      currency: "SGD",
      positionSize: dataSingapore?.index?.slice(-1)[0] ?? 0,
      lastDayPosition: dataSingapore?.index?.slice(-25)[0] ?? 0,
      entryPrice: dataSingapore?.index?.slice(-1)[0] ?? 0,
      oraclePrice: dataSingapore?.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (dataSingapore?.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (dataSingapore?.index?.slice(-1)[0] ?? 0) * 0.74,
      type: "Real Estate",
    },
    {
      flag: "🇦🇪",
      market: "Dubai",
      currency: "AED",
      positionSize: dataDubai?.index?.slice(-1)[0] ?? 0,
      lastDayPosition: dataDubai?.index?.slice(-25)[0] ?? 0,
      entryPrice: dataDubai?.index?.slice(-1)[0] ?? 0,
      oraclePrice: dataDubai?.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (dataDubai?.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (dataDubai?.index?.slice(-1)[0] ?? 0) * 0.27,
      type: "Real Estate",
    },
    //{
    //  flag: "🇦🇺",
    //  market: "Sydney",
    //  currency: "AUD",
    //  positionSize: dataSydney?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataSydney?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataSydney?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataSydney?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataSydney?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: (dataSydney?.index?.slice(-1)[0] ?? 0) * 0.66,
    //  type: "Real Estate",
    //},
    //{
    //  flag: "🇦🇺",
    //  market: "Melbourne",
    //  currency: "AUD",
    //  positionSize: dataMelbourne?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataMelbourne?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataMelbourne?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataMelbourne?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataMelbourne?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: (dataMelbourne?.index?.slice(-1)[0] ?? 0) * 0.66,
    //  type: "Real Estate",
    //},
    {
      flag: "UK",
      market: "London",
      currency: "GBP",
      positionSize: dataLondon?.index?.slice(-1)[0] ?? 0,
      lastDayPosition: dataLondon?.index?.slice(-25)[0] ?? 0,
      entryPrice: dataLondon?.index?.slice(-1)[0] ?? 0,
      oraclePrice: dataLondon?.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (dataLondon?.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (dataLondon?.index?.slice(-1)[0] ?? 0) * 0.66,
      type: "Real Estate",
    },
    //{
    //  flag: "AU",
    //  market: "Brisbane",
    //  currency: "AUD",
    //  positionSize: dataBrisbane?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataBrisbane?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataBrisbane?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataBrisbane?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataBrisbane?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: (dataBrisbane?.index?.slice(-1)[0] ?? 0) * 0.66,
    //  type: "Real Estate",
    //},
    //{
    //  flag: "AU",
    //  market: "Adelaide",
    //  currency: "AUD",
    //  positionSize: dataAdelaide?.index?.slice(-1)[0] ?? 0,
    //  lastDayPosition: dataAdelaide?.index?.slice(-25)[0] ?? 0,
    //  entryPrice: dataAdelaide?.index?.slice(-1)[0] ?? 0,
    //  oraclePrice: dataAdelaide?.index?.slice(-1)[0] ?? 0,
    //  estLiquidationPrice: (dataAdelaide?.index?.slice(-1)[0] ?? 0) / 2,
    //  estPnL: 100,
    //  fundingFees: -50,
    //  usd: (dataAdelaide?.index?.slice(-1)[0] ?? 0) * 0.66,
    //  type: "Real Estate",
    //},
  ];

  const router = useRouter();
  const [mappedTransactions, setMappedTransactions] = useState<any[]>([]);

  //const { address, isConnected, chainId } = useAccount();
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [oraclePrice, setOraclePrice] = useState<number>();
  const [oraclePriceLoaded, setOraclePriceLoaded] = useState<boolean>(false);

  const contracts = getContracts(undefined);

  function getMarketType(categoryId: number): string {
    return categoryId === 0 ? "Real Estate" : "Air Quality";
  }

  useEffect(() => {
    setOraclePriceLoaded(false);
  }, [city]);

  useEffect(() => {
    // while the oracle price is loading
    setFormattedOraclePrice("-");
    if (!oraclePriceLoaded) {
      (async () => {
        const oracleValue = await fetchOracleValue(
          contracts!.oracle,
          0,
          markets.find((findCity) => findCity.city === city)?.identifier!,
        );
        setOraclePrice(oracleValue);
        setFormattedOraclePrice(oracleValue.toString());
        setOraclePriceLoaded(true);
      })();
      return;
    }
    setFormattedOraclePrice(
      (Number(oraclePrice) / 100).toLocaleString("en-us"),
    );
  }, [oraclePrice, oraclePriceLoaded]);

  //const calls = buildPlayerPositionsCall(address, contracts);

  const positions: any[] = [];

  useEffect(() => {
    var index = 0;
    if (!historyFetched) {
      //fetchPlayerPositions(publicClient, calls).then((positions) => {
      //  setMappedTransactions(
      //    positions
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
      //      }),
      //  );
      //  setHistoryFetched(true);
      //});
    }
  }, [positions, historyFetched]);

  useEffect(() => {
    // USE QUERIYR
    var { selectedCity } = router.query as { selectedCity: string | undefined };
    var { type: selectedType } = router.query as { type: string | undefined };
    if (selectedCity != undefined) {
      setCity(selectedCity);
      setCityData(cityData);
      setCityDataLoading(cityDataLoading);
      setOraclePriceLoaded(false);
    }
    if (selectedType != undefined) {
      setType(type);
    }
  }, [router.query]);

  const handleCloseModal = () => {
    setOpen(false);
    // Reset position state here
    setPricePosition(false);
    setSelectedPrice(0);
    setPositionTaken(false);

    // Reselect the previous option
    if (longSelected) {
      setLongSelected(true);
      setShortSelected(false);
    } else if (shortSelected) {
      setLongSelected(false);
      setShortSelected(true);
    }
  };

  const currentListing = coinListings.find(
    (item) => item.market === city && item.type === type,
  );

  const currentIndexPrice = currentListing?.positionSize || 0;
  const lastDayPosition = currentListing?.lastDayPosition || 0;
  const currentIndexCurrency = currentListing?.currency || "";
  const oneDayChangePercentage = (
    (100 * (currentIndexPrice - lastDayPosition)) /
    currentIndexPrice
  ).toFixed(2);
  const oneDayPriceChange = currentIndexPrice - lastDayPosition;
  const [openLeverageModal, setOpenLeverageModal] = useState(false);
  const leveragePrice = (currentIndexPrice * leverage).toLocaleString("en-us");
  const currentIndexPriceInUSD =
    coinListings.find((item) => item.market === city)?.usd || 0;
  const leveragePriceInUSD = currentIndexPriceInUSD * leverage;
  const initialSquareFoot = (7.8 * positionsize) / currentIndexPrice;
  const [inputtedSquareFoot, setInputtedSquareFoot] =
    useState(initialSquareFoot);
  const [pricePosition, setPricePosition] = useState(false);
  const marginRequired = positionsize / leverage;
  const longEstLiquidationPrice = (
    currentIndexPrice -
    (currentIndexPrice * (marginRequired * 0.9)) / marginRequired / leverage
  ).toFixed(2);
  const shortEstLiquidationPrice = (
    currentIndexPrice +
    (currentIndexPrice * (marginRequired * 0.9)) / marginRequired / leverage
  ).toFixed(2);
  const tradingFees = Number((positionsize * (0.1 / 100)).toFixed(2));
  const [selectedPrice, setSelectedPrice] = useState(0);
  const estimatedLongPnL = (
    (currentIndexPrice - lastDayPosition) * inputtedSquareFoot -
    tradingFees
  ).toFixed(2);
  const estimatedShortPnL = (
    (lastDayPosition - currentIndexPrice) * inputtedSquareFoot -
    tradingFees
  ).toFixed(2);
  const updateAmounts = (newPositionSize: number) => {
    const newUsdValue = Number(newPositionSize.toFixed(2));
    setAmountUSD(newUsdValue);
    setAmountHKD(Number((newUsdValue * 7.8).toFixed(2)));
    setAmountSGD(Number((newUsdValue * 1.3).toFixed(2)));
    setPositionsize(newUsdValue);
  };

  const updateAmountsWrapper = (usd: string) => {
    updateAmounts(Number(usd));
  };

  const [selectedTrade, setSelectedTrade] = useState<{
    market: string;
    price: number;
  } | null>(null);

  const handleTradeSelection = (market: string, price: number) => {
    setSelectedTrade({ market, price });
  };

  const positionSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPositionSize = Number(event.target.value);
    updateAmounts(newPositionSize);
  };

  const leverageSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = Number(event.target.value);
    setLeverage(newLeverage);
    const newMaxPositionSize = accountBalance * newLeverage;
    const newPositionSize =
      (positionsize / maxPositionSize) * newMaxPositionSize;
    updateAmounts(newPositionSize);
  };

  const [tenTimesSelected, setTenTimesSelected] = useState(false);
  const [longSelected, setLongSelected] = useState(true);
  const [shortSelected, setShortSelected] = useState(false);
  const [marketSelected, setMarketSelected] = useState(true);
  const [limitSelected, setLimitSelected] = useState(false);

  const safeCurrentIndexCurrency = (currency: string): CurrencyCode => {
    return ["HKD", "SGD", "AED", "GBP", "AUD"].includes(currency)
      ? (currency as CurrencyCode)
      : "HKD";
  };

  const [positionTaken, setPositionTaken] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
    console.log("Modal closed");
  }, []);

  const openModal = useCallback(() => {
    setOpen(true);
    console.log("Modal opened");
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Transaction) => {
    console.log("TradingInterfaceDesktop: Adding transaction:", transaction);
    setTransactions((prevTransactions) => {
      const newTransactions = [...prevTransactions, transaction];
      console.log("New transactions state:", newTransactions);
      return newTransactions;
    });
  };

  const entryPrice = currentListing?.entryPrice || 0;

  const tradeState = {
    accountBalance,
    leverage,
    positionSize: positionsize,
    currentIndexPrice,
    lastDayPosition,
    entryPrice,
  };

  const { longPnL, shortPnL } = calculateTradeValues(tradeState);

  const updateTransaction = (id: string, status: TransactionStatus) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, status } : transaction,
      ),
    );
  };

  const removeTransaction = (id: string) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id),
    );
  };

  const [duration, setDuration] = useState("1h");
  const [direction, setDirection] = useState<Direction>("Above");

  const handleDirectionChange = (newDirection: string) => {
    if (newDirection === "Above" || newDirection === "Below") {
      setDirection(newDirection);
    }
  };

  return (
    <Fragment>
      <Layout
        title={`${currentIndexPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${city} | Zona`}
        button={true}
        app={true}
      >
        <div className="grid grid-cols-12 gap-x-4 my-[100px] w-full px-8 pb-20">
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-6">
            <div className="h-[40px]">
              <MarketSelector
                coinListings={coinListings}
                city={city}
                setCity={setCity}
                markets={markets}
                type={type}
                setType={setType}
              />
            </div>

            <div className="h-[235px] mt-[8px]">
              <TradeExecutionPanel
                city={city}
                currentIndexPrice={formattedOraclePrice}
                currentIndexCurrency={currentIndexCurrency}
                positions={positions}
                setNewTransaction={setNewTransaction}
                longSelected={longSelected}
                shortSelected={shortSelected}
                marginRequired={marginRequired}
                tradingFees={tradingFees}
                leverage={leverage}
                setPricePosition={setPricePosition}
                setSelectedPrice={setSelectedPrice}
                setPositionTaken={setPositionTaken}
                isConnected={connected}
                positionsize={positionsize}
                transactions={transactions}
                updateTransaction={updateTransaction}
                addTransaction={addTransaction}
                mappedTransactions={mappedTransactions}
                setMappedTransactions={setMappedTransactions}
                tradeMarketPrice={selectedTrade?.price ?? currentIndexPrice}
                tradeMarket={selectedTrade?.market ?? city}
                longPnL={longPnL}
                shortPnL={shortPnL}
                longEstLiquidationPrice={longEstLiquidationPrice}
                shortEstLiquidationPrice={shortEstLiquidationPrice}
                oneDayChangePercentage={oneDayChangePercentage}
                historyFetched={historyFetched}
                setHistoryFetched={setHistoryFetched}
                duration={duration}
                setDuration={setDuration}
                direction={direction}
                setDirection={handleDirectionChange}
                type={type}
              />
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 flex flex-col gap-4">
            <div className="h-[63px]">
              <MarketInfoPanel
                city={city}
                type={type}
                oraclePrice={formattedOraclePrice}
                timeframes={timeframes}
                markets={markets}
                oneDayPriceChange={oneDayPriceChange}
                oneDayChangePercentage={Number(oneDayChangePercentage)}
                currentIndexCurrency={currentIndexCurrency}
              />
            </div>

            <div className="flex-grow">
              <div className="w-full mt-[8px] bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226] overflow-hidden">
                <div className="mt-0 pt-[0px] origin-center h-full pl-[10px] pt-[10px]">
                  <TradingViewChart
                    city={
                      city as "Hong Kong" | "Singapore" | "Dubai" | "Sydney"
                    }
                    data={cityData}
                    isLoading={cityDataLoading}
                    type={type}
                  />
                </div>
              </div>
              <div className="h-[210px] mt-[14px] mb-0">
                <PositionDetailsTable
                  city={city}
                  type={type}
                  //transactions2={transactions} // DEBUG ONLY
                  historyFetched={historyFetched}
                  setHistoryFetched={setHistoryFetched}
                  mappedTransactions={mappedTransactions}
                  setMappedTransactions={setMappedTransactions}
                  newTransaction={newTransaction}
                  timeframes={timeframes}
                  positions={positions}
                  updateTransaction={updateTransaction}
                  removeTransaction={removeTransaction}
                  currentIndexPrice={currentIndexPrice}
                  currentIndexCurrency={currentIndexCurrency}
                  coinListings={coinListings}
                  direction={direction}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-1 bg-[#0F1216] border-t border-[#222226]"></div>
      </Layout>

      <TradeModal
        openModal={open}
        setOpen={handleCloseModal}
        longSelected={longSelected}
        shortSelected={shortSelected}
        leverage={leverage}
        handleSliderChange={positionSliderChange}
        transactions={transactions}
        updateTransaction={updateTransaction}
        coinListings={coinListings}
      />

      <LeverageModal
        shortSelected={shortSelected}
        openModal={openLeverageModal}
        setOpen={setOpenLeverageModal}
        leverage={leverage}
        leverageSliderChange={leverageSliderChange}
      />
    </Fragment>
  );
}
