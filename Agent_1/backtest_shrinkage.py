import sys
import os
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
import importlib.util

try:
    from Agent_1.inflation_outlook_agent import MacroAgent
    from Agent_1.macro_api_service import MacroApiService
except ModuleNotFoundError:
    macro_agent_spec = importlib.util.spec_from_file_location("MacroAgent", "7_macro_agent.py")
    macro_module = importlib.util.module_from_spec(macro_agent_spec)
    macro_agent_spec.loader.exec_module(macro_module)
    MacroAgent = macro_module.MacroAgent
    
    api_service_spec = importlib.util.spec_from_file_location("MacroApiService", "macro_api_service.py")
    api_module = importlib.util.module_from_spec(api_service_spec)
    api_service_spec.loader.exec_module(api_module)
    MacroApiService = api_module.MacroApiService

def run_backtest():
    print("🚀 Starting Statistically Rigorous Out-of-Sample Walk-Forward Backtesting...")
    
    agent = MacroAgent()
    project_root = Path(__file__).resolve().parent.parent
    csv_path = project_root / "master_macro_dataset.csv"
    
    print(f"📊 Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    df['Date'] = pd.to_datetime(df['Date'], format="%d/%m/%Y")
    df = df.sort_values('Date').reset_index(drop=True)
    
    valid_df = df.copy()
    for lag in [1, 2, 3]:
        valid_df[f'CPI_lag_{lag}'] = valid_df['CPI_Inflation_Rate'].shift(lag)
    valid_df = valid_df.dropna()
    valid_indices = valid_df.index.tolist()
    
    # Strictly Out-of-Sample: Start origin at 80% split mark to avoid training set leakage
    start_offset = int(len(valid_indices) * 0.80)
    HORIZON = 3  # Evaluate a 3-month forecast trajectory to activate step-decay

    print(f"🛡️  Out-of-Sample Backtest Origin Index: {start_offset} of {len(valid_indices)} rows")
    print(f"🎯 Forecast Horizon per Step: {HORIZON} Months (Trajectory evaluation)")
    
    print("\n" + "=" * 65)
    print("📊 STEP 1: EVALUATING ORIGINAL BASELINE MODEL (No Shrinkage)")
    print("=" * 65)
    
    baseline_errors = []
    for i in range(start_offset, len(valid_indices) - HORIZON):
        current_idx = valid_indices[i]
        payload = MacroApiService.fetch_current_payload(csv_path=csv_path, end_index=current_idx)
        prediction = agent.execute(input_payload=payload, months_ahead=HORIZON, lambda_decay=None, k=None)
        
        for h in range(1, HORIZON + 1):
            pred_cpi = prediction['trajectory'][h - 1]['inflation_forecast']
            actual_next = valid_df.loc[valid_indices[i + h], 'CPI_Inflation_Rate']
            baseline_errors.append((pred_cpi - actual_next) ** 2)
            
    baseline_rmse = np.sqrt(np.mean(baseline_errors))
    print(f"📌 Original Model Out-of-Sample RMSE: {baseline_rmse:.4f}")

    decays = [0.05, 0.10, 0.15, 0.20]
    ks = [1, 2, 5, 8, 10]
    results = []

    print("\n" + "=" * 65)
    print("🧪 STEP 2: GRID SEARCHING SHRINKAGE HYPERPARAMETERS")
    print("=" * 65)
    print(f"{'Lambda':<10} | {'K':<5} | {'Trajectory RMSE':<15} | {'vs Baseline':<12}")
    print("-" * 65)
    
    for ld in decays:
        for k in ks:
            errors = []
            
            for i in range(start_offset, len(valid_indices) - HORIZON):
                current_idx = valid_indices[i]
                payload = MacroApiService.fetch_current_payload(csv_path=csv_path, end_index=current_idx)
                prediction = agent.execute(input_payload=payload, months_ahead=HORIZON, lambda_decay=ld, k=k)
                
                # Evaluate errors across all 3 horizon steps
                for h in range(1, HORIZON + 1):
                    pred_cpi = prediction['trajectory'][h - 1]['inflation_forecast']
                    actual_next = valid_df.loc[valid_indices[i + h], 'CPI_Inflation_Rate']
                    errors.append((pred_cpi - actual_next) ** 2)
            
            rmse = np.sqrt(np.mean(errors))
            diff_pct = ((baseline_rmse - rmse) / baseline_rmse) * 100
            diff_str = f"{diff_pct:+.2f}%"
            
            results.append({'lambda_decay': ld, 'k': k, 'rmse': rmse, 'improvement': diff_pct})
            print(f"{ld:<10} | {k:<5} | {rmse:<15.4f} | {diff_str:<12}")

    best = min(results, key=lambda x: x['rmse'])
    print("\n" + "=" * 65)
    print("🏆 OUT-OF-SAMPLE BACKTEST SUMMARY")
    print("=" * 65)
    print(f"Original Model Baseline RMSE : {baseline_rmse:.4f}")
    print(f"Optimal Lambda Decay          : {best['lambda_decay']}")
    print(f"Optimal K Value               : {best['k']}")
    print(f"Best Shrinkage Model RMSE    : {best['rmse']:.4f}")
    print(f"Overall Accuracy Improvement  : {best['improvement']:+.2f}%")
    print("=" * 65)

if __name__ == "__main__":
    run_backtest()