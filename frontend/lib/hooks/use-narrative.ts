// frontend/lib/hooks/use-narrative.ts
// New file.
import { useMutation } from "@tanstack/react-query";
import { explainCompany, realityCheckCompany } from "@/lib/api/endpoints";

export function useExplainCompany() {
  return useMutation({
    mutationFn: ({ company, mode }: { company: string; mode: "resilient" | "vulnerable" }) =>
      explainCompany(company, mode),
  });
}

export function useRealityCheck() {
  return useMutation({
    mutationFn: (company: string) => realityCheckCompany(company),
  });
}
