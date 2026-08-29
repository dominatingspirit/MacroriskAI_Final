"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompaniesBySector, getCompanyFinancials, getHealth, getSectors } from "@/lib/api/endpoints";

/** Polls GET / to drive the connection-status indicator in the app shell. */
export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
    retry: false,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useSectors() {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: ({ signal }) => getSectors(signal),
    staleTime: 5 * 60_000,
  });
}

export function useCompaniesBySector(sector: string | null) {
  return useQuery({
    queryKey: ["companies", sector],
    queryFn: ({ signal }) => getCompaniesBySector(sector as string, signal),
    enabled: Boolean(sector),
    staleTime: 5 * 60_000,
  });
}

export function useCompanyFinancials(companyName: string | null) {
  return useQuery({
    queryKey: ["company-financials", companyName],
    queryFn: ({ signal }) => getCompanyFinancials(companyName as string, signal),
    enabled: Boolean(companyName),
    staleTime: 60_000,
  });
}
