# services/resilience_score.py
from __future__ import annotations
import pandas as pd

from Agent_1.inflation_outlook_agent import MacroAgent
from Agent_3.scenario_resilience_agent import FinancialAgent
from services.ml_resilience_model import ResilienceModel
from services.feature_engineering import RAW_METRICS


class ResilienceScoreEngine:
    """Computes the 0-100 Inflation Resilience Score for all companies, under
    a single shared macro scenario from Agent 1.

    The score blends:
      - a PCA-derived statistical composite of sector-relative growth
        (always available, company-specific via recent actuals)
      - a GradientBoosting classifier trained on how companies actually
        performed during India's real historical high-inflation years
        (only used once there's enough labeled history to trust it — see
        services/ml_resilience_model.py for the exact thresholds)

    WHY we don't use Agent 3's forecast values directly as the feature row:
      Agent 3 is a sector-level OLS model — it produces the same predicted
      growth for every company in a sector (only industry dummies and macro
      interactions are in the model).  If we scored those values, every company
      in "Infrastructure_RealEstate_Logistics" would get an identical score.

    WHAT we do instead:
      1. Take each company's actual trailing average of the last N years
         (company-specific, always different).
      2. Multiply by Agent 3's macro-sensitivity ratio for that sector
         (forecast impact vs baseline), so the score reflects how the macro
         outlook amplifies or dampens that company's historical track record.
      3. Feed the result into the ML/statistical blended scorer.
    """

    _TRAILING_YEARS = 3  # how many recent years to average per company

    def __init__(self, macro_agent: MacroAgent, financial_agent: FinancialAgent):
        self.macro_agent = macro_agent
        self.financial_agent = financial_agent
        self._model: ResilienceModel | None = None
        self._cache: list[dict] | None = None
        self._cache_key: int | None = None

    def _trailing_avg_per_company(self) -> pd.DataFrame:
        """Mean of the last N years of each RAW_METRIC per company.
        This is the company-specific part that differentiates peers."""
        df = self.financial_agent.get_data()
        recent = (
            df.sort_values("Year")
            .groupby("Company", as_index=False)
            .tail(self._TRAILING_YEARS)
        )
        agg = {m: "mean" for m in RAW_METRICS if m in recent.columns}
        agg["Industry_Group"] = "last"
        return recent.groupby("Company", as_index=False).agg(agg)

    def _macro_sensitivity_ratios(
        self, proj_inf: float, proj_repo: float, proj_brent: float
    ) -> dict[str, dict[str, float]]:
        """For each sector, compute forecast vs baseline impact per metric
        using Agent 3. Returns {sector: {metric: ratio}} — one entry per
        unique sector. ratio > 1 = sector benefits from macro outlook,
        < 1 = sector is hurt."""
        df = self.financial_agent.get_data()
        # One representative company per sector
        sector_rep = (
            df.sort_values("Year")
            .groupby("Industry_Group", as_index=False)
            .tail(1)
            .groupby("Industry_Group", as_index=False)
            .last()
        )
        ratios: dict[str, dict[str, float]] = {}
        for _, row in sector_rep.iterrows():
            sector = row["Industry_Group"]
            company = row["Company"]
            try:
                result = self.financial_agent.execute(
                    company_name=company,
                    historical_data={"historical_trend": [row.to_dict()]},
                    proj_inf=proj_inf,
                    proj_repo=proj_repo,
                    proj_brent=proj_brent,
                )
            except Exception:
                ratios[sector] = {m: 1.0 for m in RAW_METRICS}
                continue
            impact = result.get("impact_vs_baseline", {})
            sector_ratios: dict[str, float] = {}
            for m in RAW_METRICS:
                delta = impact.get(m, 0.0)
                # Nudge by macro direction, cap to [0.5, 2.0] so outliers don't dominate
                sector_ratios[m] = max(0.5, min(2.0, 1.0 + delta / 100.0))
            ratios[sector] = sector_ratios
        return ratios

    def _get_model(self) -> ResilienceModel:
        # Fit once and cache — training loops over the full historical panel
        if self._model is None:
            panel = self.financial_agent.get_data()
            self._model = ResilienceModel().fit(panel)
        return self._model

    def compute(self, months_ahead: int = 3, force_refresh: bool = False) -> list[dict]:
        if not force_refresh and self._cache is not None and self._cache_key == months_ahead:
            return self._cache

        model = self._get_model()
        macro = self.macro_agent.execute(input_payload=None, months_ahead=months_ahead)
        proj_inf = macro["inflation_forecast"]["final_inflation"]
        proj_repo = macro["trajectory"][-1]["projected_repo"]
        proj_oil = macro["trajectory"][-1]["projected_oil"]

        # Company-specific trailing actuals (the differentiating signal)
        universe = self._trailing_avg_per_company()

        # Sector-level macro sensitivity ratios (the macro-outlook signal)
        ratios = self._macro_sensitivity_ratios(proj_inf, proj_repo, proj_oil)

        forecast_records: list[dict] = []
        for _, row in universe.iterrows():
            company = row["Company"]
            sector = row.get("Industry_Group", "")
            sector_ratios = ratios.get(sector, {m: 1.0 for m in RAW_METRICS})
            record = {"Company": company, "Industry_Group": sector}
            for m in RAW_METRICS:
                actual = float(row.get(m, 0.0))
                # Macro-adjusted: company's own track record scaled by macro direction
                record[m] = round(actual * sector_ratios.get(m, 1.0), 4)
            forecast_records.append(record)

        full_panel = self.financial_agent.get_data()
        scored = model.score(full_panel, forecast_records)

        self._cache = scored
        self._cache_key = months_ahead
        return self._cache

    def diagnostics(self) -> dict:
        """Model methodology, training sample size, cross-validated AUC, and
        PCA weights."""
        return self._get_model().diagnostics

    def for_companies(self, company_names: list[str], months_ahead: int = 3) -> list[dict]:
        """Subset lookup used by the Portfolio Lab — reuses the cached universe."""
        leaderboard = {r["Company"].lower(): r for r in self.compute(months_ahead=months_ahead)}
        return [leaderboard[c.lower()] for c in company_names if c.lower() in leaderboard]

    def get_by_company(self, company_name: str, months_ahead: int = 3) -> dict | None:
        """Single-company lookup used by the /explain and /reality-check routes."""
        matches = self.for_companies([company_name], months_ahead=months_ahead)
        return matches[0] if matches else None
