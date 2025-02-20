import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MarketModal from './DonutModal';

// Dummy data - replace with real data later
const chartData = [
  { date: '2024-01', openInterest: 4000, totalVolume: 2400 },
  { date: '2024-02', openInterest: 3000, totalVolume: 1398 },
  { date: '2024-03', openInterest: 2000, totalVolume: 9800 },
  { date: '2024-04', openInterest: 2780, totalVolume: 3908 },
  { date: '2024-05', openInterest: 1890, totalVolume: 4800 },
  { date: '2024-06', openInterest: 2390, totalVolume: 3800 },
];

interface VolumeMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'openInterest' | 'totalVolume';
}

const VolumeMetricsModal: React.FC<VolumeMetricsModalProps> = ({ isOpen, onClose, type }) => {
  const colors = {
    openInterest: '#FF6B6B',  // Matching your doughnut chart colors
    totalVolume: '#4ECDC4'
  };

  const title = type === 'openInterest' ? 'Open Interest History' : 'Total Volume History';

  return (
    <MarketModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={type}
              stroke={colors[type]}
              fill={colors[type]}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MarketModal>
  );
};

export default VolumeMetricsModal; 