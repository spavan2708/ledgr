from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator

GoalCategory = Literal["emergency_reserve", "education", "vehicle", "house", "travel", "business", "retirement", "wealth_creation", "custom"]
Priority = Literal["essential", "high", "medium", "low"]
Flexibility = Literal["fixed", "somewhat_flexible", "flexible"]
GoalStatus = Literal["already_funded", "on_track", "needs_adjustment", "currently_unfeasible"]


class GoalInput(BaseModel):
    id: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=120)
    category: GoalCategory
    target_amount: float = Field(gt=0, le=1_000_000_000_000)
    amount_basis: Literal["today_value", "future_value"]
    current_saved: float = Field(ge=0, le=1_000_000_000_000)
    target_date: date | None = None
    horizon_months: int | None = Field(default=None, ge=1, le=600)
    priority: Priority
    flexibility: Flexibility
    planned_monthly_contribution: float = Field(ge=0, le=100_000_000)
    annual_step_up_percentage: float = Field(default=0, ge=0, le=100)
    inflation_rate: float | None = Field(default=None, ge=0, le=20)
    notes: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_timeline(self) -> "GoalInput":
        if (self.target_date is None) == (self.horizon_months is None):
            raise ValueError("Provide exactly one of target_date or horizon_months")
        if self.target_date is not None and self.target_date <= date.today():
            raise ValueError("target_date must be in the future")
        return self


class ScenarioAssumption(BaseModel):
    nominal_annual_return: float = Field(ge=-50, le=50)
    annual_volatility: float = Field(ge=0, le=100)
    inflation_rate: float = Field(ge=0, le=20)


class ScenarioAssumptions(BaseModel):
    conservative: ScenarioAssumption = Field(default_factory=lambda: ScenarioAssumption(nominal_annual_return=4, annual_volatility=8, inflation_rate=6))
    base: ScenarioAssumption = Field(default_factory=lambda: ScenarioAssumption(nominal_annual_return=8, annual_volatility=15, inflation_rate=5))
    optimistic: ScenarioAssumption = Field(default_factory=lambda: ScenarioAssumption(nominal_annual_return=12, annual_volatility=22, inflation_rate=4))


class GoalSimulationRequest(BaseModel):
    estimated_monthly_capacity: float = Field(ge=0, le=100_000_000)
    goals: list[GoalInput] = Field(min_length=1, max_length=25)
    assumptions: ScenarioAssumptions = Field(default_factory=ScenarioAssumptions)
    monte_carlo_enabled: bool = False
    simulation_count: int = Field(default=1000, ge=100, le=10_000)
    seed: int = Field(default=20260830, ge=0, le=2_147_483_647)

    @model_validator(mode="after")
    def unique_goal_ids(self) -> "GoalSimulationRequest":
        ids = [goal.id for goal in self.goals]
        if len(ids) != len(set(ids)):
            raise ValueError("Goal ids must be unique")
        return self


class ScenarioProjection(BaseModel):
    scenario: Literal["conservative", "base", "optimistic"]
    projected_value: float
    adjusted_target: float
    funding_gap_or_surplus: float
    attainment_percentage: float
    nominal_annual_return: float
    annual_volatility: float
    inflation_rate: float


class TimelinePoint(BaseModel):
    month: int
    projected_value: float
    adjusted_target: float


class MonteCarloResult(BaseModel):
    simulations: int
    seed: int
    p10: float
    p50: float
    p90: float
    attainment_frequency_percentage: float
    attainment_frequency_label: Literal["Percentage of generated scenarios reaching the target under these assumptions."]


class GoalResult(BaseModel):
    id: str
    name: str
    category: GoalCategory
    horizon_months: int
    status: GoalStatus
    inflation_adjusted_target: float
    future_value_current_savings: float
    required_monthly_contribution: float
    planned_monthly_contribution: float
    projected_value: float
    funding_gap_or_surplus: float
    progress_percentage: float
    projected_attainment_percentage: float
    scenarios: list[ScenarioProjection]
    timeline: list[TimelinePoint]
    monte_carlo: MonteCarloResult | None
    explanations: list[str]
    warnings: list[str]


class CapacityAllocation(BaseModel):
    goal_id: str
    goal_name: str
    priority: Priority
    required_monthly_contribution: float
    planned_monthly_contribution: float
    assigned_monthly_capacity: float
    unfunded_monthly_gap: float


class CapacitySummary(BaseModel):
    estimated_monthly_capacity: float
    total_planned_contributions: float
    total_required_contributions: float
    remaining_monthly_capacity: float
    allocations: list[CapacityAllocation]
    capacity_conflicts: list[str]
    allocation_explanation: str


class GoalSimulationResponse(BaseModel):
    capacity_summary: CapacitySummary
    goals: list[GoalResult]
    assumptions: ScenarioAssumptions
    monte_carlo_enabled: bool
    warnings: list[str]
    limitations: list[str]
