import React, {
  FC,
  Fragment,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import Layout from "@/components/layouts";
//import { useIndex } from "@/zona/google-sheets/hooks/use-index";
import { useIndex } from "@/components/utils/fetchData";
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
import { useAccount } from "wagmi";
import { Transaction, TransactionStatus } from "@/types/transaction";
import { calculateTradeValues } from "@/components/trade/tradecomponents/tradingcalculations";
import { useReadContract, usePublicClient } from "wagmi";
import {
  getContracts,
  masterAbi,
  zonaOracleAbi,
  fetchPlayerPositions,
  buildPlayerPositionsCall,
} from "@/contract/contracts";
import { markets } from "@/components/utils/mappings";
import { ReadContractParameters } from "viem";

type Direction = "Above" | "Below";

export default function TradingInterface() {
  const { data, isLoading } = useIndex("hongkong", "realestate", false);
  //const { data: dataHongKongAir, isLoading: isFetchedHongKongAir } = useIndex(
  //  "hongkong",
  //  "airquality",
  //);
  //const { data: dataDelhiAir, isLoading: isFetchedDelhiAir } = useIndex(
  //  "delhi",
  //  "airquality",
  //);
  const { data: dataSingapore, isLoading: isFetchedSingapore } = useIndex(
    "singapore",
    "realestate",
    false,
  );
  const { data: dataDubai, isLoading: isFetchedDubai } = useIndex(
    "dubai",
    "realestate",
    false,
  );
  //const { data: dataSydney, isLoading: isFetchedSydney } = useIndex(
  //  "sydney",
  //  "realestate",
  //);
  //const { data: dataMelbourne, isLoading: isFetchedMelbourne } = useIndex(
  //  "melbourne",
  //  "realestate",
  //);
  const { data: dataLondon, isLoading: isFetchedLondon } = useIndex(
    "london",
    "realestate",
    false,
  );
  //const { data: dataBrisbane, isLoading: isFetchedBrisbane } = useIndex(
  //  "brisbane",
  //  "realestate",
  //);
  //const { data: dataAdelaide, isLoading: isFetchedAdelaide } = useIndex(
  //  "adelaide",
  //  "realestate",
  //);

  const timeframes = [1, 2, 4, 6, 8, 24, 0]; // DEBUG ONLY

  const accountBalance = 1000;
  const [leverage, setLeverage] = useState(20);
  const [open, setOpen] = useState(false);
  const maxPositionSize = accountBalance * leverage;
  const [positionsize, setPositionsize] = useState(0);
  const [amountHKD, setAmountHKD] = useState(0.0);
  const [amountSGD, setAmountSGD] = useState(0.0);
  const [amountUSD, setAmountUSD] = useState(0);
  const [newTransaction, setNewTransaction] = useState<Transaction>();
  const [mappedTransactions, setMappedTransactions] = useState<any[]>([]);
  const [historyFetched, setHistoryFetched] = useState(false);

  const { isConnected, address, chainId } = useAccount();

  const contracts = getContracts(chainId);
  const router = useRouter();
  var [cityData, setCityData] = useState(data);
  var [cityDataLoading, setCityDataLoading] = useState(isLoading);
  var [city, setCity] = useState("Hong Kong");
  var [type, setType] = useState("Real Estate");
  const [formattedOraclePrice, setFormattedOraclePrice] = useState("-");

  useEffect(() => {
    // USE QUERIYR
    var { selectedCity } = router.query as { selectedCity: string | undefined };
    var { type: selectedType } = router.query as { type: string | undefined };
    if (selectedCity != undefined) {
      city = selectedCity;
      setCity(city);
      setCityData(cityData);
      setCityDataLoading(cityDataLoading);
    }
    if (selectedType != undefined) {
      type = selectedType;
      setType(type);
    }
  }, [router.query]);

  const percentageOfMaxPosition = [
    0.25 * maxPositionSize,
    0.5 * maxPositionSize,
    0.75 * maxPositionSize,
    maxPositionSize,
  ];

  useEffect(() => {
    switch (city) {
      case "Hong Kong":
        setCityData(data);
        setCityDataLoading(isLoading);
        break;
      case "Singapore":
        setCityData(dataSingapore);
        setCityDataLoading(isFetchedSingapore);
        break;
      case "Dubai":
        setCityData(dataDubai);
        setCityDataLoading(isFetchedDubai);
        break;
      case "London":
        setCityData(dataLondon);
        setCityDataLoading(isFetchedLondon);
        break;
    }
  }, [cityDataLoading, city]);

  const coinListings = [
    {
      flag: "🇭🇰",
      currency: "HKD",
      market: "Hong Kong",
      positionSize: data?.index?.slice(-1)[0] ?? 0,
      lastDayPosition: data?.index?.slice(-25)[0] ?? 0,
      entryPrice: data?.index?.slice(-1)[0] ?? 0,
      oraclePrice: data?.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (data?.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (data?.index?.slice(-1)[0] ?? 0) * 0.13,
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

  const currentIndexPrice =
    coinListings.find((item) => item.market === city)?.positionSize || 0;
  const lastDayPosition =
    coinListings.find((item) => item.market === city)?.lastDayPosition || 0;
  const currentIndexCurrency =
    coinListings.find((item) => item.market === city)?.currency || "";
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
    setTransactions((prevTransactions) => [...prevTransactions, transaction]);
  };

  const updateTransaction = (id: string, status: TransactionStatus) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, status } : transaction,
      ),
    );
  };

  const [selectedTrade, setSelectedTrade] = useState<{
    market: string;
    price: number;
  } | null>(null);

  // Update this function to set the selected trade
  const handleTradeSelection = (market: string, price: number) => {
    setSelectedTrade({ market, price });
  };

  const currentListing = coinListings.find((item) => item.market === city);
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

  const removeTransaction = (id: string) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id),
    );
  };

  const [duration, setDuration] = useState("1h");
  const [direction, setDirection] = useState<Direction>("Above");

  const handleDirectionChange = (newDirection: string) => {
    if (newDirection === "Above" || newDirection === "Below") {
      setDirection(newDirection as Direction);
    }
  };

  const publicClient = usePublicClient();

  const { data: oraclePrice } = useReadContract({
    address: contracts?.oracle,
    abi: zonaOracleAbi,
    functionName: "getValue",
    args: [
      BigInt(type === "Real Estate" ? 0 : 1), // categoryId: 0 for Real Estate, 1 for Air Quality
      markets.find((findCity) => findCity.city === city)?.identifier!,
    ],
  });

  useEffect(() => {
    setFormattedOraclePrice(
      (Number(oraclePrice) / 100).toLocaleString("en-us"),
    );
  }, [oraclePrice]);

  const calls = buildPlayerPositionsCall(address, contracts);

  const positions: any[] = [];

  useEffect(() => {
    var index = 0;
    if (!historyFetched) {
      fetchPlayerPositions(publicClient, calls).then((positions) => {
        setMappedTransactions(
          positions
            .filter((position: any) => position.isOccupied) // Filter only occupied positions
            .map((position) => {
              index++;
              return {
                id: position.oracleKey + "_" + index.toString(),
                marketType: markets.find(
                  (market) => market.oracleKey === position.oracleKey,
                )?.type,
                entryPrice: Number(position.guess) / 100,
                type: position.long ? "long" : "short",
                cityName: markets.find(
                  (market) => market.oracleKey === position.oracleKey,
                )?.city,
                startTime: Number(position.timestamp) * 1000,
                timeframe: Number(position.timeframe),
                duration: `${Number(position.timeframe)}h`,
                currency: markets.find(
                  (market) => market.oracleKey === position.oracleKey,
                )?.currency,
              };
            }),
        );
        setHistoryFetched(true);
      });
    }
  }, [positions, historyFetched]);

  return (
    <Fragment>
      <Layout
        title={`${currentIndexPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${city} | Zona`}
        button={true}
        app={true}
      >
        <div className="flex flex-col my-[20px] w-full px-4">
          <div className="mt-12 mb-4">
            <MarketSelector
              coinListings={coinListings}
              city={city}
              setCity={setCity}
              markets={markets}
              type={type}
              setType={setType}
              isMobile={true}
            />
          </div>

          <div className="mb-4 h-[380px]">
            <div className="w-full h-full bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226] overflow-hidden">
              <TradingViewChart
                city={city as "Hong Kong" | "Singapore" | "Dubai" | "Sydney"}
                data={cityData}
                isLoading={cityDataLoading}
                type={type}
              />
            </div>
          </div>

          <div className="col-span-12 sm:col-span-8 flex flex-col gap-4">
            <div className="w-full overflow-hidden">
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
          </div>

          <div className="mb-4">
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
              isConnected={isConnected}
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
              historyFetched={historyFetched}
              setHistoryFetched={setHistoryFetched}
              oneDayChangePercentage={oneDayChangePercentage}
              duration={duration}
              setDuration={setDuration}
              direction={direction}
              setDirection={handleDirectionChange}
              type={type}
            />
          </div>

          <div className="mb-4">
            <PositionDetailsTable
              city={city}
              type={type}
              //transactions2={transactions} // DEBUG ONLY
              mappedTransactions={mappedTransactions}
              setMappedTransactions={setMappedTransactions}
              newTransaction={newTransaction}
              timeframes={timeframes}
              positions={positions}
              updateTransaction={updateTransaction}
              removeTransaction={removeTransaction}
              currentIndexPrice={currentIndexPrice}
              currentIndexCurrency={currentIndexCurrency}
              historyFetched={historyFetched}
              setHistoryFetched={setHistoryFetched}
              coinListings={coinListings}
              direction={direction}
            />
          </div>
        </div>
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
