export interface PriceData {
  current: number;
  '24h': number;
  '7d': number;
  '30d': number;
  ytd: number;  // Remove quotes
  '1y': number;
}