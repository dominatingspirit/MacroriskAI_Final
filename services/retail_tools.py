# services/retail_tools.py
from pathlib import Path
import pandas as pd

from Agent_1.inflation_outlook_agent import MacroAgent

MACRO_CSV = Path(__file__).resolve().parent.parent / "master_macro_dataset.csv"


def _current_repo_rate() -> float:
    df = pd.read_csv(MACRO_CSV)
    return float(df["Repo_Rate"].iloc[-1])


def emi_amount(principal: float, annual_rate_pct: float, tenure_years: int) -> float:
    """Standard reducing-balance EMI formula."""
    r = annual_rate_pct / 12 / 100
    n = tenure_years * 12
    if r == 0:
        return principal / n
    return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)


def compute_emi_shock(
    macro_agent: MacroAgent,
    principal: float,
    rate: float,
    tenure_years: int,
    months_ahead: int = 3,
) -> dict:
    """Baseline EMI at the user's current loan rate vs. projected EMI if the
    loan rate moves 1:1 with Agent 1's projected repo-rate delta (floating-rate
    loans reprice with the repo rate, not with inflation directly)."""
    current_repo = _current_repo_rate()
    macro = macro_agent.execute(input_payload=None, months_ahead=months_ahead)
    projected_repo = macro["trajectory"][-1]["projected_repo"]
    repo_delta = projected_repo - current_repo

    baseline_emi = emi_amount(principal, rate, tenure_years)
    projected_rate = max(rate + repo_delta, 0.1)
    projected_emi = emi_amount(principal, projected_rate, tenure_years)

    return {
        "baseline_emi": round(baseline_emi, 2),
        "projected_emi": round(projected_emi, 2),
        "monthly_delta": round(projected_emi - baseline_emi, 2),
        "annual_delta": round((projected_emi - baseline_emi) * 12, 2),
        "current_repo_rate": current_repo,
        "projected_repo_rate": projected_repo,
        "repo_rate_delta_bps": round(repo_delta * 100, 0),
        "months_ahead": months_ahead,
    }


def compute_salary_target(
    macro_agent: MacroAgent,
    current_salary: float,
    sector: str | None = None,
    months_ahead: int = 6,
) -> dict:
    """Real-wage target: what your salary needs to be `months_ahead` out to
    keep the same purchasing power, given Agent 1's CPI forecast."""
    macro = macro_agent.execute(input_payload=None, months_ahead=months_ahead)
    projected_annual_inflation = macro["inflation_forecast"]["final_inflation"]
    # Agent 1's forecast is annualized; pro-rate it to the requested horizon.
    period_inflation = projected_annual_inflation * (months_ahead / 12)

    target_salary = current_salary * (1 + period_inflation / 100)
    shortfall = target_salary - current_salary

    return {
        "current_salary": current_salary,
        "target_salary": round(target_salary, 2),
        "required_raise_pct": round(period_inflation, 2),
        "monthly_erosion": round(shortfall / months_ahead, 2) if months_ahead else 0,
        "sector": sector,
        "months_ahead": months_ahead,
        "negotiation_script": (
            f"Over the next {months_ahead} months, CPI inflation is forecast at "
            f"{period_inflation:.1f}%. To hold my real (inflation-adjusted) income "
            f"steady, a {period_inflation:.1f}% adjustment — from "
            f"\u20b9{current_salary:,.0f} to \u20b9{target_salary:,.0f} — keeps my purchasing "
            f"power flat rather than being a raise in real terms."
        ),
    }
