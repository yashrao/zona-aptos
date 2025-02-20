import { useQuery } from "@tanstack/react-query";
import { getLondonIndexData } from "../api/get-london-index";

export function useLondonIndexData() {
  return useQuery({
    queryKey: ["londonIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getLondonIndexData(
        "1tnZASNLOytzlsBWXmlPM_hoBHi0RONA-UatEe7ghiFY",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}