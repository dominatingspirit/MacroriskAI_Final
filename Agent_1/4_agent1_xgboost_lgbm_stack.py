import pandas as pd
import numpy as np
import os
import joblib
from pathlib import Path
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

def train_ml_models():
    repo_root = Path(__file__).resolve().parent.parent
    df = pd.read_csv(repo_root / "master_macro_dataset.csv")
    df['Date'] = pd.to_datetime(
        df['Date'],
        format="%d/%m/%Y"
    )

    df = df.set_index("Date")
    df = df.asfreq("MS")
    df['Month'] = df.index.month


    for lag in [1, 2, 3]:
        df[f'CPI_lag_{lag}'] = df['CPI_Inflation_Rate'].shift(lag)
        df[f'Oil_lag_{lag}'] = df['oil_price'].shift(lag)

    df["CPI_roll3"] = df["CPI_Inflation_Rate"].rolling(3).mean().shift(1)

    
    features = ["WPI",
    "Repo_Rate",
    "oil_price",
    "exchange_rate",

    "CPI_lag_1",
    "CPI_lag_2",
    "CPI_lag_3",
    "CPI_roll3",

    "Oil_lag_1",
    "Oil_lag_2",
    "Oil_lag_3"
    ]

    target = 'CPI_Inflation_Rate'

    model_df = df[features + [target]].dropna()
    train_size = int(len(model_df) * 0.80)

    train = model_df.iloc[:train_size]
    test = model_df.iloc[train_size:]

    X_train = train[features]
    y_train = train[target]

    X_test = test[features]
    y_test = test[target]

    ###################################################
    # XGBoost
    ###################################################

    xgb = XGBRegressor(
        n_estimators=500, 
        learning_rate=0.03, 
        max_depth=5, 
        random_state=42
        )

    xgb.fit(X_train, y_train)

    pred_xgb = xgb.predict(X_test)

    print("\n===== XGBoost =====")
    print("MSE :", mean_squared_error(y_test, pred_xgb))
    print("RMSE:", np.sqrt(mean_squared_error(y_test, pred_xgb)))
    print("MAE :", mean_absolute_error(y_test, pred_xgb))
    print("R²  :", r2_score(y_test, pred_xgb))


    ###################################################
    # LightGBM
    ###################################################

    lgbm = LGBMRegressor(
        n_estimators=300,
        learning_rate=0.01,
        max_depth=3,
        num_leaves=15,
        # to prevent overfitting
        min_child_samples=10, feature_fraction=0.8, bagging_freq=1, bagging_fraction=0.8,
        random_state=42, verbose=-1
    )

    lgbm.fit(X_train, y_train)

    pred_lgbm = lgbm.predict(X_test)

    print("\n===== LightGBM =====")
    print("MSE :", mean_squared_error(y_test, pred_lgbm))
    print("RMSE:", np.sqrt(mean_squared_error(y_test, pred_lgbm)))
    print("MAE :", mean_absolute_error(y_test, pred_lgbm))
    print("R²  :", r2_score(y_test, pred_lgbm))

    os.makedirs("models", exist_ok=True) 
    
    # Save the final fitted models
    xgb_model_path = "models/xgboost_inflation_model.pkl"
    lgbm_model_path = "models/lightgbm_inflation_model.pkl"
    
    joblib.dump(xgb, xgb_model_path)
    joblib.dump(lgbm, lgbm_model_path)
    
    print(f"\n✅ Models successfully saved to:")
    print(f"   - {xgb_model_path}")
    print(f"   - {lgbm_model_path}")
    
if __name__ == "__main__":
    train_ml_models()

