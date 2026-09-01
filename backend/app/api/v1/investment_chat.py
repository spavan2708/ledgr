import os
import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from google import genai
from typing import List, Dict, Any

router = APIRouter(prefix="/investment-chat", tags=["Investment Chat"])

class MessageHistory(BaseModel):
    role: str
    content: str

class InvestmentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[MessageHistory] = []
    financial_context: Dict[str, Any] | None = None

class InvestmentChatResponse(BaseModel):
    reply: str

SYSTEM_INSTRUCTION = """
You are FinSync's Investment Assistant.

Your job is to help users understand investing and to explain FinSync's existing financial recommendations.

You are not the Financial Engine and must not replace its calculations.

When users ask educational questions, explain investment concepts clearly.

When users describe a change in their financial circumstances, do not immediately recommend an investment. Ask relevant follow-up questions to understand the change. Examples of questions to consider:
- How much of the increase is actually available for investing after any increase in expenses?
- Have your monthly expenses changed?
- Do you have an adequate emergency fund?
- Do you have outstanding/high-interest debt?
- Have your financial goals changed?
- Have your goal timelines changed?
- Has your risk preference changed?
(Do not ask all questions blindly every time. Ask only the questions relevant to the situation.)

When Financial Engine results are available, treat them as the source of truth for target allocation calculations and explain the reasoning using the financial inputs available to you.

Never invent financial data, engine outputs, calculations, or reasons. If the necessary reasoning data is unavailable, say that the current target allocation is available but the underlying reason cannot be determined from the data provided.

Distinguish between increasing the amount invested and changing the target asset allocation. If a user's salary increases, explain that higher salary may simply allow them to invest more while maintaining their existing target allocation, unless their goals, horizons, or risk preference changed.

If a change to the plan may be needed:
1. Identify what changed.
2. Compare it with the current financial context.
3. Explain whether the existing target allocation may still be appropriate.
4. Indicate that the Financial Engine should determine the updated target.
5. Explain what changed between the old and new recommendation (if applicable).
6. Explain WHY the allocation changed.

Do not allow Gemini to independently calculate arbitrary allocation percentages.

Do not provide unsupported personalized investment instructions.
Explain assumptions and uncertainty clearly.
Your purpose is to help the user understand and make informed decisions using FinSync's financial planning framework.
"""

from dotenv import load_dotenv

def get_gemini_client():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"[DEBUG] GEMINI_API_KEY is {'FOUND' if api_key else 'MISSING'}")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured.",
        )
    return genai.Client(api_key=api_key)

@router.post("/ask", response_model=InvestmentChatResponse)
def ask_investment_chatbot(request: InvestmentChatRequest):
    try:
        client = get_gemini_client()
        
        # Optional history truncation (last 10 messages) to avoid overly large prompts
        history = request.history[-10:] if request.history else []
        
        # Construct history context if provided
        history_text = ""
        if history:
            history_text = "Recent conversation history:\n"
            for msg in history:
                role = "User" if msg.role == "user" else "Assistant"
                history_text += f"{role}: {msg.content}\n"
            history_text += "\n"

        prompt = f"""
{SYSTEM_INSTRUCTION}

{f"USER'S FINSYNC FINANCIAL CONTEXT:\n{request.financial_context}\n" if request.financial_context else ""}

{history_text}
Student's question:
{request.message}
"""
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )
        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )
        return InvestmentChatResponse(reply=response.text)
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Gemini Investment Chat error: {exc}")
        traceback.print_exc()
        raise HTTPException(
            status_code=503,
            detail="Unable to get a response from the Investment Chatbot.",
        )

