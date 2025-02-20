import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import PriceTracker from './PriceTracker';

interface PriceData {
  current: number;
}

const Funding: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({});

  const handlePricesUpdate = useCallback((newPrices: Record<string, PriceData | null>) => {
    setPrices(newPrices);
  }, []);

  const formatPrice = (price: number | undefined, currency: string) => {
    if (price === undefined) return 'Loading';
    return `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const markets = [
    { name: 'Hong Kong Index', icon: '/images/logo/zona_hk_logo.svg', currency: 'HKD' },
    { name: 'Singapore Index', icon: '/images/logo/zona_sg_logo.svg', currency: 'SGD' },
    { name: 'Dubai Index', icon: '/images/logo/zona_db_logo.svg', currency: 'AED' },
    { name: 'Sydney Index', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
    { name: 'Melbourne Index', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
    { name: 'London Index', icon: 'images/logo/zona_uk_logo.svg', currency: 'GBP' },
    { name: 'Brisbane Index', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD' },
    { name: 'Adelaide Index', icon: 'images/logo/zona_aus_logo.svg', currency: 'AUD'}
  ];

  const renderPriceCell = (price: number | undefined, currency: string) => (
    <td className="bg-[#0F1216] py-4 px-4 text-white">
      {formatPrice(price, currency)}
    </td>
  );

  const renderEmptyCell = () => (
    <td className="bg-[#0F1216] py-4 px-4 text-[#AFAFAF]">-</td>
  );

  return (
    <div className="overflow-x-auto">
      <PriceTracker onPricesUpdate={handlePricesUpdate} />
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[#AFAFAF] text-[14px] text-left">
            <th className="px-4 font-light">Market</th>
            <th className="px-4 font-light">Price</th>
            <th className="px-4 font-light">Predicted</th>
            <th className="px-4 font-light">24h Avg.</th>
            <th className="px-4 font-light">3d Avg.</th>
            <th className="px-4 font-light">7d Avg.</th>
            <th className="px-4 font-light">30d Avg.</th>
            <th className="px-4 font-light"></th>
          </tr>
        </thead>
        <tbody>
        {markets.map((market) => {
          const priceData = prices[market.name];
          return (
            <tr key={market.name}>
              <td className="bg-[#0F1216] py-4 px-4 rounded-l-xl">
                <div className="flex items-center">
                  <img 
                    src={market.icon} 
                    alt={`${market.name} logo`} 
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-white">{market.name}</span>
                </div>
              </td>
              {renderPriceCell(priceData?.current, market.currency)}
              {renderEmptyCell()}
              {renderEmptyCell()}
              {renderEmptyCell()}
              {renderEmptyCell()}
              {renderEmptyCell()}
              <td className="bg-[#0F1216] py-4 px-4 rounded-r-xl">
                <Link href="/trade" passHref>
                  <span className="text-white underline text-[#23F98A] cursor-pointer">
                    Trade
                  </span>
                </Link>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default Funding;