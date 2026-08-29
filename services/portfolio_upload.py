# services/portfolio_upload.py
from __future__ import annotations
import json
import re


def _strip_json_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_portfolio_csv(rag_agent, csv_text: str, known_companies: list[str]) -> dict:
    """LLM-driven CSV parsing: maps arbitrary CSV columns and handles fuzzy name 
    or ticker matching against our known company universe."""
    csv_excerpt = csv_text[:12000]
    company_list = ", ".join(known_companies)

    prompt = f"""You are parsing a user-uploaded portfolio CSV into a structured holdings list. 
Here is the raw CSV content:

{csv_excerpt}

Here is the list of official company identifiers/names we have resilience data for:
{company_list}

Rules:
1. Identify which column holds the stock name, ticker, or description, and which holds size (% weight, share count, or value).
2. Match each row's stock to the closest entry in the known company list above. 
   - Be flexible with variations (e.g., "State Bank of India" or "SBIN" should match "sbin" or similar entries; "Suzlon Energy" matches "suzlon").
   - If a company matches reasonably well conceptually or via ticker/brand name, map it to the official identifier from the list.
   - If it genuinely has no relation to any company in the list, put it in "unmatched".
3. Convert whatever size column exists into a percentage weight that sums to roughly 100 across the matched holdings only.
4. Do not invent holdings that are not in the CSV.

Respond with ONLY this JSON structure, no other text:
{{
  "holdings": [{{"name": "<matched company name exactly as it appears in the known list>", "weight": <float>}}],
  "unmatched": [{{"csv_name": "<name as it appeared in the CSV>", "reason": "<why it couldn't be matched>"}}]
}}"""

    raw = rag_agent.llm.invoke(prompt).content
    try:
        parsed = json.loads(_strip_json_fences(raw))
    except json.JSONDecodeError as e:
        raise ValueError(f"Couldn't parse the portfolio CSV via the LLM — malformed response: {e}")

    holdings = parsed.get("holdings", [])
    total = sum(h.get("weight", 0) for h in holdings)
    if total > 0 and abs(total - 100) > 0.5:
        for h in holdings:
            h["weight"] = round(h["weight"] / total * 100, 2)

    return {"holdings": holdings, "unmatched": parsed.get("unmatched", [])}
def generate_portfolio_insights(
    rag_agent,
    portfolio_analysis: dict,
    sector_medians: list[dict],
    macro_inflation: float,
) -> str:
    """Narrative layer: combines the portfolio's weighted resilience score,
    per-holding scores, sector concentration against sector median scores,
    and the current inflation outlook into a plain-English brief."""
    holdings_summary = "\n".join(
        f"- {h['Company']} ({h['weight']}%): resilience {h['resilience_score']}/100, "
        f"sector {h.get('Industry_Group')}"
        for h in portfolio_analysis["holdings"]
    )
    sector_lookup = {s["sector"]: s["median_resilience_score"] for s in sector_medians}
    sectors_in_portfolio = {h.get("Industry_Group") for h in portfolio_analysis["holdings"]}
    concentration = "\n".join(
        f"- {sector}: "
        f"{sum(h['weight'] for h in portfolio_analysis['holdings'] if h.get('Industry_Group') == sector):.1f}% "
        f"of portfolio (sector median score: {sector_lookup.get(sector, 'n/a')})"
        for sector in sectors_in_portfolio
    )

    prompt = f"""You are a portfolio analyst. A user uploaded a portfolio; here
is what we computed about it:

Weighted portfolio resilience score: {portfolio_analysis['weighted_resilience_score']}/100
Current inflation forecast: {macro_inflation}%

Holdings:
{holdings_summary}

Sector concentration vs. sector median resilience:
{concentration}

In 5-7 sentences, written for a retail investor (not a professional):
1. Assess overall inflation resilience of this portfolio.
2. Call out any sector over-concentration relative to that sector's own median
   score (e.g. heavily weighted in a sector that itself skews vulnerable).
3. Name the 1-2 weakest holdings dragging the score down and the 1-2
   strongest holdings anchoring it.
4. Do not invent numbers not given above. Do not give explicit buy/sell
   advice — describe risk exposure, not recommendations."""

    return rag_agent.llm.invoke(prompt).content