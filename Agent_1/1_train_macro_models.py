import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.api import VAR

from pathlib import Path

def train_macro_models():
    # 1. Define Paths dynamically relative to project root
    project_root = Path(__file__).resolve().parent.parent
    dataset_path = project_root / "master_macro_dataset.csv"
    models_dir = project_root / "models"
    
    if not dataset_path.exists():
        print(f"❌ Error: Dataset not found at {dataset_path}")
        print("Make sure master_macro_dataset.csv exists in the project root directory.")
        return
        
    os.makedirs(models_dir, exist_ok=True)
    
    print("📊 Loading macro dataset...")
    df = pd.read_csv(dataset_path)
    df['Date'] = pd.to_datetime(df['Date'], format="%d/%m/%Y")
    df = df.set_index("Date").asfreq("MS")
    
    print("⚙️ Engineering lag and rolling features for autoregression...")
    for lag in [1, 2, 3]:
        df[f'CPI_lag_{lag}'] = df['CPI_Inflation_Rate'].shift(lag)
        df[f'Oil_lag_{lag}'] = df['oil_price'].shift(lag)
    df["CPI_roll3"] = df["CPI_Inflation_Rate"].rolling(3).mean().shift(1)
    
    features = [
        "WPI", "Repo_Rate", "oil_price", "exchange_rate",
        "CPI_lag_1", "CPI_lag_2", "CPI_lag_3", "CPI_roll3",
        "Oil_lag_1", "Oil_lag_2", "Oil_lag_3"
    ]
    target = 'CPI_Inflation_Rate'
    
    model_df = df[features + [target]].dropna()
    X = model_df[features]
    y = model_df[target]
    
    print("🚀 Training XGBoost Regressor...")
    xgb = XGBRegressor(n_estimators=500, learning_rate=0.03, max_depth=5, random_state=42)
    xgb.fit(X, y)
    joblib.dump(xgb, models_dir / "xgboost_inflation_model.pkl")
    
    print("🚀 Training LightGBM Regressor...")
    lgbm = LGBMRegressor(
        n_estimators=300, learning_rate=0.01, max_depth=3, num_leaves=15,
        min_child_samples=10, feature_fraction=0.8, bagging_freq=1, bagging_fraction=0.8,
        random_state=42, verbose=-1
    )
    lgbm.fit(X, y)
    joblib.dump(lgbm, models_dir / "lightgbm_inflation_model.pkl")
    
    print("🚀 Training ARIMAX Model...")
    arimax_df = df[["CPI_Inflation_Rate", "WPI", "Repo_Rate", "oil_price", "exchange_rate"]].dropna().diff().dropna()
    y_diff = arimax_df["CPI_Inflation_Rate"]
    X_diff = arimax_df[["WPI", "Repo_Rate", "oil_price", "exchange_rate"]]
    arimax_model = SARIMAX(y_diff, exog=X_diff, order=(2, 0, 1), seasonal_order=(1, 0, 1, 12))
    arimax_fit = arimax_model.fit(maxiter=500, disp=False)
    joblib.dump(arimax_fit, models_dir / "arimax_inflation_model.pkl")
    
    print("🚀 Training VAR Multi-Variate Model...")
    var_vars = ['CPI_Inflation_Rate', 'WPI', 'Repo_Rate', 'oil_price', 'exchange_rate']
    var_df = df[var_vars].dropna()
    var_model = VAR(var_df)
    var_fit = var_model.fit(maxlags=2, ic="aic")
    joblib.dump(var_fit, models_dir / "var_macro_model.pkl")
    joblib.dump(var_fit, models_dir / "var_inflation_model.pkl")
    
    print(f"\n✅ All 4 models trained and saved successfully into '{models_dir}'!")

if __name__ == "__main__":
    train_macro_models()