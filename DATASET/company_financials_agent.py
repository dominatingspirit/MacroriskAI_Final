import pandas as pd
from pathlib import Path

class CompanyDataAgent:
    def __init__(self):
        # We will point this agent to read the exact same dataset used by Agent 3
        # so everything stays perfectly synced.
        self.base_dir = Path(__file__).resolve().parent.parent / "Agent_3"
        self.data_path = self.base_dir / "final_panel_dataset_repo_brent.xlsx"
        self._df_cache = None

    def get_data(self) -> pd.DataFrame:
        """Loads and caches the dataset for fast retrieval."""
        if self._df_cache is not None:
            return self._df_cache

        if not self.data_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")

        self._df_cache = pd.read_excel(self.data_path)
        return self._df_cache

    def execute(self, company_name: str) -> dict:
        """Fetches the latest historical financial data for a specific company."""
        df = self.get_data()
        
        # Filter for the specific company and sort chronologically
        company_data = df[df["Company"] == company_name].sort_values("Year")
        
        if company_data.empty:
            raise ValueError(f"Company '{company_name}' not found in the dataset.")
            
        # Extract the most recent year's actuals
        latest_data = company_data.iloc[-1].to_dict()
        
        # Clean up the dictionary (remove NaN values to avoid JSON serialization errors)
        cleaned_data = {}
        for key, value in latest_data.items():
            if pd.notna(value):
                # Ensure numpy types are converted to standard python types for API sending
                if isinstance(value, (pd.Timestamp, pd.Timedelta)):
                    cleaned_data[key] = str(value)
                else:
                    cleaned_data[key] = value

        return {
            "company": company_name,
            "latest_year_available": int(latest_data.get("Year", 0)),
            "historical_financials": cleaned_data
        }

if __name__ == "__main__":
    # Test block to run this agent independently
    import json
    agent = CompanyDataAgent()
    try:
        # Grabbing a sample company just to show it works
        df = agent.get_data()
        sample_company = df["Company"].iloc[0]
        result = agent.execute(company_name=sample_company)
        print(f"✅ Successfully fetched data for {sample_company}:")
        print(json.dumps(result, indent=4, default=str))
    except Exception as e:
        print(f"❌ Failed to run Agent 2: {e}")