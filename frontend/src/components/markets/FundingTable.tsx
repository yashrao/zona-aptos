import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import PriceTracker from './PriceTracker';
import { PriceData } from './pricedata';

interface Market {
  name: string;
  icon: string;
  currency: string;
  predicted: number;
  '24H': number;
  '3D': number;
  '7D': number;
  '30D': number;
}

const generateMarketData = (): Market[] => [
  { name: 'Hong Kong', icon: '/images/logo/zona_hk_logo.svg', currency: 'HKD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Singapore', icon: '/images/logo/zona_sg_logo.svg', currency: 'SGD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Dubai', icon: '/images/logo/zona_db_logo.svg', currency: 'AED', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Sydney', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Melbourne', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Brisbane', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'Adelaide', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
  { name: 'London', icon: 'images/logo/zona_uk_logo.svg', currency: 'GBP', predicted: 0, '24H': 0, '3D': 0, '7D': 0, '30D': 0 },
];

interface Props {
  currencyDisplay: 'local' | 'usd';
}

const FundingTable: React.FC<Props> = ({ currencyDisplay }) => {
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const [sortColumn, setSortColumn] = useState<'predicted' | '24H' | '3D' | '7D' | '30D' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [markets, setMarkets] = useState<Market[]>(generateMarketData());
  const router = useRouter();

  const convertToUSD = (amount: number, currency: string): number => {
    const exchangeRates: Record<string, number> = {
      HKD: 0.13,
      SGD: 0.74,
      AED: 0.27,
      AUD: 0.66,
      GBP: 1.24,
    };
    return amount * (exchangeRates[currency] || 1);
  };

  const convertFromUSD = (amount: number, currency: string): number => {
    const exchangeRates: Record<string, number> = {
      HKD: 7.69,
      SGD: 1.35,
      AED: 3.67,
      AUD: 1.52,
      GBP: 0.81,
    };
    return amount * (exchangeRates[currency] || 1);
  };

  useEffect(() => {
    setMarkets(markets.map(market => ({
      ...market,
      predicted: Math.random() * 0.02 - 0.01,
      '24H': Math.random() * 0.02 - 0.01,
      '3D': Math.random() * 0.02 - 0.01,
      '7D': Math.random() * 0.02 - 0.01,
      '30D': Math.random() * 0.02 - 0.01,
    })));
  }, []);

  const handlePricesUpdate = useCallback((newPrices: Record<string, PriceData | null>) => {
    setPrices(newPrices);
  }, []);

  const handleSort = (column: 'predicted' | '24H' | '3D' | '7D' | '30D') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleClickMarket = useCallback((city: string) => {
    router.push({
      pathname: '/trade',
      query: { selectedCity: city }
    });
  }, [router]);

  const sortedMarkets = useMemo(() => {
    if (!sortColumn) return markets;
    return [...markets].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [markets, sortColumn, sortDirection]);

  const renderFundingCell = (funding: number, currency: string) => {
    const displayValue = currencyDisplay === 'local' ? funding : convertToUSD(funding, currency);
    return (
      <td className={`bg-[#0F1216] py-4 px-4 text-left group-hover:bg-[#1A1D21] transition-colors duration-200 ${displayValue >= 0 ? 'text-[#23F98A]' : 'text-[#D8515F]'}`}>
        <div>{displayValue.toFixed(3)}%</div>
        <div className="text-xs text-[#AFAFAF]">
          {(displayValue * 365).toFixed(2)}% APR
        </div>
      </td>
    );
  };

  const renderSortableHeader = (title: string, column: 'predicted' | '24H' | '3D' | '7D' | '30D') => (
    <th 
      className={`px-4 font-light cursor-pointer ${sortColumn === column ? 'text-white' : 'text-[#AFAFAF]'}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        <span className={sortColumn === column ? 'font-bold' : ''}>{title}</span>
        <span className="ml-2 flex flex-col items-center justify-center h-3 leading-[1.3]">
          <span className={`text-[0.5em] transition-opacity duration-300 ease-in-out ${sortColumn === column && sortDirection === 'asc' ? 'opacity-100' : 'opacity-30'}`}>▲</span>
          <span className={`text-[0.5em] transition-opacity duration-300 ease-in-out ${sortColumn === column && sortDirection === 'desc' ? 'opacity-100' : 'opacity-30'}`}>▼</span>
        </span>
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <PriceTracker onPricesUpdate={handlePricesUpdate} />
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[#AFAFAF] text-[14px] text-left">
            <th className="px-4 font-light">Market</th>
            <th className="px-4 font-light">Index Value</th>
            {renderSortableHeader('Predicted', 'predicted')}
            {renderSortableHeader('24H Avg.', '24H')}
            {renderSortableHeader('3D Avg.', '3D')}
            {renderSortableHeader('7D Avg.', '7D')}
            {renderSortableHeader('30D Avg.', '30D')}
            <th className="px-4 font-light"></th>
          </tr>
        </thead>
        <tbody>
        {sortedMarkets.map((market) => {
          const priceData = prices[market.name];
          const indexPrice = priceData?.current || 1000;
          const displayPrice = currencyDisplay === 'local' ? indexPrice : convertToUSD(indexPrice, market.currency);
          const displayCurrency = currencyDisplay === 'local' ? market.currency : 'USD';
          
          return (
            <tr 
              key={market.name} 
              className="cursor-pointer group"
              onClick={() => handleClickMarket(market.name)}
            >
              <td className="bg-[#0F1216] py-4 px-4 rounded-l-xl group-hover:bg-[#1A1D21] transition-colors duration-200">
                <div className="flex items-center">
                  <img 
                    src={market.icon} 
                    alt={`${market.name} logo`} 
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-white">{market.name}</span>
                </div>
              </td>
              <td className="bg-[#0F1216] py-4 px-4 text-white group-hover:bg-[#1A1D21] transition-colors duration-200">
                {`${displayCurrency} ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </td>
              {renderFundingCell(market.predicted, market.currency)}
              {renderFundingCell(market['24H'], market.currency)}
              {renderFundingCell(market['3D'], market.currency)}
              {renderFundingCell(market['7D'], market.currency)}
              {renderFundingCell(market['30D'], market.currency)}
              <td className="bg-[#0F1216] py-4 px-4 rounded-r-xl group-hover:bg-[#1A1D21] transition-colors duration-200">
                <span className="text-[#AFAFAF] hover:text-[#23F98A] transition-all duration-200">
                  Trade
                </span>
                <span className="text-xs ml-0.5 text-[#AFAFAF] group-hover:text-[#23F98A] transition-all duration-200">
                  ↗
                </span>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default FundingTable;