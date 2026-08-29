// frontend/lib/hooks/use-leaderboard.ts
// New file — mirrors the existing lib/hooks/use-market-data.ts pattern.
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, getSectorIntelligence } from "@/lib/api/endpoints";

export function useLeaderboard(monthsAhead = 3) {
  return useQuery({
    queryKey: ["leaderboard", monthsAhead],
    queryFn: ({ signal }) => getLeaderboard(monthsAhead, signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSectorIntelligence(monthsAhead = 3) {
  return useQuery({
    queryKey: ["sector-intelligence", monthsAhead],
    queryFn: ({ signal }) => getSectorIntelligence(monthsAhead, signal),
    staleTime: 5 * 60 * 1000,
  });
}
