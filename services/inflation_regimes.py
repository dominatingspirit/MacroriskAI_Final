# services/inflation_regimes.py
from pathlib import Path
import pandas as pd

MACRO_CSV = Path(__file__).resolve().parent.parent / "master_macro_dataset.csv"

# NOTE: I don't have direct access to your actual master_macro_dataset.csv
# headers, so this tries common candidate column names in order. Run
# `pd.read_csv(MACRO_CSV).columns` once and hardcode the right name below if
# none of these match your file.
# Real column names from master_macro_dataset.csv come first — fallbacks kept for safety
_CPI_CANDIDATES = ["CPI_Inflation_Rate", "CPI_Inflation", "Inflation", "CPI_YoY", "Inflation_Rate", "CPI"]
_YEAR_CANDIDATES = ["Date", "Year", "Month"]


def _find_column(df: pd.DataFrame, candidates: list[str]) -> str:
    for c in candidates:
        if c in df.columns:
            return c
    raise KeyError(
        f"None of {candidates} found in master_macro_dataset.csv — "
        f"actual columns are {list(df.columns)}. Update _CPI_CANDIDATES / "
        f"_YEAR_CANDIDATES at the top of services/inflation_regimes.py."
    )


def load_annual_cpi() -> pd.Series:
    """Realized (not forecasted) mean CPI inflation per calendar year, indexed by Year (int)."""
    df = pd.read_csv(MACRO_CSV)
    cpi_col = _find_column(df, _CPI_CANDIDATES)
    year_col = _find_column(df, _YEAR_CANDIDATES)

    years = df[year_col]
    if not pd.api.types.is_integer_dtype(years):
        years = pd.to_datetime(df[year_col], errors="coerce").dt.year

    return df.assign(_year=years).groupby("_year")[cpi_col].mean()


def high_inflation_years(top_fraction: float = 0.34) -> list[int]:
    """Years in the top third of realized CPI — the real 'inflation shock'
    windows the ML resilience label is trained against."""
    cpi = load_annual_cpi()
    if cpi.empty:
        return []
    threshold = cpi.quantile(1 - top_fraction)
    return sorted(int(y) for y in cpi[cpi >= threshold].index)