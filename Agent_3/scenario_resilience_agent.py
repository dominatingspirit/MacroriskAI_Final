import pandas as pd
import json
import pickle
from pathlib import Path

class FinancialAgent:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent
        self.repo_root = self.base_dir.parent
        self.data_path = self.repo_root / "DATASET" / "final_panel_dataset_repo_brent.xlsx"
        self.models_dir = self.base_dir / "Agent3_weights"
        self._df_cache = None

    def get_data(self) -> pd.DataFrame:
        """Loads dataset purely for populating UI dropdowns."""
        if self._df_cache is not None:
            return self._df_cache
        if not self.data_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")
        self._df_cache = pd.read_excel(self.data_path)
        return self._df_cache

    def get_sectors(self) -> list:
        """Returns unique industry sectors."""
        df = self.get_data()
        return sorted(df["Industry_Group"].dropna().unique().tolist())

    def get_companies(self, sector_name: str) -> list:
        """Returns companies filtered by sector."""
        df = self.get_data()
        companies = df[df["Industry_Group"] == sector_name]["Company"].dropna().unique().tolist()
        return sorted(companies)

    def execute(self, company_name: str, historical_data: dict, proj_inf: float, proj_repo: float, proj_brent: float) -> dict:
        """Predicts financials and isolates the macro impact by comparing to a baseline."""
        
        # 1. Grab the latest historical row (T) from Agent 2's output
        trend = historical_data.get("historical_trend", [])
        if not trend:
            raise ValueError(f"No historical data found for {company_name}")
        
        latest_row = trend[-1]
        industry = latest_row.get("Industry_Group", "Unknown")

        # 2. Extract Baseline (If the economy stayed exactly the same as last year)
        base_inf = latest_row.get("Inflation", 0.0)
        base_repo = latest_row.get("Repo_Rate", 0.0)
        base_brent = latest_row.get("Brent_Oil", 0.0)
        
        # 3. Establish Lags for the Prediction Year (T+1)
        # T+1's Lag 1 is T's current inflation. T+1's Lag 2 is T's Lag 1.
        inf_l1 = base_inf
        inf_l2 = latest_row.get("Inflation_L1", 0.0)

        # Helper to dynamically build feature row exactly as the model expects it
        def build_features(inf, repo, brent, features_list):
            feat_dict = {}
            for f in features_list:
                if f == "const":
                    feat_dict[f] = 1.0
                elif f == "Inflation":
                    feat_dict[f] = inf
                elif f == "Repo_Rate":
                    feat_dict[f] = repo
                elif f == "Brent_Oil":
                    feat_dict[f] = brent
                elif f == "Inflation_L1":
                    feat_dict[f] = inf_l1
                elif f == "Inflation_L2":
                    feat_dict[f] = inf_l2
                elif f.startswith("Industry_") and "Inflation_x_" not in f:
                    # Set the specific industry dummy to 1, rest to 0
                    feat_dict[f] = 1.0 if f == f"Industry_{industry}" else 0.0
                elif f.startswith("Inflation_x_Industry_"):
                    # Interaction terms: Inflation * Industry
                    ind_name = f.replace("Inflation_x_Industry_", "")
                    feat_dict[f] = inf if ind_name == industry else 0.0
                else:
                    feat_dict[f] = 0.0
            
            return pd.Series(feat_dict)

        forecasts = {}
        impacts = {}

        if not self.models_dir.exists():
             raise FileNotFoundError(f"Models directory not found at {self.models_dir}")

        for json_file in self.models_dir.glob("*_model.json"):
            with open(json_file, 'r') as f:
                config = json.load(f)
            
            dep_var = config["dependent_variable"]
            features = config["features"]
            coeff_file = self.models_dir / f"{dep_var}_coefficients.pkl"
            
            if not coeff_file.exists():
                continue
                
            with open(coeff_file, 'rb') as f:
                params = pickle.load(f)
            
            # Predict Future scenario (Agent 1's projection)
            X_forecast = build_features(proj_inf, proj_repo, proj_brent, features)
            # Ensure same order as the trained model
            X_forecast = X_forecast.reindex(params.index, fill_value=0.0)
            pred_forecast = X_forecast.dot(params)
            
            # Predict Baseline scenario (Economy stays stagnant)
            X_baseline = build_features(base_inf, base_repo, base_brent, features)
            # Ensure same order as the trained model
            X_forecast = X_forecast.reindex(params.index, fill_value=0.0)
            pred_baseline = X_baseline.dot(params)
            
            forecasts[dep_var] = round(float(pred_forecast), 4)
            # The isolated impact is the difference between the two scenarios
            impacts[dep_var] = round(float(pred_forecast - pred_baseline), 4)

        return {
            "forecasts": forecasts,
            "impact_vs_baseline": impacts
        }