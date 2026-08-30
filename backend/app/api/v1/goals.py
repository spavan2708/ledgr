from fastapi import APIRouter

from app.schemas.goals import GoalSimulationRequest, GoalSimulationResponse
from app.services.goal_simulator import simulate_goals

router = APIRouter(prefix="/goals", tags=["goal planning"])


@router.post("/simulate", response_model=GoalSimulationResponse)
def simulate(request: GoalSimulationRequest) -> GoalSimulationResponse:
    return simulate_goals(request)
