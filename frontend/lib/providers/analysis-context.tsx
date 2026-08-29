"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AnalyzeCompanyResponse } from "@/lib/api/types";

interface AnalysisContextValue {
  lastAnalysis: AnalyzeCompanyResponse | null;
  setLastAnalysis: (result: AnalyzeCompanyResponse | null) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

/**
 * Holds the most recent POST /analyze_company result in memory so the
 * Assistant page can forward it as `context` on POST /chat — exactly the
 * "Live Pipeline Context" pattern the reference index.html implements with
 * a plain global variable.
 */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [lastAnalysis, setLastAnalysis] = useState<AnalyzeCompanyResponse | null>(null);

  const value = useMemo(() => ({ lastAnalysis, setLastAnalysis }), [lastAnalysis]);

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysisContext() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  return ctx;
}
