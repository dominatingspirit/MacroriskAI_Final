import pandas as pd
from pathlib import Path
import math

class CompanyDataAgent:
    def __init__(self):
        # 1. Project-relative paths, resolved from this file's location (Agent_2/ -> repo root)
        self.base_dir = Path(__file__).resolve().parent.parent
        self.metrics_path = self.base_dir / "DATASET" / "final_panel_dataset_repo_brent.xlsx"
        self.statements_path = self.base_dir / "DATASET" / "Hackathon_7_Metrics_Growth.csv"

        self._df_cache = None
        self._statements_cache = None

    def get_data(self) -> pd.DataFrame:
        if self._df_cache is not None:
            return self._df_cache

        if not self.metrics_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.metrics_path}")

        self._df_cache = pd.read_excel(self.metrics_path)
        return self._df_cache

    def execute(self, company_name: str) -> dict:
        """Fetches historical financial data and granular financial statements."""
        df = self.get_data()
        
        # 2. Case-Insensitive matching for the main metrics dataset
        company_data = df[df["Company"].str.lower() == company_name.lower()]
        
        if "Year" in company_data.columns:
            company_data = company_data.sort_values("Year")
            
        if company_data.empty:
            raise ValueError(f"Company '{company_name}' not found in the main dataset.")
            
        historical_records = company_data.to_dict(orient="records")
        
        # Clean up the dictionaries (remove NaN values to avoid JSON serialization errors)
        cleaned_history = []
        for record in historical_records:
            cleaned_record = {}
            for key, value in record.items():
                if pd.notna(value):
                    if isinstance(value, (pd.Timestamp, pd.Timedelta)):
                        cleaned_record[key] = str(value)
                    else:
                        cleaned_record[key] = value
            cleaned_history.append(cleaned_record)

        # 3. Load the granular financial statements CSV
        if self._statements_cache is None:
            if self.statements_path.exists():
                self._statements_cache = pd.read_csv(self.statements_path)
                
                # FIX 1: Strip hidden spaces from all column names
                self._statements_cache.columns = self._statements_cache.columns.str.strip()
                print(f"✅ Successfully loaded {self.statements_path.name}")
                print(f"📊 Available columns: {list(self._statements_cache.columns)}")
            else:
                print(f"❌ Could not find {self.statements_path}")
                self._statements_cache = pd.DataFrame()
        
        financial_statements = []
        
        # 4. Filter statements dynamically
        if not self._statements_cache.empty:
            # FIX 2: Flexibly find the company column, even if it's named 'Ticker' or 'Company Name'
            company_col = next((col for col in self._statements_cache.columns if col.lower() in ['company', 'company name', 'ticker', 'symbol']), None)
            
            if company_col:
                # Strip spaces from the values themselves to guarantee a match
                comp_stmts = self._statements_cache[self._statements_cache[company_col].astype(str).str.lower().str.strip() == company_name.lower().strip()]
                
                if "Year" in comp_stmts.columns:
                    comp_stmts = comp_stmts.sort_values(by="Year", ascending=False)
                elif "year" in comp_stmts.columns:
                    comp_stmts = comp_stmts.sort_values(by="year", ascending=False)
                    
                # Replace NaNs with None so it converts to valid JSON flawlessly
                comp_stmts = comp_stmts.replace({float('nan'): None})
                financial_statements = comp_stmts.to_dict(orient="records")

        # 5. Return the payload for the RAG and Orchestrator
        return {
            "company": company_name,
            "industry": cleaned_history[-1].get("Industry_Group", "Unknown"),
            "latest_year_available": int(cleaned_history[-1].get("Year", 0)),
            "historical_trend": cleaned_history,
            "financial_statements": financial_statements, 
            "full_financials": financial_statements # Alias to ensure the RAG prompt finds it
        }

if __name__ == "__main__":
    # Quick local test to verify it works
    import json
    agent = CompanyDataAgent()
    result = agent.execute("bpcl") # Testing with lowercase to prove case-insensitivity works
    print(json.dumps(result, indent=4, default=str))