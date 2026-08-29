# services/ml_resilience_model.py
from __future__ import annotations
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import GroupKFold, cross_val_score
from sklearn.preprocessing import StandardScaler

from services.feature_engineering import RAW_METRICS, build_feature_panel
from services.inflation_regimes import high_inflation_years

MIN_TRAINING_SAMPLES = 50
MIN_HIGH_INFLATION_YEARS = 2
ML_BLEND_WEIGHT = 0.5  # final = ML_BLEND_WEIGHT * ml_score + (1 - that) * statistical_score


def _sector_z_cols(metrics=RAW_METRICS) -> list[str]:
    return [f"{m}__sector_z" for m in metrics]


def _volatility_cols(metrics=RAW_METRICS) -> list[str]:
    return [f"{m}__volatility" for m in metrics]


def _pca_weights(features: pd.DataFrame, metrics=RAW_METRICS) -> dict[str, float]:
    """Data-driven weights: first principal component of the sector-relative
    z-scores, sign-corrected so a positive weight always means 'more
    resilient' (anchored against Net Profit Growth, which is unambiguously
    good). Falls back to equal weights only if there's too little data to
    fit a PCA at all."""
    cols = _sector_z_cols(metrics)
    X = features[cols].fillna(0.0).values
    if len(X) < len(cols) + 1:
        return {m: 1.0 / len(metrics) for m in metrics}

    pca = PCA(n_components=1)
    pca.fit(X)
    loadings = pca.components_[0]
    anchor_idx = metrics.index("Net Profit Growth")
    if loadings[anchor_idx] < 0:
        loadings = -loadings
    weights = loadings / np.abs(loadings).sum()
    return dict(zip(metrics, weights))


def _statistical_score(features: pd.DataFrame, weights: dict[str, float], metrics=RAW_METRICS) -> pd.Series:
    composite = sum(features[f"{m}__sector_z"] * weights[m] for m in metrics)
    lo, hi = composite.min(), composite.max()
    if hi <= lo:
        return pd.Series(50.0, index=features.index)
    return 100 * (composite - lo) / (hi - lo)


def _build_labels(features: pd.DataFrame, shock_years: list[int], metrics=RAW_METRICS) -> pd.Series:
    """Label = 1 if, in a historical high-inflation year, this company's
    sector-relative composite growth beat its sector's median that year —
    i.e. it actually outperformed peers during real inflation pressure.
    This is the ground truth the classifier is trained against, not a guess."""
    cols = _sector_z_cols(metrics)
    composite = features[cols].mean(axis=1)
    is_shock_year = features["Year"].isin(shock_years)

    label = pd.Series(np.nan, index=features.index)
    shock_composite = composite.loc[is_shock_year]
    shock_sector = features.loc[is_shock_year, "Industry_Group"]
    sector_median = shock_composite.groupby(shock_sector).transform("median")
    label.loc[is_shock_year] = (shock_composite > sector_median).astype(int)
    return label


class ResilienceModel:
    """Combines a PCA-derived statistical composite (always available) with a
    GradientBoosting classifier trained on how companies actually performed
    during India's real historical high-inflation years. The ML layer only
    activates once there's enough labeled history to trust it — otherwise
    the score is 100% statistical and diagnostics() says exactly why."""

    def __init__(self):
        self.weights: dict[str, float] | None = None
        self.classifier: GradientBoostingClassifier | None = None
        self.scaler: StandardScaler | None = None
        self.diagnostics: dict = {}

    def fit(self, panel: pd.DataFrame) -> "ResilienceModel":
        features = build_feature_panel(panel)
        self.weights = _pca_weights(features)
        shock_years = high_inflation_years()

        feature_cols = _sector_z_cols() + _volatility_cols()
        labels = _build_labels(features, shock_years)
        labeled = features.assign(_label=labels).dropna(subset=["_label"])

        n_samples = len(labeled)
        n_shock_years = len({y for y in shock_years if y in set(features["Year"])})

        if n_samples < MIN_TRAINING_SAMPLES or n_shock_years < MIN_HIGH_INFLATION_YEARS:
            self.classifier = None
            self.diagnostics = {
                "methodology": "statistical_only",
                "reason": (
                    f"Only {n_samples} labeled samples across {n_shock_years} historical "
                    f"high-inflation year(s) — need >={MIN_TRAINING_SAMPLES} samples across "
                    f">={MIN_HIGH_INFLATION_YEARS} distinct years before the ML layer is "
                    f"trustworthy. Using the sector-relative statistical score only."
                ),
                "pca_weights": {k: round(v, 3) for k, v in self.weights.items()},
            }
            return self

        X = labeled[feature_cols].fillna(0.0).values
        y = labeled["_label"].values
        groups = labeled["Year"].values  # GroupKFold: never train/test on the same year

        self.scaler = StandardScaler().fit(X)
        Xs = self.scaler.transform(X)
        self.classifier = GradientBoostingClassifier(
            n_estimators=150, max_depth=2, learning_rate=0.05, random_state=42,
        )

        n_groups = len(set(groups))
        cv_auc = None
        if n_groups >= 3:
            cv = GroupKFold(n_splits=min(n_groups, 5))
            scores = cross_val_score(self.classifier, Xs, y, cv=cv, groups=groups, scoring="roc_auc")
            cv_auc = round(float(np.mean(scores)), 3)

        self.classifier.fit(Xs, y)
        self.diagnostics = {
            "methodology": "blended (statistical + ML)",
            "training_samples": int(n_samples),
            "high_inflation_years_used": sorted({int(y) for y in shock_years}),
            "cross_val_auc": cv_auc,
            "ml_blend_weight": ML_BLEND_WEIGHT,
            "pca_weights": {k: round(v, 3) for k, v in self.weights.items()},
        }
        return self

    def score(self, historical_panel: pd.DataFrame, forecast_records: list[dict]) -> list[dict]:
        """Scores the current forecasted snapshot (one row per company, from
        Agent 3's forecast at the requested horizon) using the weights and
        classifier fit on historical data."""
        forecast_df = pd.DataFrame(forecast_records)
        forecast_year = int(historical_panel["Year"].max()) + 1
        forecast_df["Year"] = forecast_year
        combined = pd.concat([historical_panel, forecast_df], ignore_index=True, sort=False)
        features = build_feature_panel(combined)

        # FIX: filter on Year == forecast_year too, not just Company — the old
        # version matched every historical row for these companies as well,
        # so the "leaderboard" was actually returning hundreds of rows.
        current = features[
            (features["Year"] == forecast_year) & (features["Company"].isin(forecast_df["Company"]))
        ].copy()

        current["statistical_score"] = _statistical_score(current, self.weights).round(1)

        if self.classifier is not None:
            feature_cols = _sector_z_cols() + _volatility_cols()
            X = current[feature_cols].fillna(0.0).values
            Xs = self.scaler.transform(X)
            current["ml_score"] = (self.classifier.predict_proba(Xs)[:, 1] * 100).round(1)
            current["resilience_score"] = (
                ML_BLEND_WEIGHT * current["ml_score"] + (1 - ML_BLEND_WEIGHT) * current["statistical_score"]
            ).round(1)
        else:
            current["ml_score"] = None
            current["resilience_score"] = current["statistical_score"]

        current = current.sort_values("resilience_score", ascending=False)
        current["rank"] = range(1, len(current) + 1)

        result_cols = [
            "Company", "Industry_Group", *RAW_METRICS,
            "resilience_score", "ml_score", "statistical_score", "rank",
        ]
        return current[result_cols].to_dict(orient="records")