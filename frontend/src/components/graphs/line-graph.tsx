import { FC, useMemo } from "react";
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

interface LineGraphProps {
  data: any;
  currency: string;
  xDisplay?: boolean;
  yDisplay?: boolean;
  yTextSize?: number;
  timeFrame: string;
  formatYAxis: (value: number, currency: string) => string;
  isMobile: boolean;
  [key: string]: any;
}

const LineGraph: FC<LineGraphProps> = ({
  data,
  currency = "HK$",
  xDisplay = false,
  yDisplay = false,
  yTextSize = 16,
  timeFrame,
  formatYAxis,
  isMobile,
  ...props
}) => {
  const chartData = useMemo(() => {
    if (!data || !data.datasets || data.datasets.length === 0) return [];
    return data.datasets[0].data;
  }, [data]);

  const generateCustomLabels = (data: any[], timeFrame: string) => {
    if (!data || data.length === 0) return [];
    
    const formatLabel = (date: string) => {
      if (timeFrame === "All Time") {
        return dayjs(date).format("MMM'YY");
      }
      return dayjs(date).format("MMM D");
    };
  
    if (timeFrame === "7D") {
      const startDate = dayjs(data[0].date).add(1, 'day').startOf('day');
      const endDate = dayjs(data[data.length - 1].date).endOf('day');
      
      let currentDay = startDate;
      const labelDates = new Set<string>();
  
      while (currentDay.isBefore(endDate) || currentDay.isSame(endDate, 'day')) {
        labelDates.add(currentDay.format('YYYY-MM-DD'));
        currentDay = currentDay.add(1, 'day');
      }
  
      return data.map((item, index) => {
        const itemDate = dayjs(item.date);
        const dateString = itemDate.format('YYYY-MM-DD');
        
        if (labelDates.has(dateString)) {
          if (index === 0 || !dayjs(data[index - 1].date).isSame(itemDate, 'day')) {
            labelDates.delete(dateString);
            return formatLabel(item.date);
          }
        }
        return '';
      });
    } else if (["30D", "90D", "All Time"].includes(timeFrame)) {
      const startLabelIndex = Math.floor(data.length * 0.03); // 3% of the data length
      const endLabelIndex = data.length - 1;
      const maxLabels = 10;
      const interval = Math.max(1, Math.floor((endLabelIndex - startLabelIndex) / (maxLabels - 1)));
  
      let labels: string[] = [];
      let lastMonth = '';
  
      return data.map((item, index) => {
        if (index < startLabelIndex) {
          return ''; // No label for the first 3% of the graph
        }
  
        const itemDate = dayjs(item.date);
        const isIntervalPoint = (index - startLabelIndex) % interval === 0 || index === endLabelIndex;
  
        if (isIntervalPoint && labels.length < maxLabels) {
          const label = formatLabel(item.date);
          
          if (timeFrame === "All Time") {
            const month = itemDate.format("MMM'YY");
            if (month !== lastMonth) {
              lastMonth = month;
              labels.push(label);
              return label;
            }
          } else {
            labels.push(label);
            return label;
          }
        }
        return '';
      });
    }
  
    return []; // Default case
  };

  const customLabels = generateCustomLabels(chartData, timeFrame);

  const calculateNiceScale = (min: number, max: number, maxTicks: number = 12) => { // Doubled from 6 to 12
    const range = niceNum(max - min, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(min / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
    return { min: niceMin, max: niceMax, tickInterval: tickSpacing };
  };

  const niceNum = (range: number, round: boolean) => {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  };

  const yAxisMin = Math.min(...chartData.map((item: any) => item.value));
  const yAxisMax = Math.max(...chartData.map((item: any) => item.value));
  const { min: niceMin, max: niceMax, tickInterval } = calculateNiceScale(yAxisMin, yAxisMax);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const index = params[0].dataIndex;
        const date = data.datasets[0].data[index].date;
        const value = params[0].value;
        
        const formattedDate = dayjs(date).format('MMMM D, YYYY HH:mm').toUpperCase();
        const formattedValue = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        return `
          <div style="font-size: 14px; color: white;">
            <div style="font-weight: bold;">${formattedDate}</div>
            <div style="display: flex; align-items: center; margin-top: 5px;">
              <div style="width: 12px; height: 12px; background-color: #20FC8F; margin-right: 5px;"></div>
              ${data.datasets[0].label} ${currency} ${formattedValue}
            </div>
          </div>
        `;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#20FC8F',
      borderWidth: 1,
      textStyle: {
        color: 'white',
      },
      extraCssText: 'border-radius: 8px; padding: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          type: 'dashed'
        },
        label: {
          show: false // Hide the default label
        }
      }
    },
    animation: false,
    grid: {
      left: '10%', // Reduced from 13% to accommodate smaller labels
      right: '4%',
      bottom: isMobile ? '10%' : '3%',
      top: isMobile ? '10%' : '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: customLabels,
      show: xDisplay,
      axisLabel: {
        rotate: 0,
        color: 'white',
        fontSize: 12,
        margin: 20,
        align: 'center',
        interval: (index: number, value: string) => value !== ''
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true,  // Changed from false to true
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',  // Set the color of the x-axis line to white
          width: 1  // Set the width of the line (adjust as needed)
        }
    },
    splitLine: {
      show: false
    }
    },
    yAxis: {
      type: 'value',
      show: yDisplay,
      min: niceMin,
      max: niceMax,
      interval: tickInterval,
      axisLabel: {
        formatter: function (value: number) {
          const formattedValue = formatYAxis(value, currency);
          const valueWithoutCurrency = formattedValue.replace(new RegExp(`${currency}`, 'g'), '').trim();
          const valueWithCommas = valueWithoutCurrency.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return `${valueWithCommas}`; // Added space after currency
        },
        color: '#FFFFFF', // Changed to grey color
        fontSize: isMobile ? 8 : 10, // Significantly reduced font size
        padding: [0, 10, 0, 0], // Reduced right padding
      },
      splitLine: {
        show: false
      },
      axisLine: {
        show: false // Hide the y-axis line
      },
      axisTick: {
        show: false // Hide the y-axis ticks
      },
      
    },
    series: [{
      name: data.datasets[0].label,
      type: 'line',
      data: data.datasets[0].data.map((item: any) => item.value),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#20FC8F',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(32, 252, 143, 0.2)'
          }, {
            offset: 1, color: 'rgba(32, 252, 143, 0)'
          }]
        }
      }
    }]
  };

  return (
    <div {...props}>
      <ReactECharts 
        option={option} 
        style={{ height: isMobile ? '200px' : '400px', width: '100%' }} 
      />
    </div>
  );
};

export default LineGraph;
