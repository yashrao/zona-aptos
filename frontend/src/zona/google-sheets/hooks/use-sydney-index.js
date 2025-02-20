import { useQuery } from "@tanstack/react-query";
import { getSydneyIndexData } from "../api/get-sydney-index";

export function useSydneyIndexData() {
  return useQuery({
    queryKey: ["sydneyIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getSydneyIndexData(
        "1H6Y6PBhO-jxFHWMYord-Yh4zyJzvwP8NZqs0TXxSpE8",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}