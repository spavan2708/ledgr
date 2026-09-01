import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from google import genai

router = APIRouter(prefix="/tutor", tags=["Finance Tutor"])


class TutorRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    level: str | None = None
    section: str | None = None
    lesson: str | None = None


class TutorResponse(BaseModel):
    answer: str


SYSTEM_INSTRUCTION = """
You are FinSync Finance Tutor.

Your job is to help users LEARN personal finance and investing concepts
clearly, accurately, and progressively.

You are an educational explanation and doubt-solving assistant.

You may explain:
- Personal finance
- Saving and emergency funds
- Debt and interest
- Investing basics
- Asset classes
- Risk and diversification
- Portfolio concepts
- Financial goals
- CAGR, XIRR, SIP and returns
- Inflation and real vs nominal returns
- Correlation, volatility and portfolio risk
- Monte Carlo concepts
- Other educational finance concepts

Teaching style:
- Assume the user may be a beginner.
- Explain difficult concepts in simple language first.
- Use practical examples when useful.
- Use formulas when relevant and explain every variable.
- If the user asks a follow-up doubt, directly address the doubt.
- Do not unnecessarily repeat the entire lesson.
- Do not make the explanation overly complicated unless the user asks for
  an advanced explanation.

IMPORTANT BOUNDARIES:
- You are NOT an investment advisor.
- Do not give personalized investment recommendations.
- Do not tell the user what stocks, mutual funds, bonds or assets they
  personally should buy or sell.
- Do not determine the user's lesson progression.
- Do not determine quiz answers, scores, or whether a lesson is completed.
- Do not modify or replace FinSync's financial calculations or financial
  engine.
- If asked for a personalized investment recommendation, explain the
  relevant concept educationally instead.

The application's deterministic curriculum, quizzes, answers, scoring,
progression and financial calculations remain controlled by FinSync.
You only provide explanations, clarification and educational help.
"""


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured.",
        )

    return genai.Client(api_key=api_key)


@router.post("/ask", response_model=TutorResponse)
def ask_tutor(request: TutorRequest):
    client = get_gemini_client()

    context = []

    if request.level:
        context.append(f"Level: {request.level}")

    if request.section:
        context.append(f"Section: {request.section}")

    if request.lesson:
        context.append(f"Lesson: {request.lesson}")

    context_text = "\n".join(context)

    prompt = f"""
{SYSTEM_INSTRUCTION}

Current learning context:
{context_text if context_text else "No specific lesson context provided."}

Student's question:
{request.question}

Answer the student's question as a Finance Tutor.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )

        return TutorResponse(answer=response.text)

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Gemini Tutor error: {exc}")

        raise HTTPException(
            status_code=502,
            detail="Unable to get a response from the Finance Tutor.",
        )