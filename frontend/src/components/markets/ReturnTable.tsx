import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import PriceTracker from './PriceTracker';
import { PriceData } from '../markets/pricedata';

interface Market {
  name: string;
  icon: string;
  currency: string;
}

const generateMarketData = (): Market[] => [
  { name: 'Hong Kong', icon: '/images/logo/zona_hk_logo.svg', currency: 'HKD' },
  { name: 'Singapore', icon: '/images/logo/zona_sg_logo.svg', currency: 'SGD' },
  { name: 'Dubai', icon: '/images/logo/zona_db_logo.svg', currency: 'AED' },
  { name: 'Sydney', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
  { name: 'Melbourne', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
  { name: 'Brisbane', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
  { name: 'Adelaide', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
  { name: 'London', icon: 'images/logo/zona_uk_logo.svg', currency: 'GBP' },
];

interface Props {
  currencyDisplay: 'local' | 'usd';
}

const ReturnTable: React.FC<Props> = ({ currencyDisplay }) => {
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const [sortColumn, setSortColumn] = useState<'24h' | '7d' | '30d' | 'ytd' | '1y' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [markets] = useState<Market[]>(generateMarketData());
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

  const handlePricesUpdate = useCallback((newPrices: Record<string, PriceData | null>) => {
    setPrices(newPrices);
  }, []);

  const roundToTwoDecimalPlaces = (num: number) => {
    return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
  };
  
  const calculateChange = (current: number | undefined, previous: number | undefined): string => {
    if (!current || !previous) return '-';
    if (previous === 0) return current > 0 ? '∞' : '0.00%';
    const change = ((current - previous) / previous) * 100;
    return roundToTwoDecimalPlaces(change) + '%';
  };

  const handleSort = (column: '24h' | '7d' | '30d' | 'ytd' | '1y') => {
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
      const aChange = calculateChange(prices[a.name]?.current, prices[a.name]?.[sortColumn]);
      const bChange = calculateChange(prices[b.name]?.current, prices[b.name]?.[sortColumn]);
      return sortDirection === 'asc' ? 
        parseFloat(aChange) - parseFloat(bChange) : 
        parseFloat(bChange) - parseFloat(aChange);
    });
  }, [markets, prices, sortColumn, sortDirection]);

  const renderChangeCell = (change: string, value: number | undefined, currency: string) => (
    <td className={`bg-[#0F1216] py-4 px-4 text-left group-hover:bg-[#1A1D21] transition-colors duration-200 ${change.startsWith('-') ? 'text-[#D8515F]' : 'text-[#23F98A]'}`}>
      <div>{change}</div>
      <div className="text-xs text-[#AFAFAF]">
        {value ? 
          `${currencyDisplay === 'local' ? currency : 'USD'} ${(currencyDisplay === 'local' ? value : convertToUSD(value, currency)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : '-'}
      </div>
    </td>
  );

  const renderSortableHeader = (title: string, column: '24h' | '7d' | '30d' | 'ytd' | '1y') => (
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
            <th className="px-4 font-light">Price</th>
            {renderSortableHeader('24h', '24h')}
            {renderSortableHeader('7D', '7d')}
            {renderSortableHeader('30D', '30d')}
            {renderSortableHeader('YTD', 'ytd')}
            {renderSortableHeader('1Y', '1y')}
            <th className="px-4 font-light"></th>
          </tr>
        </thead>
        <tbody>
        {sortedMarkets.map((market) => {
          const priceData = prices[market.name];
          const displayPrice = priceData?.current ? 
            (currencyDisplay === 'local' ? priceData.current : convertToUSD(priceData.current, market.currency)) : 
            null;

          return (
            <tr 
              key={market.name} 
              onClick={() => handleClickMarket(market.name)}
              className="cursor-pointer group"
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
                {displayPrice 
                  ? `${currencyDisplay === 'local' ? market.currency : 'USD'} ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'Loading'}
              </td>
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['24h']), priceData?.['24h'], market.currency)}
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['7d']), priceData?.['7d'], market.currency)}
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['30d']), priceData?.['30d'], market.currency)}
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['ytd']), priceData?.['ytd'], market.currency)}
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['1y']), priceData?.['1y'], market.currency)}
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

export default ReturnTable;