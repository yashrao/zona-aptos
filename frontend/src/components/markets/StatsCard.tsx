import React, { useState } from 'react';
import { MarketTooltip } from '@/components/tooltip/market_tooltip';
import DonutModal from './DonutModal';
import dynamic from 'next/dynamic';
import AreaChartModal from './AreaChartModal';

// Dynamically import the Doughnut chart with no SSR
const Doughnut = dynamic(
  () => import('chart.js').then(ChartJS => {
    const { Chart, ArcElement, Tooltip, Legend } = ChartJS;
    Chart.register(ArcElement, Tooltip, Legend);
    return import('react-chartjs-2').then(mod => mod.Doughnut);
  }),
  { ssr: false }
);

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const volumeData = {
    labels: ['Hong Kong', 'Singapore', 'Dubai', 'Australia'],
    datasets: [{
      data: [65.1, 48.3, 28.9, 18.8],
      backgroundColor: [
        '#23F98A',
        '#2D7FE0', 
        '#9747FF', 
        '#F7931A', 
      ],
      borderWidth: 0,
      borderRadius: 15,
      spacing: 2,
    }],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        enabled: false // Disable tooltips
      }
    },
    maintainAspectRatio: true,
    responsive: true,
  };

  const renderModalContent = () => {
    if (title === '24h Volume') {
      return (
        <div className="flex flex-col justify-between h-full">
          <div className="text-center">
            <p className="text-[#AFAFAF] text-[16px] font-light">
              24h Volume
            </p>
            <h1 className="text-[70px] font-bold text-white leading-tight">
              {value}
            </h1>
          </div>

          <div className="flex justify-center items-center gap-24 mt-10">
            <div className="flex flex-col gap-8">
              {[
                { name: 'Hong Kong', value: '65.1K', color: '#23F98A' },
                { name: 'Singapore', value: '48.3K', color: '#2D7FE0' },
                { name: 'Dubai', value: '28.9K', color: '#9747FF' },
                { name: 'Australia', value: '18.8K', color: '#F7931A' },
              ].map((item) => (
                <div key={item.name} className="flex flex-col">
                  <span className="text-[#AFAFAF] text-[16px] font-light">
                    {item.name}
                  </span>
                  <span 
                    className="text-[28px] font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-[400px]">
              {isClient && <Doughnut data={volumeData} options={chartOptions} />}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center py-12">
        <h1 className="text-[70px] md:text-[90px] font-bold text-white text-center">
          {value}
        </h1>
      </div>
    );
  };

  return (
    <>
      <div 
        className="bg-[#0F1216] hover:bg-[#1A1D21] rounded-lg p-6 flex flex-col items-left cursor-pointer transition-all duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        {icon}
        <div className="mt-4 text-left">
          <div className="relative">
            <p className="text-[16px] text-[#AFAFAF] font-light group">
              <span className="border-b border-dashed border-[#AFAFAF] [border-dash-pattern:8px_2px] group-hover:border-solid group-hover:text-white group-hover:border-white transition-all duration-200">
                {title}
              </span>
            </p>
          </div>
          <p className="text-[60px] text-white font-bold mt-2">{value}</p>
        </div>
      </div>

      {title === '24h Volume' ? (
        <DonutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={<span style={{ color: "#AFAFAF", fontWeight: "300" }}>{title}</span>}
        >
          <div className="p-6">
            {renderModalContent()}
          </div>
        </DonutModal>
      ) : (
        <AreaChartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={title}
          value={value}
        />
      )}
    </>
  );
};

// Helper function to get tooltip content based on title
const getTooltipContent = (title: string): string => {
  switch (title) {
    case '24h Volume':
      return 'Total notional trading volume in the last 24 hours';
    case 'Open Interest':
      return 'Total notional value of all open positions';
    case 'Total Volume':
      return 'Cumulative notional trading volume since launch';
    default:
      return '';
  }
};

export default StatsCard;