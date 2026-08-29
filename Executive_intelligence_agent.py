import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class ReportAgent:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("Macro")
        if not api_key:
            print("⚠️ Warning: OpenAI API key (OPENAI_API_KEY) not found in environment variables.")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)

    def execute(self, company_name: str, historical_data: list, macro_data: dict, financial_forecasts: dict, macro_impacts: dict = None) -> str:
        """Generates an executive summary and financial report using OpenAI."""
        
        # We grab the last 5 years of historical data so we don't overwhelm the LLM's context window
        recent_history = historical_data[-5:] if len(historical_data) > 5 else historical_data

        prompt = f"""
        You are an expert Wall Street financial analyst.
        Write a concise, professional investment and financial health report for {company_name}.
        
        Here is the macroeconomic forecast for the next few months:
        {json.dumps(macro_data.get('macro_summary', {}), indent=2)}
        Projected Inflation: {macro_data.get('inflation_forecast', {}).get('final_inflation')}%
        
        Here is the recent historical financial trend (Last 5 years):
        {json.dumps(recent_history, indent=2)}
        
        Here are our AI-driven financial growth forecasts for the upcoming period, and the direct percentage point impact caused by the shifting economy:
        Forecasted Growth: {json.dumps(financial_forecasts, indent=2)}
        Macro Impact (Percentage points added/lost due to economy): {json.dumps(macro_impacts, indent=2)}
        
        Format the report beautifully in Markdown. Include:
        1. Executive Summary
        2. Historical Performance Analysis (Briefly summarize past trends)
        3. Macroeconomic Context (How the economy might affect them)
        4. Future Financial Outlook (Analyze our AI predictions)
        
        Keep it strictly analytical, data-driven, and under 450 words. Do not hallucinate data.
        """

        if not self.client:
            api_key = os.getenv("OPENAI_API_KEY") or os.getenv("Macro")
            if api_key:
                self.client = OpenAI(api_key=api_key)
            else:
                return "❌ Error: OpenAI API key is missing. Please set OPENAI_API_KEY in your .env file."

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo", # You can change this to gpt-4o if you prefer
                messages=[
                    {"role": "system", "content": "You are a top-tier financial analyst AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"❌ Error generating report with OpenAI: {str(e)}"
