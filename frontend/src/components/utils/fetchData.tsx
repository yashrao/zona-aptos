import useSWR from "swr";
import { useQuery } from '@tanstack/react-query'; 

function fetcher(url: string) {
  return fetch(url).then((res) => res.json());
}

export function useIndex(city: string, type: string, latest: boolean) {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/index-data?city=${city}&index=${type}${latest ? "&latest=true" : ""}`,
    fetcher,
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}

export const fetchRanks = async () => {
  try {
    const response = await fetch('/api/ranks');
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const fetchRank = (address: string | undefined) => {
  return useQuery({
    queryKey: ['rank', address],
    queryFn: async () => {
      if (!address) return undefined;
      const response = await fetch(`/api/rank/${address}`);
      const data = await response.json();
      return data;
    },
    enabled: !!address,
  });
}; 