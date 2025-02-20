import dynamic from "next/dynamic";
import useWindowSize from "@/components/trade/tradeinterface/usewindowsize";
import React, {
  FC,
  Fragment,
  useState,
  useEffect,
  useCallback,
  Suspense,
  ChangeEvent,
} from "react";
import { TradeModal } from "@/components/trade/tradecomponents/trade-modal";
import { LeverageModal } from "@/components/trade/tradecomponents/leverage-modal";
import { Transaction, TransactionStatus } from "@/types/transaction";

const TradingInterfaceDesktop = dynamic(
  () => import("@/components/trade/tradeinterface/TradingInterfaceDesktop"),
  {
    ssr: false,
  },
);

const TradingInterfaceMobile = dynamic(
  () => import("@/components/trade/tradeinterface/TradingInterfaceMobile"),
  {
    ssr: false,
  },
);

export default function TradingInterface() {
  const { width } = useWindowSize();
  const isMobile = (width ?? 0) < 768;

  const [open, setOpen] = useState(false);
  const [longSelected, setLongSelected] = useState(false);
  const [shortSelected, setShortSelected] = useState(false);
  const [leverage, setLeverage] = useState(1);
  const [openLeverageModal, setOpenLeverageModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coinListings, setCoinListings] = useState([]);

  const handleCloseModal = () => setOpen(false);
  const positionSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    // Handle position slider change
    // You might want to update some state here, for example:
    // setPositionSize(value);
  };
  const leverageSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setLeverage(value);
  };

  const updateTransaction = (id: string, status: TransactionStatus) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, status } : transaction,
      ),
    );
  };

  return (
    <Fragment>
      <TradingInterfaceDesktop
      // Pass necessary props
      />

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
