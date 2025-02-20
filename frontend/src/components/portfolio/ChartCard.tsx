import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

interface ChartCardProps {
  data: [number, number][];
}

export default function ChartCard({ data }: ChartCardProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'Max'>('30d');

  const { chartData, xAxisLabels } = useMemo(() => {
    const endDate = dayjs(data[data.length - 1][0]);
    let filteredData;
    let interval: number;

    switch (timeRange) {
      case '30d':
        filteredData = data.filter(([timestamp]) => dayjs(timestamp).isAfter(endDate.subtract(30, 'day')));
        interval = 3;
        break;
      case '90d':
        filteredData = data.filter(([timestamp]) => dayjs(timestamp).isAfter(endDate.subtract(90, 'day')));
        interval = 7;
        break;
      case 'Max':
        filteredData = data;
        interval = Math.max(Math.floor(data.length / 10), 30);
        break;
      default:
        filteredData = data;
        interval = 30;
    }

    const startDate = dayjs(filteredData[0][0]);
    const xAxisLabels = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      xAxisLabels.push(currentDate.valueOf());
      currentDate = currentDate.add(interval, 'day');
    }

    return { chartData: filteredData, xAxisLabels };
  }, [data, timeRange]);

  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F1216',
        borderColor: '#0F1216',
        textStyle: {
          color: 'white',
          fontSize: 14
        },
        padding: [12, 16],
        formatter: function (params: any) {
          const date = dayjs(params[0].value[0]).format('dddd, MMMM D, YYYY').toUpperCase();
          let tooltipContent = `
            <div style="width: 240px;">
              <div class="text-sm font-bold mb-2">${date}</div>
          `;

          params.forEach((param: any) => {
            const value = param.value;

            tooltipContent += `
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <span class="inline-block w-3 h-3 mr-2" style="background-color: #23F98A;"></span>
                  <span class="text-white">Account Balance</span>
                </div>
                <span class="font-bold">$${value[1].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            `;
          });

          tooltipContent += '</div>';
          return tooltipContent;
        },
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);'
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#AFAFAF' } },
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: number) => dayjs(value).format('MMM D'),
          color: '#FFFFFF',
          interval: (index: number, value: number) => xAxisLabels.includes(value)
        },
        axisTick: {
          alignWithLabel: true
        },
        min: xAxisLabels[0],
        max: xAxisLabels[xAxisLabels.length - 1]
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#AFAFAF' } },
        splitLine: { show: false },
        axisLabel: {
          formatter: (value: number) => `$${Math.round(value)}`,
          color: '#FFFFFF',
          fontSize: 14
        },
      },
      series: [{
        data: chartData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#23F98A',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(35, 249, 138, 0.5)'
            }, {
              offset: 1, color: 'rgba(35, 249, 138, 0)'
            }],
          }
        },
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    };
  }, [chartData, xAxisLabels]);

  return (
    <div className="lg:col-span-2 bg-[#0F1216] border border-[#222226] rounded-lg p-4 md:p-5 h-[400px] md:h-[600px]">
      <div className="flex justify-end mb-2 md:mb-2.5">
        {['30d', '90d', 'Max'].map((range) => (
          <button
            key={range}
            className={`ml-1 px-2 md:px-4 py-1 md:py-2.5 rounded text-sm md:text-base transition-colors duration-300 ${
              timeRange === range 
                ? 'bg-[#23F98A] text-black font-bold' 
                : 'bg-[#1E2024] text-white hover:bg-[#2A2D32]'
            }`}
            onClick={() => setTimeRange(range as '30d' | '90d' | 'Max')}
          >
            {range}
          </button>
        ))}
      </div>
      <ReactECharts option={chartOption} style={{ height: '90%', width: '100%' }} />
    </div>
  );
};