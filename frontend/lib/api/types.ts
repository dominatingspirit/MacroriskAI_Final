/**
 * Wire types for the MacroRisk AI FastAPI backend (main.py).
 *
 * The backend declares no Pydantic response models — every route returns a
 * plain dict. These types are reverse-engineered from the agent source and
 * cross-checked against the reference index.html frontend. Treat optional /
 * partial fields as load-bearing: pandas drops NaN keys entirely rather than
 * emitting null in some payloads (see HistoricalTrendRow).
 */

// ---------------------------------------------------------------------------
// POST /forecast — Agent 1 (MacroAgent)
// ---------------------------------------------------------------------------

export interface ForecastRequest {
  /** 1–6, default 3 on the backend. */
  months_ahead: number;
}

export interface InflationForecast {
  target_horizon_months: number;
  final_target_month: string | null;
  final_inflation: number;
  forecast_lower_bound: number;
  forecast_upper_bound: number;
  model_used: string;
  /** Not currently emitted by the backend — Agent 1 has no model-agreement scoring step. */
  model_agreement_score?: number;
  model_agreement?: "High" | "Medium" | "Low";
}

export interface TrajectoryPoint {
  date: string;
  inflation_forecast: number;
  projected_wpi: number;
  projected_oil: number;
  projected_repo: number;
  projected_exchange: number;
}

export interface UnmatchedHolding {
  csv_name: string;
  reason: string;
}
export interface PortfolioUploadResponse extends PortfolioAnalysis {
  unmatched_from_csv: UnmatchedHolding[];
  ai_insights: string;
}

/**
 * Keys present depend on which pickled models loaded successfully. The
 * "ARIMAX" key is the backend's internal model name — the UI displays this
 * model as "SARIMAX" (it is seasonal), but the wire key is left unchanged.
 */
export type EnsembleBreakdown = Partial<
  Record<"XGBoost" | "LightGBM" | "ARIMAX" | "VAR", number>
>;

/** The two mutually exclusive causes Agent 1 scores; relative_pressure values always sum to 100. */
export type InflationCauseClass = "Demand Pull" | "Cost Push";

export interface InflationCause {
  class: InflationCauseClass | string;
  relative_pressure: Record<InflationCauseClass, number>;
}

/** The two mutually exclusive regimes Agent 1 scores; relative_pressure values always sum to 100. Only `class` is surfaced in the UI — see RegimeDonutChart's removal, regime scores are intentionally not displayed. */
export type InflationRegimeClass = "Normal Inflation" | "Cooling / Deflation";

export interface InflationRegime {
  class: InflationRegimeClass | string;
  relative_pressure: Record<InflationRegimeClass, number>;
}

export interface MacroSummary {
  policy_outlook: "Restrictive" | "Neutral" | "Accommodative";
  commodity_pressure: "High" | "Moderate" | "Low";
}

export interface ForecastResponse {
  inflation_forecast: InflationForecast;
  trajectory: TrajectoryPoint[];
  ensemble_breakdown_final_month: EnsembleBreakdown;
  inflation_cause: InflationCause;
  inflation_regime: InflationRegime;
  macro_summary: MacroSummary;
}

// ---------------------------------------------------------------------------
// GET /sectors, GET /companies/{sector_name}
// ---------------------------------------------------------------------------

export type SectorList = string[];
export type CompanyList = string[];

// ---------------------------------------------------------------------------
// GET /company_financials/{company_name} — Agent 2 (CompanyDataAgent)
// ---------------------------------------------------------------------------

/**
 * One row of the macro-linked growth panel. Missing/NaN values are dropped
 * from the row entirely by the backend (key absence, not null) — index with
 * optional chaining, never assume a key exists.
 */
export interface HistoricalTrendRow {
  Company?: string;
  Year?: number;
  "Borrowings Growth"?: number;
  "Equity Growth"?: number;
  "Total Assets Growth"?: number;
  "Operating Profit Growth"?: number;
  "Net Profit Growth"?: number;
  "Operating Cash Flow Growth"?: number;
  Inflation?: number;
  Industry_Group?: string;
  Repo_Rate?: number;
  Brent_Oil?: number;
  [key: string]: string | number | undefined;
}

/**
 * One row of the raw growth-statements CSV. Missing values ARE emitted, as
 * JSON null (opposite convention from HistoricalTrendRow).
 */
