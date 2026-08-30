from fastapi import APIRouter

from app.schemas.profile import FinancialProfileRequest, FinancialProfileResponse
from app.services.financial_profile import analyze_financial_profile

router = APIRouter(prefix="/profile", tags=["financial profile"])


@router.post("/analyze", response_model=FinancialProfileResponse)
def analyze_profile(profile: FinancialProfileRequest) -> FinancialProfileResponse:
    """Create a deterministic financial health analysis for a profile."""
    return analyze_financial_profile(profile)
