import { useQuery } from "@tanstack/react-query";
import { getHongKongIndexData } from "../api/get-hong-kong-index";

export function useHongKongIndexData() {
  return useQuery({
    queryKey: ["hongKongIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getHongKongIndexData(
        "1Dwb5B0WLXMCi-5nrxuekmuj-NlP_0wFECDjA6fuqDP8",
        "I20:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}