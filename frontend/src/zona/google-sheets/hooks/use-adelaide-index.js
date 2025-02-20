import { useQuery } from "@tanstack/react-query";
import { getAdelaideIndexData } from "../api/get-adelaide-index";

export function useAdelaideIndexData() {
  return useQuery({
    queryKey: ["adelaideIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getAdelaideIndexData(
        "13DLbpxiInCaW0rGybkXvjePGcr0fJ3pHMW6F072Gj1Q",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}