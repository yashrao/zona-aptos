import { useQuery } from "@tanstack/react-query";
import { getMelbourneIndexData } from "../api/get-melbourne-index";

export function useMelbourneIndexData() {
  return useQuery({
    queryKey: ["melbourneIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getMelbourneIndexData(
        "19dTSXd8pAgEDzG5HwUh-SBPZsnuAI6j1NBv1h5775Ak",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}