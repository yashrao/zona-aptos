import { useQuery } from "@tanstack/react-query";
import { getBrisbaneIndexData } from "../api/get-brisbane-index";

export function useBrisbaneIndexData() {
  return useQuery({
    queryKey: ["brisbaneIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getBrisbaneIndexData(
        "1M60kkggobepvucpGVHz0Y2jHhOg1EiRAFitq4c6PYAU",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}