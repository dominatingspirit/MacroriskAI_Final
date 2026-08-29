# services/portfolio.py
from __future__ import annotations

from Agent_3.scenario_resilience_agent import FinancialAgent
from services.resilience_score import ResilienceScoreEngine


def analyze_portfolio(
    resilience_engine: ResilienceScoreEngine,
    companies: list[dict],  # [{"name": str, "weight": float}, ...]
    months_ahead: int = 3,
) -> dict:
    """Weighted resilience score for one custom portfolio. Raises ValueError
    if weights don't sum to 100 — the frontend should already block this
    client-side, this is the server-side backstop."""
    total_weight = sum(c["weight"] for c in companies)
    if abs(total_weight - 100) > 0.5:
        raise ValueError(f"Portfolio weights must sum to 100 (got {total_weight}).")

    names = [c["name"] for c in companies]
    records = resilience_engine.for_companies(names, months_ahead=months_ahead)
    by_name = {r["Company"].lower(): r for r in records}

    holdings = []
    weighted_score = 0.0
    missing = []
    for c in companies:
        rec = by_name.get(c["name"].lower())
        if rec is None:
            missing.append(c["name"])
            continue
        holdings.append({**rec, "weight": c["weight"]})
        weighted_score += rec["resilience_score"] * (c["weight"] / 100)

    return {
        "holdings": holdings,
        "missing_companies": missing,
        "weighted_resilience_score": round(weighted_score, 1),
        "months_ahead": months_ahead,
    }


def compare_portfolios(
    resilience_engine: ResilienceScoreEngine,
    portfolio_a: list[dict],
    portfolio_b: list[dict],
    months_ahead: int = 3,
) -> dict:
    """Head-to-head Portfolio A vs. Portfolio B."""
    return {
        "portfolio_a": analyze_portfolio(resilience_engine, portfolio_a, months_ahead),
        "portfolio_b": analyze_portfolio(resilience_engine, portfolio_b, months_ahead),
    }


def stress_test_portfolio(
    financial_agent: FinancialAgent,
    companies: list[dict],  # [{"name": str, "weight": float}]
    override_inflation: float,
    override_repo: float,
    override_oil: float,
) -> dict:
    """"What if inflation hits 7.0%?" — bypasses ResilienceScoreEngine's
    cached live macro forecast entirely and runs Agent 3 directly per
    company against a manually chosen macro scenario from the slider."""
    df = financial_agent.get_data()
    latest = df.sort_values("Year").groupby("Company", as_index=False).tail(1)
    latest_by_name = {row["Company"].lower(): row for _, row in latest.iterrows()}

    results = []
    for c in companies:
        row = latest_by_name.get(c["name"].lower())
        if row is None:
            continue
        try:
            result = financial_agent.execute(
                company_name=c["name"],
                historical_data={"historical_trend": [row.to_dict()]},
                proj_inf=override_inflation,
                proj_repo=override_repo,
                proj_brent=override_oil,
            )
        except Exception:
            continue
        results.append({
            "Company": c["name"],
            "weight": c["weight"],
            "forecasts": result["forecasts"],
        })

    return {
        "scenario": {
            "inflation": override_inflation,
            "repo_rate": override_repo,
            "brent_oil": override_oil,
        },
        "results": results,
    }
