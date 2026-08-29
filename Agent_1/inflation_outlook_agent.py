import sys
import os
from pathlib import Path

# Dynamically add the root project directory to Python's path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Import the new live data service
from Agent_1.macro_api_service import MacroApiService

class MacroAgent:
    def __init__(self):
        # Project-relative paths, resolved from this file's location
        self.base_dir = Path(__file__).resolve().parent.parent
        self.models_dir = self.base_dir / "models"

        self.xgb_model = self._load_model("xgboost_inflation_model.pkl")
        self.lgb_model = self._load_model("lightgbm_inflation_model.pkl")
        self.arimax_model = self._load_model("arimax_inflation_model.pkl")
        self.var_model = self._load_model("var_inflation_model.pkl")
        
       
        self.weights = {
           "ARIMAX": 0.426,
           "XGBoost": 0.219,
           "VAR": 0.191,
           "LightGBM": 0.164
       }


       # Load historical dataset once to derive realistic bounds
        hist_df = pd.read_csv(self.base_dir / "master_macro_dataset.csv")

        self.WPI_MIN = hist_df["WPI"].min()
        self.WPI_MAX = hist_df["WPI"].max()

        self.REPO_MIN = hist_df["Repo_Rate"].min()
        self.REPO_MAX = hist_df["Repo_Rate"].max()

        self.OIL_MIN = hist_df["oil_price"].min()
        self.OIL_MAX = hist_df["oil_price"].max()

        self.EXCHANGE_MIN = hist_df["exchange_rate"].min()
        self.EXCHANGE_MAX = hist_df["exchange_rate"].max()

        # Historical statistics
        self.infl_mean = hist_df["CPI_Inflation_Rate"].mean()
        self.infl_std  = hist_df["CPI_Inflation_Rate"].std()
        
        self.oil_mean = hist_df["oil_price"].mean()
        self.oil_std  = hist_df["oil_price"].std()
        
        self.fx_mean = hist_df["exchange_rate"].mean()
        self.fx_std  = hist_df["exchange_rate"].std()

        self.repo_mean = hist_df["Repo_Rate"].mean()
        self.repo_std = hist_df["Repo_Rate"].std()

        self.wpi_mean = hist_df["WPI"].mean()
        self.wpi_std = hist_df["WPI"].std()




    def _load_model(self, filename):
        path = os.path.join(self.models_dir, filename)
        if os.path.exists(path):
            return joblib.load(path)
        print(f"⚠️ Warning: Model {filename} not found in {self.models_dir}")
        return None




    def execute(self, input_payload: dict = None, months_ahead: int = 1) -> dict:
        """
        Executes a multi-step forecasting loop to predict inflation `months_ahead` into the future.
        """
        if not input_payload or "macroeconomic_data" not in input_payload:
            input_payload = MacroApiService.fetch_current_payload()
            
        macro_data = input_payload.get("macroeconomic_data", [])
        if len(macro_data) < 2:
          raise ValueError("VAR(2) requires at least two observations.")

        previous = macro_data[-2]
        latest = macro_data[-1]
        
        var_history = [
            [
                previous["cpi_lag_1"],
                previous["wpi"],
                previous["repo_rate"],
                previous["oil_price"],
                previous["exchange_rate"]
            ],
            [
                latest["cpi_lag_1"],
                latest["wpi"],
                latest["repo_rate"],
                latest["oil_price"],
                latest["exchange_rate"]
            ]
        ]
        
        # 1. Initialize our rolling variables with the latest known data
        # Fallback to current date if 'date' is missing from payload
        date_str = latest.get('date')
        if date_str:
            current_date = pd.to_datetime(date_str)
        else:
            current_date = pd.to_datetime(datetime.now().strftime('%Y-%m-%d'))
        
        current_cpi_lag_1 = latest.get('cpi_lag_1', 4.0)
        current_cpi_lag_2 = latest.get('cpi_lag_2', 4.0)
        current_cpi_lag_3 = latest.get('cpi_lag_3', 4.0)
        current_cpi_roll3 = latest.get('cpi_roll3', 4.0)
        
        current_wpi_lag_1 = latest.get('wpi_lag_1', 3.0)
        
        current_oil_lag_1 = latest.get('oil_lag_1', 75.0)
        current_oil_lag_2 = latest.get('oil_lag_2', 75.0)
        current_oil_lag_3 = latest.get('oil_lag_3', 75.0)

        current_wpi = latest.get('wpi', 0.0)
        current_repo = latest.get('repo_rate', 6.5) # Kept constant (Policy Rate)
        current_oil = latest.get('oil_price', 75.0)
        current_exchange = latest.get('exchange_rate', 83.0)

        # Initialize previous-month macro values
        previous_wpi = current_wpi_lag_1
        previous_repo = current_repo
        previous_oil = current_oil_lag_1

        # If your payload does not contain an exchange-rate lag,
        # use the latest exchange rate as the starting previous value.
        previous_exchange = current_exchange

        forecast_trajectory = []
        final_ensemble_value = 0.0
        final_breakdown = {}
        
        print(f"🔄 Starting {months_ahead}-month autoregressive forecast loop...")



        # 2. The Multi-Step Forecasting Loop
        for step in range(1, months_ahead + 1):
            target_date = current_date + relativedelta(months=step)
            target_month = target_date.month

            # --- STEP A: Forecast the Macro Features ---
            if self.var_model:
                try:
                    var_input = np.array(
                        var_history
                    )
                    var_forecast = self.var_model.forecast(var_input, steps=1)[0]
                    
                    var_cpi_pred = var_forecast[0] 
                    
                    # Economic Boundary Constraints
                    # This stops the VAR model from predicting impossible real-world scenarios
                    
                    # Recursive WPI shrinkage to stabilize recursive forecasts
                    wpi_anchor = 0.95*current_wpi_lag_1 + 0.05*self.wpi_mean
    
                    wpi_lambda = 0.15
    
                    wpi_alpha = np.exp(
                        -wpi_lambda * (step - 1)
                    )
    
                    current_wpi = (
                        wpi_alpha * var_forecast[1]
                        + (1 - wpi_alpha) * wpi_anchor
                    )



                    # REPO RATE POLICY RULE

                    previous_repo = current_repo
                    
                    if var_cpi_pred >= 6.0:
                        current_repo = previous_repo + 0.25
                    elif var_cpi_pred <= 4.0:
                            current_repo = previous_repo - 0.25
                    else:
                            current_repo = previous_repo
                    
                    current_repo = np.clip(
                        current_repo,
                        self.REPO_MIN,
                        self.REPO_MAX
                    )


                    # Recursive oil-price shrinkage to stabilize recursive forecasts.
                    # Parameters (λ=0.10, k=2) tuned via out-of-sample walk-forward backtesting.

                    oil_anchor = (
                        current_oil_lag_1 +
                        current_oil_lag_2 +
                        current_oil_lag_3
                    ) / 3

                    sigma = np.std([
                        current_oil_lag_1,
                        current_oil_lag_2,
                        current_oil_lag_3
                    ])

                    # Tuned parameters
                    lambda_decay = 0.10
                    k = 2

                    alpha = np.exp(-lambda_decay * (step - 1)) / (1 + k * sigma)
                    alpha = np.clip(alpha, 0.3, 1.0)

                    current_oil = (
                        alpha * var_forecast[3]
                        + (1 - alpha) * oil_anchor
                    )

                    current_oil = np.clip(
                        current_oil,
                        self.OIL_MIN,
                        self.OIL_MAX
                    )


                    # Normal exchange rate 
                    
                    current_exchange = np.clip(
                        var_forecast[4],
                        self.EXCHANGE_MIN,
                        self.EXCHANGE_MAX
                    )


                except Exception as e:
                    print (f'VAR forecast failed : {e}')
                    var_cpi_pred = current_cpi_lag_1

            else:
                var_cpi_pred = current_cpi_lag_1 # Fallback

            # --- STEP B: Build the Feature Row for ML Models ---
            features = pd.DataFrame([{
                'WPI': current_wpi,
                'Repo_Rate': current_repo, 
                'oil_price': current_oil,
                'exchange_rate': current_exchange,
                'CPI_lag_1': current_cpi_lag_1,
                'CPI_lag_2': current_cpi_lag_2,
                'CPI_lag_3': current_cpi_lag_3,
                'CPI_roll3': current_cpi_roll3,
                'Oil_lag_1': current_oil_lag_1,
                'Oil_lag_2': current_oil_lag_2,
                'Oil_lag_3': current_oil_lag_3
            }])
            
            # Make sure column order exactly matches XGBoost training order
            expected_order = [
                "WPI", "Repo_Rate", "oil_price", "exchange_rate",
                "CPI_lag_1", "CPI_lag_2", "CPI_lag_3", "CPI_roll3",
                "Oil_lag_1", "Oil_lag_2", "Oil_lag_3"
            ]
            
            features_ml = features[expected_order]

            indiv_preds = {}
            weighted_predictions = []
            weights_used = []

            # --- STEP C: Predict Inflation for this specific future month ---
            if self.xgb_model:
                xgb_val = self.xgb_model.predict(features_ml)[0]
                indiv_preds['XGBoost'] = round(float(xgb_val), 2)
                weighted_predictions.append(xgb_val * self.weights['XGBoost'])
                weights_used.append(self.weights['XGBoost'])

            if self.lgb_model:
                lgb_val = self.lgb_model.predict(features_ml)[0] 
                indiv_preds['LightGBM'] = round(float(lgb_val), 2)
                weighted_predictions.append(lgb_val * self.weights['LightGBM'])
                weights_used.append(self.weights['LightGBM'])

            if self.arimax_model:
                try:
                    # ARIMAX was trained on FIRST-DIFFERENCED variables
                    delta_wpi = current_wpi - previous_wpi
                    delta_repo = current_repo - previous_repo
                    delta_oil = current_oil - previous_oil
                    delta_exchange = current_exchange - previous_exchange
                    
                    arimax_exog = pd.DataFrame([{
                        "WPI": delta_wpi,
                        "Repo_Rate": delta_repo,
                        "oil_price": delta_oil,
                        "exchange_rate": delta_exchange
                    }])
                    # Model predicts ΔCPI
                    predicted_delta = self.arimax_model.forecast(steps=1, exog=arimax_exog).iloc[0]
                    # Convert ΔCPI back to CPI inflation level
                    ari_val = current_cpi_lag_1 + predicted_delta 
                    indiv_preds['ARIMAX'] = round(float(ari_val), 2)
                    weighted_predictions.append(ari_val * self.weights['ARIMAX'])
                    weights_used.append(self.weights['ARIMAX'])
                except Exception as e : 
                    print(f'ARIMAX forecast failed : {e}')

            if self.var_model:
                indiv_preds['VAR'] = round(float(var_cpi_pred), 2)
                weighted_predictions.append(var_cpi_pred * self.weights['VAR'])
                weights_used.append(self.weights['VAR'])

            # Calculate Ensemble Value for this month
            ensemble_val = round(float(sum(weighted_predictions) / sum(weights_used)), 2) if sum(weights_used) > 0 else current_cpi_lag_1
            # Update VAR history for the next recursive forecast
            var_history.pop(0)

            var_history.append([
                ensemble_val,
                current_wpi,
                current_repo,
                current_oil,
                current_exchange
            ])
            # Save trajectory data
            forecast_trajectory.append({
                "date": target_date.strftime('%Y-%m'),
                "inflation_forecast": ensemble_val,
                "projected_wpi": round(float(current_wpi), 2),
                "projected_oil": round(float(current_oil), 2),
                "projected_repo": round(float(current_repo), 2),
                "projected_exchange": round(float(current_exchange), 2)
            })

            # --- STEP D: Shift Lags for the Next Loop Iteration ---
            current_cpi_lag_3 = current_cpi_lag_2
            current_cpi_lag_2 = current_cpi_lag_1
            current_cpi_lag_1 = ensemble_val
            
            # Recalculate rolling 3 manually for the next step 
            # Note: This is a synthetic roll using our predicted values + historicals
            current_cpi_roll3 = np.mean([current_cpi_lag_1, current_cpi_lag_2, current_cpi_lag_3])
            
            current_wpi_lag_1 = current_wpi
            
            current_oil_lag_3 = current_oil_lag_2
            current_oil_lag_2 = current_oil_lag_1
            current_oil_lag_1 = current_oil

            if step == months_ahead:
                final_ensemble_value = ensemble_val
                final_breakdown = indiv_preds




        # --- 3. DYNAMIC FORMULA WITH ZERO-BOUND PROTECTION ---
        
        predictions = np.array(list(final_breakdown.values()))

        if len(predictions) > 1:
            std_dev = np.std(predictions, ddof=1)
        else:
            std_dev = 0.0
        margin95 = 1.96 * std_dev

        forecast_lower_bound = round(final_ensemble_value - margin95, 2)
        forecast_upper_bound  = round(final_ensemble_value + margin95, 2)



        # Z-scores
        infl_z = (final_ensemble_value - self.infl_mean) / self.infl_std
        oil_z = (current_oil - self.oil_mean) / self.oil_std
        fx_z = (current_exchange - self.fx_mean) / self.fx_std
        repo_z = (current_repo - self.repo_mean) / self.repo_std
        wpi_z = (current_wpi - self.wpi_mean) / self.wpi_std

        inflation_score = max(0.0, infl_z)
        oil_score = max(0.0, oil_z)
        fx_score  = max(0.0, fx_z)
        repo_score = max(0.0, repo_z)
        wpi_score = max(0.0, wpi_z)



        # Cause of inflation 
        cp_score = (
            0.6 * oil_score +
            0.4 * fx_score    )
        dp_score = inflation_score
        total_pressure = max(1e-8, cp_score + dp_score)
        cp_relative = round(cp_score / total_pressure * 100, 2)
        dp_relative = round(dp_score / total_pressure * 100, 2)

        cause_pressure = {
            "Demand Pull": dp_relative,
            "Cost Push": cp_relative
        }
        inflation_cause = (
            "Cost Push"
            if cp_score > dp_score
            else "Demand Pull"
        )


        # Regime classification
        normal_score = max(0.0, 1.0 - abs(infl_z))
        cooling_score = max(0.0, -infl_z) + max(0.0, repo_z)
        total_regime = max(1e-8, normal_score + cooling_score)
        normal_relative = round(normal_score/total_regime * 100 , 2)
        cooling_relative = round(cooling_score/total_regime * 100 , 2)

        regime_scores = {
            "Normal Inflation": normal_relative,
            "Cooling / Deflation": cooling_relative
        }
        primary_regime = max(
            regime_scores,
            key=regime_scores.get
        )



        # Policy outlook
        if current_repo >= self.repo_mean + self.repo_std:
            policy_outlook = "Restrictive"
        elif current_repo >= self.repo_mean:
            policy_outlook = "Neutral"
        else:
            policy_outlook = "Accommodative"


        # Commodity Pressure
        score = 0
        if current_wpi > self.wpi_mean + self.wpi_std:
            score += 1
        if current_oil > self.oil_mean + self.oil_std:
            score += 1

        if score == 2:
            commodity_pressure = "High"
        elif score == 1:
            commodity_pressure = "Moderate"
        else:
            commodity_pressure = "Low"



        return {
            "inflation_forecast": {
                "target_horizon_months": months_ahead,
                "final_target_month": forecast_trajectory[-1]['date'] if forecast_trajectory else None,
                "final_inflation": final_ensemble_value,
                "forecast_lower_bound": forecast_lower_bound,
                "forecast_upper_bound": forecast_upper_bound,
                "model_used": "Autoregressive Delta-Stacked Ensemble"
            },
            "trajectory": forecast_trajectory,
            "ensemble_breakdown_final_month": final_breakdown,
            "inflation_cause": {
                "class": inflation_cause,
                "relative_pressure": cause_pressure
            },           
            "inflation_regime": {
                "class": primary_regime,
                "relative_pressure": regime_scores
            },
            "macro_summary": {
                "policy_outlook": policy_outlook,
                "commodity_pressure": commodity_pressure
            }
        }


