import { useQuery } from "@tanstack/react-query";
import { getDubaiIndexData } from "../api/get-dubai-index";

export function useDubaiIndexData() {
  return useQuery({
    queryKey: ["dubaiIndexData"],
    queryFn: async () => {
      // Fetch all data
      const data = await getDubaiIndexData(
        "1YQ-hrodEOXzzY0FUrtn2YYVBXeY6vR9QKmzOZTMd4R8",
        "I2:K"
      );

      console.log('Data length:', data.date.length);
      console.log('Latest data point:', data.date[data.date.length - 1], data.time[data.time.length - 1]);

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}