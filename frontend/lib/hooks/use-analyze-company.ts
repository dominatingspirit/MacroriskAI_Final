"use client";

import { useMutation } from "@tanstack/react-query";
import { postAnalyzeCompany } from "@/lib/api/endpoints";
import type { CompanyForecastRequest } from "@/lib/api/types";

export function useAnalyzeCompany() {
  return useMutation({
    mutationFn: (req: CompanyForecastRequest) => postAnalyzeCompany(req),
  });
}