if __name__ == "__main__":
    import json
    agent = MacroAgent()

    print("==================================================")
    print("TEST 1: LIVE DATA FORECAST (Next 5 Months)")
    print("==================================================")
    try:
        live_result = agent.execute(months_ahead=5)
        print(json.dumps(live_result, indent=4))
    except Exception as e:
        print(f"Live data test failed (is your API service running?): {e}")



    # print("\n==================================================")
    # print("TEST 2: CUSTOM MANUAL PAYLOAD (Next 5 Months)")
    # print("==================================================")
    # mock_payload = {
    #     "macroeconomic_data": [
    #         {
    #             "date": "2024-05-01",
    #             "cpi_lag_1": 4.8,
    #             "cpi_lag_2": 4.5,
    #             "cpi_lag_3": 4.4,
    #             "cpi_roll3": 4.56,
    #             "wpi_lag_1": 3.0,
    #             "oil_lag_1": 82.0,
    #             "oil_lag_2": 80.0,
    #             "oil_lag_3": 79.0,
    #             "wpi": 3.2,
    #             "repo_rate": 6.5,
    #             "oil_price": 85.0,
    #             "exchange_rate": 83.5
    #         }
    #     ]
    # }

    # custom_result = agent.execute(input_payload=mock_payload, months_ahead=5)
    # print(json.dumps(custom_result, indent=4))