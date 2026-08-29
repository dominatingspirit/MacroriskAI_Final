import { apiFetch } from "./client";
import type {
  AnalyzeCompanyResponse,
  ChatRequest,
  ChatResponse,
  CompanyFinancialsResponse,
  CompanyForecastRequest,
  CompanyList,
  EMIRequest,
  EMIResponse,
  ExplainResponse,
  ForecastRequest,
  ForecastResponse,
  LeaderboardResponse,
  PortfolioAnalysis,
  PortfolioCompareRequest,
  PortfolioCompareResponse,
  PortfolioRequest,
  RealityCheckResponse,
  SalaryRequest,
  SalaryResponse,
  SectorIntelligenceResponse,
  SectorList,
  StressTestRequest,
  StressTestResponse,
} from "./types";

/**
 * One function per backend route. Paths, methods, and payload shapes are
 * kept byte-for-byte identical to main.py — nothing is renamed here.
 */

import { getApiBaseUrl } from "./client";
import type { PortfolioUploadResponse } from "./types";

export async function uploadPortfolioCSV(file: File, monthsAhead = 3): Promise<PortfolioUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  // Use your global apiFetch helper or standard client setup matching your other routes
  const res = await fetch(
    `http://127.0.0.1:8000/api/portfolio/upload?months_ahead=${monthsAhead}`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}
export function getHealth(signal?: AbortSignal) {
  return apiFetch<{ message: string }>("/", { signal });
}

export function postForecast(req: ForecastRequest, signal?: AbortSignal) {
  return apiFetch<ForecastResponse>("/forecast", { method: "POST", body: req, signal });
}

export function getSectors(signal?: AbortSignal) {
  return apiFetch<SectorList>("/sectors", { signal });
}

export function getCompaniesBySector(sectorName: string, signal?: AbortSignal) {
  return apiFetch<CompanyList>(`/companies/${encodeURIComponent(sectorName)}`, { signal });
}

export function getCompanyFinancials(companyName: string, signal?: AbortSignal) {
  return apiFetch<CompanyFinancialsResponse>(
    `/company_financials/${encodeURIComponent(companyName)}`,
    { signal },
  );
}

export function postAnalyzeCompany(req: CompanyForecastRequest, signal?: AbortSignal) {
  return apiFetch<AnalyzeCompanyResponse>("/analyze_company", { method: "POST", body: req, signal });
}

export function postChat(req: ChatRequest, signal?: AbortSignal) {
  return apiFetch<ChatResponse>("/chat", { method: "POST", body: req, signal });
}

export function getLeaderboard(monthsAhead = 3, signal?: AbortSignal) {
  return apiFetch<LeaderboardResponse>(`/api/companies/leaderboard?months_ahead=${monthsAhead}`, { signal });
}

export function getSectorIntelligence(monthsAhead = 3, signal?: AbortSignal) {
  return apiFetch<SectorIntelligenceResponse>(`/api/sectors/intelligence?months_ahead=${monthsAhead}`, { signal });
}

export function postEMI(req: EMIRequest, signal?: AbortSignal) {
  return apiFetch<EMIResponse>("/api/retail/emi", { method: "POST", body: req, signal });
}

export function postSalary(req: SalaryRequest, signal?: AbortSignal) {
  return apiFetch<SalaryResponse>("/api/retail/salary", { method: "POST", body: req, signal });
}

export function analyzePortfolio(req: PortfolioRequest, signal?: AbortSignal) {
  return apiFetch<PortfolioAnalysis>("/api/portfolio/analyze", { method: "POST", body: req, signal });
}

export function comparePortfolios(req: PortfolioCompareRequest, signal?: AbortSignal) {
  return apiFetch<PortfolioCompareResponse>("/api/portfolio/compare", { method: "POST", body: req, signal });
}

export function stressTestPortfolio(req: StressTestRequest, signal?: AbortSignal) {
  return apiFetch<StressTestResponse>("/api/portfolio/stress_test", { method: "POST", body: req, signal });
}

export function explainCompany(
  companyName: string,
  mode: "resilient" | "vulnerable" = "resilient",
  signal?: AbortSignal,
) {
  return apiFetch<ExplainResponse>(
    `/api/companies/${encodeURIComponent(companyName)}/explain?mode=${mode}`,
    { signal },
  );
}

export function realityCheckCompany(companyName: string, signal?: AbortSignal) {
  return apiFetch<RealityCheckResponse>(
    `/api/companies/${encodeURIComponent(companyName)}/reality-check`,
    { signal },
  );
}
