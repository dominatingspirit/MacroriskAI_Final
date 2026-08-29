import pandas as pd
import numpy as np
import os
import joblib
from pathlib import Path
from statsmodels.tsa.api import VAR

def train_var_model():
    """Trains Vector Autoregression (VAR) model for Agent 1 multivariate macro analysis."""
    database_path = Path(__file__).resolve().parent.parent / "master_macro_dataset.csv"
    if not os.path.exists(database_path):
        raise FileNotFoundError(f"Master dataset not found at {database_path}.")

    df = pd.read_csv(database_path)

    df['Date'] = pd.to_datetime(
        df['Date'],
        format="%d/%m/%Y"
    )

    df = df.set_index("Date")
    df = df.asfreq("MS")

    # Select key endogenous variables for multivariate feedback loops
    vars_to_use = ['CPI_Inflation_Rate', 'WPI', 'Repo_Rate', 'oil_price', 'exchange_rate']
    model_df = df[vars_to_use].dropna()

    train_size = int(len(model_df) * 0.80)
    train = model_df.iloc[:train_size]
    test = model_df.iloc[train_size:]

    model = VAR(train)
    results = model.fit(maxlags=2, ic="aic")

    forecast = results.forecast(
        y=train.values[-results.k_ar:],
        steps=len(test)
    )

    forecast_df = pd.DataFrame(
        forecast,
        index=test.index,
        columns=test.columns
    )

    actual = test["CPI_Inflation_Rate"]
    predicted = forecast_df["CPI_Inflation_Rate"]

    
    print(results.summary())
    print(f"Optimal Lag Order Selected: {results.k_ar}")

    from sklearn.metrics import (
        mean_squared_error,
        mean_absolute_error,
        r2_score
    )


    mse = mean_squared_error(actual, predicted)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(actual, predicted)
    r2 = r2_score(actual, predicted)

    print("\n===== VAR Forecast Performance =====")
    print(f"MSE : {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE : {mae:.4f}")
    print(f"R²  : {r2:.4f}")
  # --- ADDED CODE TO SAVE THE MODEL ---
    os.makedirs("models", exist_ok=True) 
    model_path = "models/var_inflation_model.pkl"
    joblib.dump(results, model_path)
    print(f"\n✅ VAR Model successfully saved to: {model_path}")
    # ------------------------------------

    return results

if __name__ == "__main__":
    train_var_model()