export interface FinancialStatementRow {
  Company?: string;
  Year?: number;
  "Total Liabilities Growth %"?: number | null;
  "Borrowings Growth %"?: number | null;
  "Equity Growth %"?: number | null;
  "Total Assets Growth %"?: number | null;
  "Operating Profit Growth %"?: number | null;
  "Net Profit Growth %"?: number | null;
  "Operating Cash Flow Growth %"?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface CompanyFinancialsResponse {
  company: string;
  industry: string;
  latest_year_available: number;
  historical_trend: HistoricalTrendRow[];
  financial_statements: FinancialStatementRow[];
  /** Alias of financial_statements — identical array, kept for parity with the backend's payload. */
  full_financials: FinancialStatementRow[];
}

// ---------------------------------------------------------------------------
// POST /analyze_company — full LangGraph pipeline (Agents 1 → 2 → 3 → 4)
// ---------------------------------------------------------------------------

export interface CompanyForecastRequest {
  company_name: string;
  /** 1–6, default 3 on the backend. */
  months_ahead: number;
}

export interface MacroAssumptionsUsed {
  projected_inflation: number;
  projected_repo_rate: number;
  projected_brent_oil: number;
}

/** Growth-% forecasts keyed by metric name, e.g. "Net Profit Growth". No "Total Liabilities Growth" key — no trained model exists for it. */
export type FinancialForecasts = Record<string, number>;

/** forecast − baseline, in percentage points, same keys as FinancialForecasts. */
export type MacroImpacts = Record<string, number>;

export interface AnalyzeCompanyResponse {
  company: string;
  forecast_horizon_months: number;
  macro_assumptions_used: MacroAssumptionsUsed;
  historical_baseline: CompanyFinancialsResponse;
  financial_forecasts: FinancialForecasts;
  macro_impacts: MacroImpacts;
  full_macro_context: ForecastResponse;
  /** Markdown report, or a "❌ Error generating report with OpenAI: ..." string on LLM failure (still a 200). */
  investment_report: string | null;
}

// ---------------------------------------------------------------------------
// POST /chat — RAG agent
// ---------------------------------------------------------------------------

export interface ChatRequest {
  query: string;
   chat_history?: ChatMessageData[];
  /** Pass the exact AnalyzeCompanyResponse from a prior run to ground answers in it. */
  context?: AnalyzeCompanyResponse | null;
}

export interface ChatResponse {
  answer: string;
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  detail: string;
}

// ---------------------------------------------------------------------------
// Leaderboard / Resilience Score (Tab 3)
// ---------------------------------------------------------------------------
export interface CompanyResilience {
  Company: string;
  Industry_Group: string;
  "Net Profit Growth": number;
  "Operating Profit Growth": number;
  "Operating Cash Flow Growth": number;
  "Equity Growth": number;
  "Total Assets Growth": number;
  "Borrowings Growth": number;
  resilience_score: number;
  rank: number;
}
export type LeaderboardResponse = CompanyResilience[];

// ---------------------------------------------------------------------------
// Sector Intelligence (Tab 2)
// ---------------------------------------------------------------------------
export interface SectorIntelligence {
  sector: string;
  company_count: number;
  median_resilience_score: number;
  mean_resilience_score: number;
  median_growth: Record<string, number>;
  pct_companies_positive_outlook: number;
  pct_companies_high_leverage: number;
}
export type SectorIntelligenceResponse = SectorIntelligence[];

// ---------------------------------------------------------------------------
// Portfolio Lab (Tab 4)
// ---------------------------------------------------------------------------
export interface PortfolioHolding {
  name: string;
  weight: number;
}

export interface PortfolioRequest {
  companies: PortfolioHolding[];
  months_ahead?: number;
}

export interface PortfolioHoldingResult extends CompanyResilience {
  weight: number;
}

export interface PortfolioAnalysis {
  holdings: PortfolioHoldingResult[];
  missing_companies: string[];
  weighted_resilience_score: number;
  months_ahead: number;
}

export interface PortfolioCompareRequest {
  portfolio_a: PortfolioHolding[];
  portfolio_b: PortfolioHolding[];
  months_ahead?: number;
}

export interface PortfolioCompareResponse {
  portfolio_a: PortfolioAnalysis;
  portfolio_b: PortfolioAnalysis;
}

export interface StressTestRequest {
  companies: PortfolioHolding[];
  override_inflation: number;
  override_repo: number;
  override_oil: number;
}

export interface StressTestResult {
  Company: string;
  weight: number;
  forecasts: Record<string, number>;
}

export interface StressTestResponse {
  scenario: { inflation: number; repo_rate: number; brent_oil: number };
  results: StressTestResult[];
}

// ---------------------------------------------------------------------------
// Retail: EMI Shock Absorber (Tab 6)
// ---------------------------------------------------------------------------
export interface EMIRequest {
  principal: number;
  rate: number;
  tenure_years: number;
  months_ahead?: number;
}
export interface EMIResponse {
  baseline_emi: number;
  projected_emi: number;
  monthly_delta: number;
  annual_delta: number;
  current_repo_rate: number;
  projected_repo_rate: number;
  repo_rate_delta_bps: number;
  months_ahead: number;
}

// ---------------------------------------------------------------------------
// Retail: Salary Copilot (Tab 5)
// ---------------------------------------------------------------------------
export interface SalaryRequest {
  current_salary: number;
  sector?: string;
  months_ahead?: number;
}
export interface SalaryResponse {
  current_salary: number;
  target_salary: number;
  required_raise_pct: number;
  monthly_erosion: number;
  sector: string | null;
  months_ahead: number;
  negotiation_script: string;
}

// ---------------------------------------------------------------------------
// Narrative: Why Resilient? / Why Vulnerable? / Reality Check (Tab 7)
// ---------------------------------------------------------------------------
export interface ExplainResponse {
  Company: string;
  resilience_score: number;
  narrative: string;
}
export interface RealityCheckResponse {
  Company: string;
  reality_check: string;
}
