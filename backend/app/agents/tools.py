from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, ValidationError

from app.schemas.goals import GoalSimulationRequest
from app.schemas.profile import FinancialProfileRequest
from app.services.financial_profile import analyze_financial_profile
from app.services.goal_simulator import simulate_goals


class ToolRegistry:
    """Small allow-list; it deliberately has no arbitrary execution or URL tools."""

    def __init__(self) -> None:
        self._tools: dict[str, tuple[type[BaseModel], Callable[[Any], Any]]] = {
            "analyze_financial_profile": (FinancialProfileRequest, analyze_financial_profile),
            "simulate_goals": (GoalSimulationRequest, simulate_goals),
        }

    @property
    def names(self) -> tuple[str, ...]:
        return tuple(self._tools)

    def call(self, name: str, arguments: dict[str, Any]) -> Any:
        if name not in self._tools:
            raise ValueError("Tool is not allow-listed")
        schema, function = self._tools[name]
        try:
            validated = schema.model_validate(arguments)
        except ValidationError as exc:
            raise ValueError("Tool arguments failed validation") from exc
        return function(validated)


registry = ToolRegistry()

