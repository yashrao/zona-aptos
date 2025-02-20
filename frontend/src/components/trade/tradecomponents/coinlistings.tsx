import React from 'react';

interface IndexData {
  index: number[];
  dates?: string[];
  currency?: string;
  name?: string;
  lastUpdated?: string;
}

interface CoinListing {
  flag: string;
  market: string;
  currency: string;
  positionSize: number;
  lastDayPosition: number;
  entryPrice: number;
  oraclePrice: number;
  estLiquidationPrice: number;
  estPnL: number;
  fundingFees: number;
  usd: number;
}

interface CoinListingsProps {
  hongKongData?: IndexData;
  singaporeData?: IndexData;
  dubaiData?: IndexData;
  sydneyData?: IndexData;
  melbourneData?: IndexData;
  londonData?: IndexData;
  brisbaneData?: IndexData;
  adelaideData?: IndexData;
}

const CoinListings: React.FC<CoinListingsProps> = ({
  hongKongData,
  singaporeData,
  dubaiData,
  sydneyData,
  melbourneData,
  londonData,
  brisbaneData,
  adelaideData
}) => {
  const createCoinListing = (
    flag: string,
    market: string,
    currency: string,
    usdConversionRate: number,
    data?: IndexData
  ): CoinListing | null => {
    if (!data) return null;
  
    return {
      flag,
      market,
      currency,
      positionSize: data.index?.slice(-1)[0] ?? 0,
      lastDayPosition: data.index?.slice(-2)[0] ?? 0,
      entryPrice: data.index?.slice(-1)[0] ?? 0,
      oraclePrice: data.index?.slice(-1)[0] ?? 0,
      estLiquidationPrice: (data.index?.slice(-1)[0] ?? 0) / 2,
      estPnL: 100,
      fundingFees: -50,
      usd: (data.index?.slice(-1)[0] ?? 0) * usdConversionRate,
    };
  };

  const coinListings: CoinListing[] = [
    createCoinListing("🇭🇰", "Hong Kong", "HKD", 0.13, hongKongData),
    createCoinListing("🇸🇬", "Singapore", "SGD", 0.74, singaporeData),
    createCoinListing("🇦🇪", "Dubai", "AED", 0.27, dubaiData),
    createCoinListing("🇦🇺", "Sydney", "AUD", 0.66, sydneyData),
    createCoinListing("🇦🇺", "Melbourne", "AUD", 0.66, melbourneData),
    createCoinListing("UK", "London", "GBP", 1.32, londonData),
    createCoinListing("AU", "Brisbane", "AUD", 0.66, brisbaneData),
    createCoinListing("AU", "Adelaide", "AUD", 0.66, adelaideData)
  ].filter((listing): listing is CoinListing => listing !== null);

  return (
    <div>
      {coinListings.map((listing, index) => (
        <div key={index} className="mb-4 p-4 bg-[#0F1216] rounded-[8px] border-[0.5px] border-[#222226]">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{listing.flag}</span>
            <span className="text-xl font-bold">{listing.market}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Currency: {listing.currency}</div>
            <div>Position Size: {listing.positionSize.toLocaleString()}</div>
            <div>Entry Price: {listing.entryPrice.toLocaleString()}</div>
            <div>Oracle Price: {listing.oraclePrice.toLocaleString()}</div>
            <div>Est. Liquidation Price: {listing.estLiquidationPrice.toLocaleString()}</div>
            <div>Est. PnL: {listing.estPnL}</div>
            <div>Funding Fees: {listing.fundingFees}</div>
            <div>USD: ${listing.usd.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoinListings;