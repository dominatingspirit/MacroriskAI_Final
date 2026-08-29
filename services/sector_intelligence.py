# services/sector_intelligence.py
import pandas as pd
from services.resilience_score import ResilienceScoreEngine


class SectorIntelligenceEngine:
    def __init__(self, resilience_engine: ResilienceScoreEngine):
        self.resilience_engine = resilience_engine

    def compute(self, months_ahead: int = 3) -> list[dict]:
        records = self.resilience_engine.compute(months_ahead=months_ahead)
        df = pd.DataFrame(records)
        growth_cols = [
            "Net Profit Growth", "Operating Profit Growth", "Operating Cash Flow Growth",
            "Equity Growth", "Total Assets Growth", "Borrowings Growth",
        ]

        out = []
        for sector, group in df.groupby("Industry_Group"):
            positive_share = float((group["resilience_score"] >= 50).mean() * 100)
            high_leverage_share = float(
                (group["Borrowings Growth"] > group["Borrowings Growth"].median()).mean() * 100
            )
            out.append({
                "sector": sector,
                "company_count": int(len(group)),
                "median_resilience_score": round(float(group["resilience_score"].median()), 1),
                # TODO(market-cap): once a Company->MarketCap lookup exists, replace this
                # equal-weighted mean with a MarketCap-weighted np.average(). Structure below
                # is deliberately kept identical so that swap is a one-line change.
                "mean_resilience_score": round(float(group["resilience_score"].mean()), 1),
                "median_growth": {c: round(float(group[c].median()), 2) for c in growth_cols},
                "pct_companies_positive_outlook": round(positive_share, 1),
                "pct_companies_high_leverage": round(high_leverage_share, 1),
            })
        return sorted(out, key=lambda r: r["median_resilience_score"], reverse=True)
