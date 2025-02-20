import { useHongKongIndexData } from "@/zona/google-sheets/hooks/use-hong-kong-index";
import { useSingaporeIndexData } from "@/zona/google-sheets/hooks/use-singapore-index";
import { useDubaiIndexData } from "@/zona/google-sheets/hooks/use-dubai-index";
import { useSydneyIndexData } from "@/zona/google-sheets/hooks/use-sydney-index";
import { useMelbourneIndexData } from "@/zona/google-sheets/hooks/use-melbourne-index";
import { useLondonIndexData } from "@/zona/google-sheets/hooks/use-london-index";
import { useBrisbaneIndexData } from "@/zona/google-sheets/hooks/use-brisbane-index";
import { useAdelaideIndexData } from "@/zona/google-sheets/hooks/use-adelaide-index";

//NOTE: Seems useless?
//TODO: DELETE THIS FILE????
export const useIndexData = () => {
  const { data: hongKongData } = useHongKongIndexData();
  const { data: singaporeData } = useSingaporeIndexData();
  const { data: dubaiData } = useDubaiIndexData();
  const { data: sydneyData } = useSydneyIndexData();
  const { data: melbourneData } = useMelbourneIndexData();
  const { data: londonData } = useLondonIndexData();
  const { data: brisbaneData } = useBrisbaneIndexData();
  const { data: adelaideData } = useAdelaideIndexData();

  const currentIndexData = {
    "Hong Kong": hongKongData,
    "Singapore": singaporeData,
    "Dubai": dubaiData,
    "Sydney": sydneyData,
    "Melbourne": melbourneData,
    "London": londonData,
    "Brisbane": brisbaneData,
    "Adelaide" : adelaideData,

  };

  return { hongKongData, singaporeData, dubaiData, sydneyData, melbourneData, londonData, brisbaneData, adelaideData, currentIndexData };
};
