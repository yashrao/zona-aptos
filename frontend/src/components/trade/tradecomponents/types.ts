//NOTE: WTF IS THIS? there is already a transaction type in src/types/transactions.ts

export type CurrencyCode = "HKD" | "SGD" | "AED" | "AUD";

export type TransactionStatus = "open" | "closed";

export interface Transaction {
  id: string;
  market: string;
  long: boolean;
  amount: number;
  entryPrice: number;
  liquidationPrice: number;
  status: TransactionStatus;
  oraclePrice: number; // Changed from optional to required
  type: "realestate" | "airquality"; // Changed from optional to required
  timeframe: number;
}
