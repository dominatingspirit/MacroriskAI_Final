import { useMutation } from "@tanstack/react-query";
import { analyzePortfolio, comparePortfolios, stressTestPortfolio } from "@/lib/api/endpoints";
import type { PortfolioCompareRequest, PortfolioRequest, StressTestRequest } from "@/lib/api/types";

export function useAnalyzePortfolio() {
  return useMutation({ mutationFn: (req: PortfolioRequest) => analyzePortfolio(req) });
}

export function useComparePortfolios() {
  return useMutation({ mutationFn: (req: PortfolioCompareRequest) => comparePortfolios(req) });
}

export function useStressTestPortfolio() {
  return useMutation({ mutationFn: (req: StressTestRequest) => stressTestPortfolio(req) });
}
import { uploadPortfolioCSV } from "@/lib/api/endpoints";

export function useUploadPortfolio() {
  return useMutation({
    mutationFn: ({ file, monthsAhead }: { file: File; monthsAhead?: number }) =>
      uploadPortfolioCSV(file, monthsAhead),
  });
}