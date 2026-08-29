from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from typing import Optional
from services.resilience_score import ResilienceScoreEngine
from services.sector_intelligence import SectorIntelligenceEngine
from services.retail_tools import compute_emi_shock, compute_salary_target
from services.portfolio import analyze_portfolio, compare_portfolios, stress_test_portfolio
from services.narrative import explain_resilience, explain_vulnerability, reality_check
import sys
import os
# --- ADD to imports ---
from fastapi import UploadFile, File
from services.portfolio_upload import parse_portfolio_csv, generate_portfolio_insights

# Import the LangGraph Orchestrator
from langgraph_orchestrator import app_graph
from fastapi.middleware.cors import CORSMiddleware

# ... your existing app = FastAPI() initialization ...

# Add this right below it to allow Next.js to talk to Python

# Import our Agents using their NEW names
from Agent_1.inflation_outlook_agent import MacroAgent
from Agent_2.corporate_analysis_agent import CompanyDataAgent
from Agent_3.scenario_resilience_agent import FinancialAgent
from MacroRiskAI_rag import RAGAgent

app = FastAPI(title="MacroRisk AI Platform API")

# Add CORS middleware to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ForecastRequest(BaseModel):
    months_ahead: int = Field(
        default=3,
        ge=1,
        le=6,
        description="Number of months to forecast the macro economy (1-6)"
    )

class CompanyForecastRequest(BaseModel):
    company_name: str = Field(description="Name of the company to analyze")
    months_ahead: int = Field(
        default=3,
        ge=1,
        le=6,
        description="Months ahead to forecast macro environment to apply to the company"
    )

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[Dict[str, str]]] = Field(default=None, description="Past conversation messages")
    context: Optional[dict] = Field(default=None, description="Optional LangGraph state context")

class EMIRequest(BaseModel):
    principal: float = Field(gt=0)
    rate: float = Field(gt=0, le=30, description="Current annual loan interest rate, %")
    tenure_years: int = Field(gt=0, le=30)
    months_ahead: int = Field(default=3, ge=1, le=6)


class SalaryRequest(BaseModel):
    current_salary: float = Field(gt=0)
    sector: Optional[str] = None
    months_ahead: int = Field(default=6, ge=1, le=6)


class PortfolioHolding(BaseModel):
    name: str
    weight: float = Field(gt=0, le=100)


class PortfolioRequest(BaseModel):
    companies: list[PortfolioHolding]
    months_ahead: int = Field(default=3, ge=1, le=6)


class PortfolioCompareRequest(BaseModel):
    portfolio_a: list[PortfolioHolding]
    portfolio_b: list[PortfolioHolding]
    months_ahead: int = Field(default=3, ge=1, le=6)


class StressTestRequest(BaseModel):
    companies: list[PortfolioHolding]
    override_inflation: float = Field(ge=-5, le=25, description="Manual CPI override, %")
    override_repo: float = Field(ge=0, le=20, description="Manual repo rate override, %")
    override_oil: float = Field(ge=0, le=300, description="Manual Brent crude override, $")


# Initialize agents globally to keep their models loaded in memory for fast execution
print("⚙️ Initializing Agents for API routing...")
macro_agent = MacroAgent()
financial_agent = FinancialAgent()
company_agent = CompanyDataAgent()
rag_agent = RAGAgent()
resilience_engine = ResilienceScoreEngine(macro_agent, financial_agent)
sector_engine = SectorIntelligenceEngine(resilience_engine)

@app.get("/")
def read_root():
    return {"message": "MacroRisk AI API is running. Go to /docs for documentation."}

