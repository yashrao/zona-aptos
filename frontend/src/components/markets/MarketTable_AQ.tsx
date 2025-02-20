import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import PriceTracker from './PriceTracker';
import { PriceData } from './pricedata';
import { useRouter } from 'next/router';

interface Market {
  name: string;
  icon: string;
  currency: string;
  marketType: 'Real Estate' | 'Air Quality';
}

interface MarketTableAQProps {
  isMobile?: boolean;
}

const generateMarketData = (): Market[] => [
  { name: 'Hong Kong', icon: '/images/logo/zona_hk_logo.svg', currency: 'AQHI', marketType: 'Air Quality' },
  { name: 'Delhi', icon: '/images/logo/zona_delhi_logo.svg', currency: 'AQHI', marketType: 'Air Quality' },
  // Add more air quality markets here as needed
];

const MarketTable_AQ: React.FC<MarketTableAQProps> = ({ isMobile = false }) => {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});
  const [sortColumn, setSortColumn] = useState<'24h' | '7d' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [markets, setMarkets] = useState<Market[]>(generateMarketData());

  useEffect(() => {
    // Generate random data on the client-side only
    setMarkets(markets.map(market => ({
      ...market,
      '24hVol': Math.random() * 90000 + 10000,
      'openInt': Math.random() * 900000 + 100000,
      'funding': (Math.random() * 0.02 - 0.01),
    })));
  }, []);

  const handleClickMarket = useCallback((city: string) => {
    let selectedCity = city === 'Hong Kong' ? 'Hong Kong' : 'Delhi';
    
    router.push({
      pathname: '/trade',
      query: { 
        selectedCity,
        type: 'Air Quality'
      }
    });
  }, [router]);

  const handlePricesUpdate = useCallback((newPrices: Record<string, PriceData | null>) => {
    const transformedPrices: Record<string, PriceData | null> = {};
    if (newPrices["Hong Kong Air Quality"]) {
      transformedPrices["Hong Kong"] = newPrices["Hong Kong Air Quality"];
    }
    if (newPrices["Delhi Air Quality"]) {
      transformedPrices["Delhi"] = newPrices["Delhi Air Quality"];
    }
    setPrices(transformedPrices);
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

  const handleSort = (column: '24h' | '7d') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedMarkets = useMemo(() => {
    if (!sortColumn) return markets;
    return [...markets].sort((a, b) => {
      const aChange = calculateChange(prices[a.name]?.current, prices[a.name]?.[sortColumn as '24h' | '7d']);
      const bChange = calculateChange(prices[b.name]?.current, prices[b.name]?.[sortColumn as '24h' | '7d']);
      return sortDirection === 'asc' ? 
        parseFloat(aChange) - parseFloat(bChange) : 
        parseFloat(bChange) - parseFloat(aChange);
    });
  }, [markets, prices, sortColumn, sortDirection]);

  const renderChangeCell = (change: string, value: number | undefined) => (
    <td className={`bg-[#0F1216] py-4 px-4 text-left group-hover:bg-[#1A1D21] transition-colors duration-200 ${change.startsWith('-') ? 'text-[#D8515F]' : 'text-[#23F98A]'}`}>
      <div>{change}</div>
      <div className="text-xs text-[#AFAFAF]">
        {value ? 
          `AQHI ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : '-'}
      </div>
    </td>
  );

  const renderSortableHeader = (title: string, column: '24h' | '7d') => (
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
            <th className="px-4 font-light">Market Type</th>
            <th className="px-4 font-light">Index Value</th>
            {renderSortableHeader('24h Change', '24h')}
            {renderSortableHeader('7D Change', '7d')}
            <th className="px-4 font-light"></th>
          </tr>
        </thead>
        <tbody>
        {sortedMarkets.map((market) => {
          const priceData = prices[market.name];
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
                    className="w-8 h-8 mr-2"
                  />
                  <span className="text-white">{market.name}</span>
                </div>
              </td>
              <td className="bg-[#0F1216] py-4 px-4 group-hover:bg-[#1A1D21] transition-colors duration-200">
                <div className="flex items-center">
                  <img 
                    src="/images/logo/aqi_icon.svg"
                    alt="Air Quality"
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-white">Air Quality</span>
                </div>
              </td>
              <td className="bg-[#0F1216] py-4 px-4 text-white group-hover:bg-[#1A1D21] transition-colors duration-200">
                {priceData 
                  ? `AQHI ${priceData.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'Loading'}
              </td>
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['24h']), priceData?.['24h'])}
              {renderChangeCell(calculateChange(priceData?.current, priceData?.['7d']), priceData?.['7d'])}
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

export default MarketTable_AQ;