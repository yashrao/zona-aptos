import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  createChart,
  ColorType,
  UTCTimestamp,
  CrosshairMode,
  TickMarkType,
} from "lightweight-charts";
import TimeframeSelector from "./timeframerRef"; // Import the TimeframeSelector component

type HourlyData = {
  time: UTCTimestamp;
  value: number;
};

type TimeFrame = "7D" | "30D" | "90D" | "180D" | "1Y" | "5Y";

interface TradingViewChartProps {
  city: string;
  type: string;
  data: any;
  isLoading: boolean;
}

const timeframes: TimeFrame[] = ["7D", "30D", "90D", "180D", "1Y", "5Y"];

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  city,
  type,
  data,
  isLoading,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<TimeFrame>("30D");
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const handleTimeFrameChange = useCallback((newTimeFrame: TimeFrame) => {
    setTimeRange(newTimeFrame);
  }, []);

  // Filter data based on the selected time range
  const chartData = useMemo(() => {
    if (!data || !data.time || !data.index) return [];

    const now = Math.floor(Date.now() / 1000); // Current time in Unix seconds
    let startTime;

    switch (timeRange) {
      case "7D":
        startTime = now - 7 * 86400;
        break;
      case "30D":
        startTime = now - 30 * 86400;
        break;
      case "90D":
        startTime = now - 90 * 86400;
        break;
      case "180D":
        startTime = now - 180 * 86400;
        break;
      case "1Y":
        startTime = now - 365 * 86400;
        break;
      case "5Y":
        startTime = now - 5 * 365 * 86400;
        break;
      default:
        startTime = now - 30 * 86400; // Default to 30 days
    }

    return data.time
      .map((timestamp: number, index: number) => ({
        time: timestamp,
        value: parseFloat(data.index[index]),
      }))
      .filter((d: HourlyData) => d.time >= startTime)
      .filter(
        (d: HourlyData, index: number, self: HourlyData[]) =>
          index === self.findIndex((t: HourlyData) => t.time === d.time),
      )
      .sort((a: HourlyData, b: HourlyData) => a.time - b.time);
  }, [data, timeRange]);

  const legendRef = useRef<HTMLDivElement>(null);

  // Get the currency symbol based on the city
  const getCurrency = (city: string): string => {
    if (type === "Air Quality") {
      return "AQHI ";
    }
    switch (city) {
      case "Hong Kong":
        return "HKD ";
      case "Singapore":
        return "SGD ";
      case "Dubai":
        return "AED ";
      case "Sydney":
      case "Melbourne":
      case "Brisbane":
      case "Adelaide":
        return "AUD ";
      case "London":
        return "GBP ";
      default:
        return "$";
    }
  };

  // Initialize and update the chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const formatPrice = (price: number): string => {
      if (price >= 10000) {
        return Math.round(price).toString();
      } else if (price >= 1000) {
        return price.toFixed(1);
      } else if (price >= 100) {
        return price.toFixed(2);
      } else if (price >= 10) {
        return price.toFixed(3);
      } else {
        return price.toFixed(4);
      }
    };

    const formatPrice2 = (price: number): string => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: "solid" as ColorType, color: "rgba(0, 0, 0, 0)" },
        textColor: "#C5C8D3",
        fontSize: 13,
      },
      grid: {
        vertLines: {
          color: "rgba(211, 211, 211, 0.1)",
          style: 3,
        },
        horzLines: {
          color: "rgba(211, 211, 211, 0.1)",
          style: 3,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
      timeScale: {
        borderVisible: true,
        borderColor: "#555",
        ticksVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 6,
      },
      localization: {
        locale: "en-US",
        dateFormat: "dd MMM 'yy",
      },
      handleScroll: false,
      handleScale: false,
    });

    const mainSeries = chart.addAreaSeries({
      lineColor: "#23F98A",
      topColor: "rgba(35, 249, 138, 0.4)",
      bottomColor: "rgba(35, 249, 138, 0)",
      priceFormat: {
        type: "custom",
        formatter: formatPrice,
      },
    });

    mainSeries.setData(chartData);

    const timeScale = chart.timeScale();
    timeScale.fitContent();
    chartRef.current = chart;

    if (legendRef.current) {
      legendRef.current.style.position = "absolute";
      legendRef.current.style.zIndex = "10";
      legendRef.current.style.padding = "8px";
      legendRef.current.style.borderRadius = "4px";

      if (isMobile) {
        legendRef.current.style.left = "12px";
        legendRef.current.style.top = "20px"; // Adjust this value to position below the TimeframeSelector
      } else {
        legendRef.current.style.left = "18px";
        legendRef.current.style.top = "0px";
      }

      const updateLegend = (param: any) => {
        const seriesData = param.seriesData.get(mainSeries);
        let price: number | undefined;
        let priceFormatted = "";
        let color = "white";

        const firstDataPoint = mainSeries.dataByIndex(10000000, -1);

        if (firstDataPoint) {
          price =
            "value" in firstDataPoint
              ? (firstDataPoint.value as number)
              : "close" in firstDataPoint
                ? (firstDataPoint.close as number)
                : undefined;
        }

        if (seriesData) {
          price =
            "value" in seriesData
              ? (seriesData.value as number)
              : "close" in seriesData
                ? (seriesData.close as number)
                : price;
        }

        if (price !== undefined) {
          priceFormatted = formatPrice2(price);
        }

        const currency = getCurrency(city);

        legendRef.current!.innerHTML = `
          <div style="font-size: ${isMobile ? "16px" : "20px"}; white-space: nowrap;">
            <span style="color: white; font-weight: bold;">${city}</span> ·
            <span style="color: ${color};">${currency}${priceFormatted}</span>
          </div>
        `;
      };

      chart.subscribeCrosshairMove(updateLegend);
      updateLegend({ seriesData: new Map([[mainSeries, null]]) });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (chartRef.current) {
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({ width, height });
        chartRef.current.timeScale().fitContent();
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    // Cleanup on unmount
    return () => {
      chart.remove();
    };
  }, [chartData, timeRange, city, type, isMobile]);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  //const { isLoading } = getCityData()!;

  if (isLoading) return <div>Loading...</div>;
  if (chartData.length === 0) return <div>No data available</div>;

  return (
    <div className="p-4 rounded-lg relative">
      <div className="relative" style={{ height: "360px" }}>
        <div
          ref={chartContainerRef}
          id="tradingViewChart"
          className="absolute inset-0 flex items-center justify-center"
        />
        <div ref={legendRef} className="absolute z-10 text-white font-light" />
        <TimeframeSelector
          timeframes={timeframes}
          timeRange={timeRange}
          onTimeFrameChange={handleTimeFrameChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
