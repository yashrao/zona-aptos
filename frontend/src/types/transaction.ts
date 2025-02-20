export type TransactionStatus = "active" | "closed" | "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  type: "long" | "short";
  market: string;
  cityName: string;
  marketType: string;
  timeframe: number;
  amount: number;
  entryPrice: number;
  liquidationPrice: number;
  status: string
  duration: string;
  startTime: number;
  currency: string;
}
