import { useQuery } from "@tanstack/react-query";
import { getIndexData } from "../api/get-index";

export function useIndex(city, type) {
  return useQuery({
    queryKey: ["indexData", city, type],
    queryFn: async () => {
      try {
        const data = await getIndexData(city, type);
        console.log("Data length:", data.date.length);
        console.log(
          "Latest data point:",
          data.date[data.date.length - 1],
          data.time[data.time.length - 1],
        );
        return data;
      } catch (error) {
        console.error("Error fetching index data:", error);
        throw error;
      }
    },
    refetchInterval: 60000,
  });
}
