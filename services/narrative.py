# services/narrative.py
from __future__ import annotations


def explain_resilience(rag_agent, company_record: dict) -> str:
    """'Why Resilient?' — plain-English breakdown of a high score."""
    prompt = f"""You are a financial analyst. A quantitative model scored
{company_record['Company']} ({company_record.get('Industry_Group')}) at
{company_record['resilience_score']}/100 for inflation resilience, based on:
- Net Profit Growth: {company_record.get('Net Profit Growth')}%
- Operating Profit Growth: {company_record.get('Operating Profit Growth')}%
- Operating Cash Flow Growth: {company_record.get('Operating Cash Flow Growth')}%
- Borrowings Growth: {company_record.get('Borrowings Growth')}%
- Equity Growth: {company_record.get('Equity Growth')}%
- Total Assets Growth: {company_record.get('Total Assets Growth')}%

In 3-4 sentences, explain WHY this score makes sense given these numbers.
Be specific about which metrics drove the score up or down. Do not invent
numbers not listed above."""
    return rag_agent.llm.invoke(prompt).content


def explain_vulnerability(rag_agent, company_record: dict) -> str:
    """'Why Vulnerable?' — plain-English breakdown of a low score."""
    prompt = f"""You are a financial analyst. A quantitative model scored
{company_record['Company']} ({company_record.get('Industry_Group')}) at
{company_record['resilience_score']}/100 for inflation resilience — on the
low end. Based on the same 6 metrics used for that score, explain in 3-4
sentences which specific weaknesses (e.g. rising borrowings, shrinking cash
flow) are dragging the score down. Do not invent numbers not provided:
- Net Profit Growth: {company_record.get('Net Profit Growth')}%
- Operating Cash Flow Growth: {company_record.get('Operating Cash Flow Growth')}%
- Borrowings Growth: {company_record.get('Borrowings Growth')}%
- Equity Growth: {company_record.get('Equity Growth')}%
- Total Assets Growth: {company_record.get('Total Assets Growth')}%"""
    return rag_agent.llm.invoke(prompt).content


def reality_check(rag_agent, company: str, qualitative_context: str, quantitative_record: dict) -> str:
    """Compares qualitative PDF/filing commentary (from the RAG's Chroma
    retrieval) against the quantitative resilience_score record for the same
    company and flags agreement/disagreement between the two."""
    prompt = f"""You are comparing two sources of truth about {company}'s
inflation resilience:

QUALITATIVE (from filings/commentary retrieval):
{qualitative_context}

QUANTITATIVE (model output):
- Resilience Score: {quantitative_record.get('resilience_score')}/100
- Net Profit Growth: {quantitative_record.get('Net Profit Growth')}%
- Operating Cash Flow Growth: {quantitative_record.get('Operating Cash Flow Growth')}%
- Borrowings Growth: {quantitative_record.get('Borrowings Growth')}%

In 4-5 sentences: do the qualitative commentary and the quantitative score
agree or disagree? If they disagree, say plainly which one looks more
reliable given what's cited, and why. Do not invent facts not present in
either source above."""
    return rag_agent.llm.invoke(prompt).content
