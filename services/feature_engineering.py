# services/feature_engineering.py
from __future__ import annotations
import pandas as pd

RAW_METRICS = [
    "Net Profit Growth", "Operating Profit Growth", "Operating Cash Flow Growth",
    "Equity Growth", "Total Assets Growth", "Borrowings Growth",
]


def sector_relative_zscores(
    panel: pd.DataFrame, metrics: list[str] = RAW_METRICS, min_group_size: int = 4
) -> pd.DataFrame:
    """Z-scores each metric within (Year, Industry_Group). If a sector group
    has fewer than `min_group_size` companies that year — too small to trust
    a std dev from — falls back to the full cross-sectional (Year-only)
    z-score for those rows instead of silently zeroing them out. This was the
    bug behind every company landing on the same score: most sector groups
    were too small, std came back NaN, and it got fillna(0.0)'d into 'no
    deviation from average' for everyone."""
    out = panel.copy()
    for m in metrics:
        sector_grp = out.groupby(["Year", "Industry_Group"])[m]
        group_size = sector_grp.transform("size")
        sector_mean = sector_grp.transform("mean")
        sector_std = sector_grp.transform("std")

        year_grp = out.groupby("Year")[m]
        year_mean = year_grp.transform("mean")
        year_std = year_grp.transform("std")

        use_sector = (group_size >= min_group_size) & sector_std.notna() & (sector_std > 1e-9)
        mean = sector_mean.where(use_sector, year_mean)
        std = sector_std.where(use_sector, year_std).replace(0, pd.NA)

        out[f"{m}__sector_z"] = ((out[m] - mean) / std).fillna(0.0)
    return out


def stability_features(panel: pd.DataFrame, metrics: list[str] = RAW_METRICS, window: int = 3) -> pd.DataFrame:
    """Trailing rolling std of each metric per company, over up to `window`
    prior years. Lower = more consistent = more resilient. Companies with
    under 2 years of history get the cross-sectional median instead of NaN,
    so newly-listed companies aren't unfairly zeroed out."""
    out = panel.sort_values(["Company", "Year"]).copy()
    for m in metrics:
        col = f"{m}__volatility"
        out[col] = out.groupby("Company")[m].transform(lambda s: s.rolling(window, min_periods=2).std())
        out[col] = out[col].fillna(out[col].median())
    return out


def build_feature_panel(panel: pd.DataFrame, metrics: list[str] = RAW_METRICS) -> pd.DataFrame:
    panel = sector_relative_zscores(panel, metrics)
    panel = stability_features(panel, metrics)
    return panel