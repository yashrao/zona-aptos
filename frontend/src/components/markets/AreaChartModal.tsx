import React, { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MarketModal from './DonutModal';

// Define types first
type Region = 'HongKong' | 'Singapore' | 'Dubai' | 'Sydney';

interface DataPoint {
  date: string;
  HongKong: number;
  Singapore: number;
  Dubai: number;
  Sydney: number;
}

// Then use the types
const DUMMY_DATA: {
  openInterest: DataPoint[];
  totalVolume: DataPoint[];
} = {
  openInterest: [
    { date: 'Jan 2024', HongKong: 15.2, Singapore: 12.8, Dubai: 10.5, Sydney: 8.4 },
    { date: 'Feb 2024', HongKong: 16.1, Singapore: 13.2, Dubai: 11.1, Sydney: 8.9 },
    { date: 'Mar 2024', HongKong: 14.8, Singapore: 12.4, Dubai: 9.8, Sydney: 7.9 },
    { date: 'Apr 2024', HongKong: 17.3, Singapore: 14.1, Dubai: 11.8, Sydney: 9.2 },
    { date: 'May 2024', HongKong: 15.9, Singapore: 13.5, Dubai: 10.2, Sydney: 8.1 },
    { date: 'Jun 2024', HongKong: 16.8, Singapore: 13.9, Dubai: 9.4, Sydney: 6.8 }, // Sums to ~46.9M
  ],
  totalVolume: [
    { date: 'Jan 2024', HongKong: 38.2, Singapore: 32.5, Dubai: 25.8, Sydney: 19.0 },
    { date: 'Feb 2024', HongKong: 40.1, Singapore: 34.2, Dubai: 27.1, Sydney: 20.5 },
    { date: 'Mar 2024', HongKong: 36.8, Singapore: 31.4, Dubai: 24.8, Sydney: 18.9 },
    { date: 'Apr 2024', HongKong: 42.3, Singapore: 35.1, Dubai: 28.8, Sydney: 21.2 },
    { date: 'May 2024', HongKong: 39.9, Singapore: 33.5, Dubai: 26.2, Sydney: 19.1 },
    { date: 'Jun 2024', HongKong: 41.8, Singapore: 34.9, Dubai: 24.4, Sydney: 14.4 }, // Sums to ~115.5B
  ],
};

const COLORS: Record<Region, string> = {
  HongKong: '#23F98A',
  Singapore: '#2D7FE0',
  Dubai: '#9747FF',
  Sydney: '#F7931A',
};

interface AreaChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
}

// Add this new interface for type safety
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isOpenInterest: boolean;
}

// Add this new component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isOpenInterest }) => {
  if (!active || !payload) return null;

  const total = payload.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#2D2D2D]">
      <p className="text-[#AFAFAF] mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-8 mb-1">
          <span style={{ color: entry.color }}>{entry.dataKey}:</span>
          <span className="text-white font-medium">
            ${entry.value.toFixed(1)}{isOpenInterest ? 'M' : 'B'}
          </span>
        </div>
      ))}
      <div className="border-t border-[#2D2D2D] mt-2 pt-2 flex justify-between gap-8">
        <span className="text-[#AFAFAF]">Total:</span>
        <span className="text-white font-medium">
          ${total.toFixed(1)}{isOpenInterest ? 'M' : 'B'}
        </span>
      </div>
    </div>
  );
};

const AreaChartModal: React.FC<AreaChartModalProps> = ({ isOpen, onClose, title, value }) => {
  const isOpenInterest = title === 'Open Interest';
  const data = isOpenInterest ? DUMMY_DATA.openInterest : DUMMY_DATA.totalVolume;
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null);
  const [hoveredTotal, setHoveredTotal] = useState<string | null>(null);

  // Calculate the maximum sum for any date point
  const getMaxSum = () => {
    return Math.max(...data.map(entry => {
      return Object.entries(entry)
        .filter(([key]) => key !== 'date')
        .reduce((sum, [, value]) => sum + (value as number), 0);
    }));
  };

  // Generate y-axis ticks based on the data
  const generateTicks = () => {
    const maxSum = getMaxSum();
    const roundedMax = Math.ceil(maxSum / 25) * 25; // Round up to nearest 25
    const ticks = [];
    for (let i = 25; i <= roundedMax; i += 25) {
      ticks.push(i);
    }
    return ticks;
  };

  const formatYAxis = (value: number) => {
    if (value === 0) return '';
    if (isOpenInterest) {
      return `$${value}M`;
    }
    return `$${value}B`;
  };

  const handleMouseMove = (props: any) => {
    if (props.activePayload) {
      const payload = props.activePayload[0].payload;
      setHoveredData(payload);
      
      const total = Object.entries(payload)
        .filter(([key]) => key !== 'date')
        .reduce((sum, [, value]) => sum + (value as number), 0);
      setHoveredTotal(`$${total.toFixed(1)}${isOpenInterest ? 'M' : 'B'}`);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoveredTotal(null);
  };

  // Get the values to display in the legend
  const getDisplayValues = (region: Region) => {
    if (hoveredData) {
      return hoveredData[region];
    }
    return data[data.length - 1][region];
  };

  return (
    <MarketModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={<span style={{ color: "#AFAFAF", fontWeight: "300" }}>{title}</span>}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="text-center">
          <p className="text-[#AFAFAF] text-[16px] font-light">
            {title}
          </p>
          <h1 className="text-[70px] font-bold text-white leading-tight">
            {hoveredTotal || value}
          </h1>
        </div>

        <div className="flex justify-between items-start gap-8 mt-10">
          <div className="flex flex-col gap-8">
            {(Object.entries(COLORS) as [Region, string][]).map(([region, color]) => (
              <div key={region} className="flex flex-col">
                <span className="text-[#AFAFAF] text-[16px] font-light">
                  {region.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span 
                  className="text-[28px] font-bold"
                  style={{ color }}
                >
                  ${getDisplayValues(region).toFixed(1)}{isOpenInterest ? 'M' : 'B'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={data} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis 
                  dataKey="date" 
                  stroke="#AFAFAF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#AFAFAF"
                  fontSize={12}
                  tickFormatter={formatYAxis}
                  domain={[0, getMaxSum()]}
                  ticks={generateTicks()}
                />
                <Tooltip 
                  content={<CustomTooltip isOpenInterest={isOpenInterest} />} 
                  cursor={{ stroke: '#AFAFAF', strokeWidth: 1 }}
                />
                {Object.entries(COLORS).map(([region, color]) => (
                  <Area
                    key={region}
                    type="monotone"
                    dataKey={region}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    stackId="1"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MarketModal>
  );
};

export default AreaChartModal; 