import React, { useEffect } from "react";
//import { useIndex } from "@/zona/google-sheets/hooks/use-index";
import { useIndex } from "@/components/utils/fetchData";

import { PriceData } from "../markets/pricedata";

interface PriceTrackerProps {
  onPricesUpdate: (prices: Record<string, PriceData | null>) => void;
}

const PriceTracker: React.FC<PriceTrackerProps> = ({ onPricesUpdate }) => {
  const { data: hongKongData } = useIndex("hongkong", "realestate", true);
  const { data: singaporeData } = useIndex("singapore", "realestate", true);
  const { data: dubaiData } = useIndex("dubai", "realestate", true);
  const { data: londonData } = useIndex("london", "realestate", true);
  //const { data: sydneyData } = useIndex("sydney", "realestate");
  //const { data: melbourneData } = useIndex("melbourne", "realestate");
  //const { data: brisbaneData } = useIndex("brisbane", "realestate");
  //const { data: adelaideData } = useIndex("adelaide", "realestate");

  //const { data: hongKongAirData } = useIndex("hongkong", "airquality");
  //const { data: delhiAirData } = useIndex("delhi", "airquality");

  useEffect(() => {
    const getPrices = (data: any): PriceData | null => {
      if (!data || data == "") return null;

      return {
        current: data.now,
        "24h": data.previous,
        "7d": data.previousWeek,
        "30d": data.previousMonth, // NOTE: implement later if needed
        ytd: data.previous,
        "1y": data.previousYear, // NOTE: implement later if needed
      };
    };

    const prices: Record<string, PriceData | null> = {
      "Hong Kong": getPrices(hongKongData),
      Singapore: getPrices(singaporeData),
      Dubai: getPrices(dubaiData),
      //Sydney: getPrices(sydneyData),
      //Melbourne: getPrices(melbourneData),
      London: getPrices(londonData),
      //Brisbane: getPrices(brisbaneData),
      //Adelaide: getPrices(adelaideData),
      //"Hong Kong Air Quality": getPrices(hongKongAirData),
      //"Delhi Air Quality": getPrices(delhiAirData),
    };

    console.log("Prices updated in PriceTracker:", prices);
    onPricesUpdate(prices);
  }, [
    hongKongData,
    singaporeData,
    dubaiData,
    //sydneyData,
    //melbourneData,
    londonData,
    //brisbaneData,
    //adelaideData,
    //hongKongAirData,
    //delhiAirData,
    onPricesUpdate,
  ]);

  return null; // This component doesn't render anything
};

export default PriceTracker;
