import pandas as pd
from pathlib import Path
from linearmodels.panel import RandomEffects
from linearmodels.panel import PanelOLS
from statsmodels.api import add_constant

# ==========================================================
# Load Dataset
# ==========================================================

file_path = Path(__file__).resolve().parent.parent / "DATASET" / "final_panel_dataset_repo_brent.xlsx"

df = pd.read_excel(file_path)

# ==========================================================
# Set Panel Index
# ==========================================================

df = df.set_index(["Company", "Year"])

# ==========================================================
# Lagged Inflation
# ==========================================================

df["Inflation_L1"] = (
    df.groupby(level="Company")["Inflation"]
      .shift(1)
)

df["Inflation_L2"] = (
    df.groupby(level="Company")["Inflation"].shift(2)
)

# ==========================================================
# Create Industry Dummies
# ==========================================================

industry_dummies = pd.get_dummies(
    df["Industry_Group"],
    prefix="Industry",
    dtype=int
)

# Manufacturing = Reference Category
industry_dummies = industry_dummies.drop(
    columns=["Industry_Manufacturing"]
)

df = pd.concat([df, industry_dummies], axis=1)

# ==========================================================
# Inflation × Industry Interaction Terms
# ==========================================================

interaction_columns = []

for col in industry_dummies.columns:
    interaction_name = f"Inflation_x_{col}"
    df[interaction_name] = df["Inflation"] * df[col]
    interaction_columns.append(interaction_name)


# ==========================================================
# Independent Variables
# ==========================================================

independent_variables_no_lag = [
    "Inflation", 
    "Repo_Rate",
    "Brent_Oil"
] + interaction_columns

independent_variables_1_lag = [
    "Inflation", "Inflation_L1", 
    "Repo_Rate",
    "Brent_Oil"
] + interaction_columns

independent_variables_2_lag = [
    "Inflation", "Inflation_L1", "Inflation_L2",
    "Repo_Rate",
    "Brent_Oil"
] + interaction_columns


MODEL_CONFIG = {

    "Borrowings Growth": {
        "type": "RE",
        "x": independent_variables_no_lag
    },

    "Total Assets Growth": {
        "type": "RE",
        "x": independent_variables_1_lag
    },

    "Equity Growth": {
        "type": "RE",
        "x": independent_variables_2_lag
    },

    "Operating Cash Flow Growth": {
        "type": "FE",
        "x": independent_variables_no_lag
    },

    "Operating Profit Growth": {
        "type": "RE",
        "x": independent_variables_2_lag
    },

    "Net Profit Growth": {
        "type": "RE",
        "x": independent_variables_no_lag
    }

}



import json
import pickle

output_dir = Path(__file__).resolve().parent / "Agent3_weights"
output_dir.mkdir(exist_ok=True)

all_results = {}

for dep_var, config in MODEL_CONFIG.items():

    print("=" * 90)
    print(dep_var)
    print("=" * 90)

    cols = [dep_var] + config["x"]

    temp = df[cols].dropna()

    y = temp[dep_var]
    X = temp[config["x"]]

    if config["type"] == "FE":

        model = PanelOLS(
            y,
            X,
            entity_effects=True
        )

    else:

        # Add intercept
        X = add_constant(X, has_constant="add")


        model = RandomEffects(
            y,
            X
        )

    results = model.fit(
        cov_type="clustered",
        cluster_entity=True
    )

    print(results.summary)

    # -------------------------
    # Save coefficients
    # -------------------------

    coeff_path = output_dir / f"{dep_var}_coefficients.pkl"

    with open(coeff_path, "wb") as f:
        pickle.dump(results.params, f)

    # -------------------------
    # Save model info
    # -------------------------

    model_json = {

        "model_type": config["type"],

        "dependent_variable": dep_var,

        "features": list(results.params.index),

        "coefficients": results.params.to_dict(),

        "pvalues": results.pvalues.to_dict(),

        "std_errors": results.std_errors.to_dict(),

        "confidence_intervals":
            results.conf_int().to_dict(),

        "r_squared": float(results.rsquared),

        "nobs": int(results.nobs)

    }

    json_path = output_dir / f"{dep_var}_model.json"

    with open(json_path, "w") as f:
        json.dump(model_json, f, indent=4)

    all_results[dep_var] = results


