import pandas as pd
import numpy as np
from pathlib import Path

# Project-relative default, resolved from this file's location (Agent_1/-> repo root)
_DEFAULT_CSV_PATH = Path(__file__).resolve().parent.parent / "master_macro_dataset.csv"

class MacroApiService:
    """
    A mock API service that fetches the most recent data row from the
    historical CSV to seed the Agent 1 macro forecaster.
    """

    @staticmethod
    def fetch_current_payload(csv_path=_DEFAULT_CSV_PATH):
        """
        Reads the CSV, engineers the same lag/rolling features used in training,
        and returns the final row as a dictionary payload.
        """
        try:
            df = pd.read_csv(csv_path)
            
            # Format and sort date
            df['Date'] = pd.to_datetime(df['Date'], format="%d/%m/%Y")
            df = df.sort_values('Date').reset_index(drop=True)
            
            # Engineer features exactly as done in training
            for lag in [1, 2, 3]:
                df[f'CPI_lag_{lag}'] = df['CPI_Inflation_Rate'].shift(lag)
                df[f'Oil_lag_{lag}'] = df['oil_price'].shift(lag)
                
            # Add the missing WPI lag
            df['WPI_lag_1'] = df['WPI'].shift(1)
                
            df["CPI_roll3"] = df["CPI_Inflation_Rate"].rolling(window=3).mean().shift(1)
            
            # We only need the last row with valid data to begin the forecast
            # Using tail(1) after dropna ensures we get the most recent fully-populated row
            latest_rows = df.dropna().tail(2)
            previous_row = latest_rows.iloc[0]
            latest_row = latest_rows.iloc[1]
            
            # Format the output to match what the MacroAgent expects
            payload = {
                    "macroeconomic_data": [
                    {
                        "date": previous_row['Date'].strftime('%Y-%m-%d'),

                        "cpi_lag_1": float(previous_row['CPI_lag_1']),
                        "cpi_lag_2": float(previous_row['CPI_lag_2']),
                        "cpi_lag_3": float(previous_row['CPI_lag_3']),
                        "oil_lag_1": float(previous_row['Oil_lag_1']),
                        "oil_lag_2": float(previous_row['Oil_lag_2']),
                        "oil_lag_3": float(previous_row['Oil_lag_3']),
                        "wpi_lag_1": float(previous_row['WPI_lag_1']),
                        "cpi_roll3": float(previous_row['CPI_roll3']),

                        "wpi": float(previous_row['WPI']),
                        "repo_rate": float(previous_row['Repo_Rate']),
                        "oil_price": float(previous_row['oil_price']),
                        "exchange_rate": float(previous_row['exchange_rate'])
                    },

                    {
                        "date": latest_row['Date'].strftime('%Y-%m-%d'),

                        "cpi_lag_1": float(latest_row['CPI_lag_1']),
                        "cpi_lag_2": float(latest_row['CPI_lag_2']),
                        "cpi_lag_3": float(latest_row['CPI_lag_3']),
                        "oil_lag_1": float(latest_row['Oil_lag_1']),
                        "oil_lag_2": float(latest_row['Oil_lag_2']),
                        "oil_lag_3": float(latest_row['Oil_lag_3']),
                        "wpi_lag_1": float(latest_row['WPI_lag_1']),
                        "cpi_roll3": float(latest_row['CPI_roll3']),

                        "wpi": float(latest_row['WPI']),
                        "repo_rate": float(latest_row['Repo_Rate']),
                        "oil_price": float(latest_row['oil_price']),
                        "exchange_rate": float(latest_row['exchange_rate'])
                    }
                ]
             }
            
            return payload
            
        except Exception as e:
            print(f"❌ Error fetching from CSV: {e}")
            # Return safe fallback dictionary if file fails
            return {
                "macroeconomic_data": [
                    {
                        "date": "2024-05-01",
                        "cpi_lag_1": 4.8, "cpi_lag_2": 4.5, "cpi_lag_3": 4.4, "cpi_roll3": 4.56,
                        "oil_lag_1": 82.0, "oil_lag_2": 80.0, "oil_lag_3": 79.0, "wpi_lag_1": 3.0,
                        "wpi": 3.2, "repo_rate": 6.5, "oil_price": 85.0, "exchange_rate": 83.5
                    }
                ]
            }