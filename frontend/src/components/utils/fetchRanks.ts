import { useQuery } from '@tanstack/react-query';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Player {
  rank: number;
  address: string;
  wins: number;
  losses: number;
  favoriteCity: string;
  favoriteMarket: string;
}

export const fetchRanks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/ranks`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const fetchRank = async (address: string | undefined) => {
  if (!address) return { data: undefined, error: null };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/ranks?player=${address}`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: undefined, error };
  }
};
