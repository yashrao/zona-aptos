import Modal from "@/components/trade/tradecomponents/modal";
import { SetStateAction } from "react";
import { Transaction, TransactionStatus } from '@/types/transaction';

interface TradeModalProps {
  openModal: boolean;
  setOpen: SetStateAction<any>;
  longSelected: boolean;
  shortSelected: boolean;
  leverage: any;
  handleSliderChange: SetStateAction<any>;
  transactions: Transaction[];
  updateTransaction: (id: string, status: TransactionStatus) => void;
  coinListings: any;
}

export function TradeModal({
  openModal,
  setOpen,
  longSelected,
  shortSelected,
  leverage,
  handleSliderChange,
  transactions,
  updateTransaction,
  coinListings,
}: TradeModalProps) {
  if (!openModal) return null;
  
  const getCurrentMarketPrice = (market: string) => {
    return coinListings.find((listing: { market: string; positionSize: number }) => listing.market === market)?.positionSize ?? 0;
  };

  const calculatePnL = (transaction: Transaction) => {
    const currentMarketPrice = getCurrentMarketPrice(transaction.market);
    const pnl = transaction.type === 'long'
      ? (currentMarketPrice - transaction.entryPrice) * transaction.amount
      : (transaction.entryPrice - currentMarketPrice) * transaction.amount;
    return pnl.toFixed(2);
  };

  return (
    <>
      <Modal
        openModal={openModal}
        setOpen={setOpen}
        hasCloseButton
        modalTitle="Market Close"
      >
        <div className="relative">
          <div className="col-span-12 w-full mb-4 rounded-[16px] flex items-center justify-center px-2">
            <table className="w-full bg-[#1B1C21]">
              <thead className="border-b border-white">
                <tr>
                <th
                    scope="col" colSpan={2}
                    className="text-center text-sm font-semibold text-white p-8"
                  >
                    Hong Kong
                    <p className={`${longSelected ? "text-zona-green" : "text-zona-red"}`}>
                      {longSelected ? "LONG" : "SHORT"}
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1B1C21] divide-y divide-gray-800">
                <tr className="">
                  <td className="bg-[#1B1C21] whitespace-nowrap text-center text-sm font-medium text-white p-4">
                    <span className="text-sm text-slate-400">Position Size</span>
                    <p>$15,653.34</p>
                  </td>
                  <td className="whitespace-nowrap text-center text-sm text-zona-green p-4">
                    <span className="text-sm text-slate-400">
                      Est. P&L
                    </span>
                    <p className={`${longSelected ? "text-zona-green" : "text-zona-red"}`}>
                      {longSelected ? "$59.53" : "-$59.53"}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full mt-8">
          <button
            type="button"
            className={`p-4 rounded-[4px] w-full ${
              longSelected ? "bg-zona-green" : "bg-[#D8515F]"
            } text-black font-bold focus:ring-0 focus:outline-none focus:border-none transition-colors duration-200 ease-in-out`}
            onClick={() => {
              // Close the position and reselect the previous option
              setOpen(false);
            }}
          >
            Close Position
          </button>
          </div>
          <div className="mt-4">
            <h3>Active Transactions</h3>
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                {/* Display transaction details */}
                {transaction.status === 'pending' && (
                  <>
                    <button onClick={() => updateTransaction(transaction.id, 'active')}>Complete</button>
                    <button onClick={() => updateTransaction(transaction.id, 'closed')}>Close</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
