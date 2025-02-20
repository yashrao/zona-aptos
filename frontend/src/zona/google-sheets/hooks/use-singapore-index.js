import { useQuery } from "@tanstack/react-query";
import { getSingaporeIndexData } from "../api/get-singapore-index";

export function useSingaporeIndexData() {
  return useQuery({
    queryKey: ["singaporeIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getSingaporeIndexData(
        "1ol4SlHDYxrlCHkT2z0VFeJSUYJ6M2_8NlLpqAwfO0V4",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}