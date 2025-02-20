export interface TradeState {
    accountBalance: number;
    leverage: number;
    positionSize: number;
    currentIndexPrice: number;
    lastDayPosition: number;
    entryPrice: number;
  }
  
  export function calculateTradeValues(state: TradeState) {
    const { accountBalance, leverage, positionSize, currentIndexPrice, lastDayPosition, entryPrice } = state;
    const maxPositionSize = accountBalance * leverage;
    const marginRequired = positionSize / leverage;
    const tradingFees = positionSize * 0.001; // 0.1% trading fee
  
    // Calculate liquidation prices with validation
    const longEstLiquidationPrice = currentIndexPrice > 0 ? currentIndexPrice * (1 - (1 / leverage)) : 0;
    const shortEstLiquidationPrice = currentIndexPrice > 0 ? currentIndexPrice * (1 + (1 / leverage)) : 0;
  
    const longPnL = (currentIndexPrice - entryPrice) * positionSize;
    const shortPnL = (entryPrice - currentIndexPrice) * positionSize;
  
    const oneDayChangePercentage = lastDayPosition > 0 ? 
      ((currentIndexPrice - lastDayPosition) / lastDayPosition) * 100 : 0;
  
    return {
      marginRequired,
      tradingFees,
      longEstLiquidationPrice,
      shortEstLiquidationPrice,
      longPnL,
      shortPnL,
      oneDayChangePercentage,
    };
  }
  
  export function calculateLongLiquidationPrice(marketPrice: number, marginRequired: number, leverage: number): number {
    return marketPrice > 0 ? marketPrice * (1 - (1 / leverage)) : 0;
  }
  
  export function calculateShortLiquidationPrice(marketPrice: number, marginRequired: number, leverage: number): number {
    return marketPrice > 0 ? marketPrice * (1 + (1 / leverage)) : 0;
  }

  export function updateAmounts(newPositionSize: number, leverage: number, accountBalance: number) {
    const maxPositionSize = accountBalance * leverage;
    const validPositionSize = Math.min(newPositionSize, maxPositionSize);
    return {
      positionSize: validPositionSize,
      amountUSD: validPositionSize,
      amountHKD: Math.floor(validPositionSize * 7.8),
      amountSGD: Math.floor(validPositionSize * 1.3),
    };
  }