@app.post("/forecast")
def get_forecast(request: ForecastRequest):
    """
    Runs the multi-step autoregressive macro forecast (Agent 1 standalone).
    """
    try:
        result = macro_agent.execute(
            input_payload=None, 
            months_ahead=request.months_ahead
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sectors")
def get_sectors():
    """Returns a unique list of all sectors for frontend dropdowns."""
    try:
        return financial_agent.get_sectors()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies/{sector_name}")
def get_companies(sector_name: str):
    """Returns a list of companies belonging to a specific sector."""
    try:
        return financial_agent.get_companies(sector_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/company_financials/{company_name}")
def get_company_financials(company_name: str):
    """
    Runs Agent 2 standalone: 
    Returns the historical baseline financials and granular statements (Income/Balance/CashFlow).
    """
    try:
        return company_agent.execute(company_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_company")
def analyze_company(request: CompanyForecastRequest):
    """
    Triggers the LangGraph workflow:
    1. Macro Agent (predicts economy)
    2. Company Agent (retrieves historical financials & statements)
    3. Financial Agent (predicts company financials)
    4. Executive Intelligence Agent (writes the report)
    """
    try:
        # Define the initial state for the LangGraph orchestrator
        initial_state = {
            "company_name": request.company_name,
            "months_ahead": request.months_ahead,
            "error": None
        }
        
        # Invoke the graph
        final_state = app_graph.invoke(initial_state)
        
        # Check if any nodes raised an error during pipeline execution
        if final_state.get("error"):
            raise HTTPException(status_code=500, detail=final_state["error"])
        
        # Construct the final API response
        return {
            "company": final_state["company_name"],
            "forecast_horizon_months": final_state["months_ahead"],
            "macro_assumptions_used": {
                "projected_inflation": final_state["proj_inf"],
                "projected_repo_rate": final_state["proj_repo"],
                "projected_brent_oil": final_state["proj_oil"]
            },
            # historical_baseline now includes the full Balance Sheet, Income Statement, etc.
            "historical_baseline": final_state["historical_financials"],
            "financial_forecasts": final_state["financial_forecasts"],
            "macro_impacts": final_state.get("macro_impacts", {}),
            "full_macro_context": final_state["macro_results"],
            "investment_report": final_state.get("investment_report")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_with_rag(request: ChatRequest):
    """
    RAG Endpoint: Answers questions using the Chroma vector database.
    If the user runs the pipeline first, request.context contains all their financial statements,
    allowing the RAG bot to generate Moneycontrol-style tables instantly.
    """
    try:
        answer = rag_agent.execute(
            query=request.query, 
            chat_history=request.chat_history,
            langgraph_context=request.context
        )
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import math
# pyrefly: ignore [missing-import]
from fastapi import HTTPException

# Add this helper function right above your endpoint
def clean_nans(data):
    """Recursively replaces NaN floats with None to prevent JSON crashes."""
    if isinstance(data, list):
        return [clean_nans(item) for item in data]
    elif isinstance(data, dict):
        return {k: clean_nans(v) for k, v in data.items()}
    elif isinstance(data, float) and math.isnan(data):
        return None  # Safely becomes 'null' in JSON
    return data

@app.get("/api/companies/leaderboard")
def get_leaderboard(months_ahead: int = 3):
    """Returns all companies with their 0-100 Inflation Resilience Score, ranked."""
    try:
        # 1. Get the raw data with potential NaNs
        raw_data = resilience_engine.compute(months_ahead=months_ahead)
        
        # 2. Scrub the NaNs out
        safe_data = clean_nans(raw_data)
        
        # 3. Return safely to Next.js
        return safe_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sectors/intelligence")
def get_sector_intelligence(months_ahead: int = 3):
    """Sector-level median/mean resilience scores and growth medians."""
    try:
        return sector_engine.compute(months_ahead=months_ahead)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/retail/emi")
def retail_emi(request: EMIRequest):
    """Floating-rate EMI stress test: baseline vs. repo-rate-projected EMI."""
    try:
        return compute_emi_shock(
            macro_agent, request.principal, request.rate,
            request.tenure_years, request.months_ahead,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/retail/salary")
def retail_salary(request: SalaryRequest):
    """Inflation-adjusted target wage over the forecast horizon."""
    try:
        return compute_salary_target(
            macro_agent, request.current_salary, request.sector, request.months_ahead,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ADD new route, next to your other /api/portfolio/* routes ---

@app.post("/api/portfolio/analyze")
def portfolio_analyze(request: PortfolioRequest):
    """Portfolio Builder: weighted resilience score for one custom portfolio with NaN protection."""
    try:
        companies = [c.model_dump() for c in request.companies]
        result = analyze_portfolio(resilience_engine, companies, request.months_ahead)
        return clean_nans(result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/portfolio/compare")
def portfolio_compare(request: PortfolioCompareRequest):
    """Portfolio Comparison: Portfolio A vs. Portfolio B with NaN protection."""
    try:
        a = [c.model_dump() for c in request.portfolio_a]
        b = [c.model_dump() for c in request.portfolio_b]
        result = compare_portfolios(resilience_engine, a, b, request.months_ahead)
        return clean_nans(result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/portfolio/stress_test")
def portfolio_stress_test(request: StressTestRequest):
    """Macro Stress Testing: 'what if inflation hits 7.0%?' live slider sim.
    Bypasses the cached leaderboard forecast — runs a manual scenario."""
    try:
        companies = [c.model_dump() for c in request.companies]
        return stress_test_portfolio(
            financial_agent, companies,
            request.override_inflation, request.override_repo, request.override_oil,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        # gemini edit
# pyrefly: ignore [missing-import]
from io import BytesIO
import pandas as pd

import math
import numpy as np
import pandas as pd
from io import BytesIO
from fastapi import UploadFile, File, Query, HTTPException

import math
import numpy as np

def clean_nans(data):
    """Recursively replaces any NaN or Inf with None or 0.0 to prevent JSON crashes."""
    if data is None:
        return None
    if isinstance(data, (float, np.float64, np.float32)):
        if math.isnan(data) or math.isinf(data) or np.isnan(data):
            return 0.0
        return float(data)
    if isinstance(data, (int, np.int64, np.int32)):
        return int(data)
    if isinstance(data, dict):
        return {str(k): clean_nans(v) for k, v in data.items()}
    if isinstance(data, (list, tuple, set)):
        return [clean_nans(item) for item in data]
    return data

@app.post("/api/portfolio/upload")
async def portfolio_upload(file: UploadFile = File(...), months_ahead: int = 3):
    """CSV portfolio upload: LLM parses the CSV, matches companies, 
    and computes weighted resilience with full NaN protection."""
    try:
        raw_bytes = await file.read()
        csv_text = raw_bytes.decode("utf-8", errors="ignore")

        known_companies = [r["Company"] for r in resilience_engine.compute(months_ahead=months_ahead)]
        parsed = parse_portfolio_csv(rag_agent, csv_text, known_companies)

        if not parsed["holdings"]:
            raise HTTPException(
                status_code=400,
                detail="No holdings in the CSV could be matched to a company we have data for.",
            )

        # Compute analysis using your actual resilience engine
        analysis = analyze_portfolio(resilience_engine, parsed["holdings"], months_ahead)

        sector_medians = sector_engine.compute(months_ahead=months_ahead)
        macro = macro_agent.execute(input_payload=None, months_ahead=months_ahead)
        proj_inf = macro["inflation_forecast"]["final_inflation"]

        insights = generate_portfolio_insights(rag_agent, analysis, sector_medians, proj_inf)

        # Combine response and scrub every single potential NaN out recursively
        response_payload = {
            **analysis,
            "unmatched_from_csv": parsed["unmatched"],
            "ai_insights": insights
        }

        return clean_nans(response_payload)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/companies/{company_name}/explain")
def company_explain(company_name: str, mode: str = "resilient", months_ahead: int = 3):
    """'Why Resilient?' / 'Why Vulnerable?' dynamic narrative breakdown."""
    try:
        record = resilience_engine.get_by_company(company_name, months_ahead=months_ahead)
        if record is None:
            raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found.")
        narrative = (
            explain_vulnerability(rag_agent, record)
            if mode == "vulnerable"
            else explain_resilience(rag_agent, record)
        )
        return {"Company": record["Company"], "resilience_score": record["resilience_score"], "narrative": narrative}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/companies/{company_name}/reality-check")
def company_reality_check(company_name: str, months_ahead: int = 3):
    """Compares qualitative filing commentary (RAG retrieval) against the
    quantitative resilience score for the same company."""
    try:
        record = resilience_engine.get_by_company(company_name, months_ahead=months_ahead)
        if record is None:
            raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found.")
        # Reuses the existing RAG retrieval — filtered to this company if your
        # ingest_documents() has been re-run with per-chunk company metadata
        # (see MacroRiskAI_rag.py notes below); otherwise falls back to a
        # plain query.
        qualitative = rag_agent.execute(
            query=f"What does the commentary say about {company_name}'s financial resilience?",
        )
        qualitative_context = qualitative.get("answer") or qualitative.get("response", "")
        narrative = reality_check(rag_agent, company_name, qualitative_context, record)
        return {"Company": company_name, "reality_check": narrative}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)