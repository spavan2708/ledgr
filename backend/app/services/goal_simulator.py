from datetime import date
from math import ceil

import numpy as np

from app.schemas.goals import (
    CapacityAllocation, CapacitySummary, GoalInput, GoalResult, GoalSimulationRequest,
    GoalSimulationResponse, MonteCarloResult, ScenarioAssumption, ScenarioProjection,
    TimelinePoint,
)

LIMITATIONS = [
    "All returns, volatility and inflation assumptions are hypothetical educational inputs, not forecasts or recommendations.",
    "Projected and simulated values are not guaranteed and exclude taxes, fees, product constraints and behavioral changes.",
    "Simulated attainment frequency describes generated scenarios only; it is not a real-world probability of success.",
    "Market-regime and persona classifications do not determine return assumptions or change these calculations.",
]


def inflation_adjusted_target(target: float, annual_inflation_percent: float, months: int) -> float:
    return target * (1 + annual_inflation_percent / 100) ** (months / 12)


def future_value_current_savings(current: float, annual_return_percent: float, months: int) -> float:
    return current * (1 + annual_return_percent / 100 / 12) ** months


def ordinary_annuity_future_value(monthly: float, annual_return_percent: float, months: int) -> float:
    monthly_rate = annual_return_percent / 100 / 12
    if abs(monthly_rate) < 1e-12:
        return monthly * months
    return monthly * (((1 + monthly_rate) ** months - 1) / monthly_rate)


def project_balance(current: float, monthly: float, annual_return_percent: float, months: int, annual_step_up_percent: float = 0) -> float:
    balance = current
    monthly_rate = annual_return_percent / 100 / 12
    for month in range(months):
        contribution = monthly * (1 + annual_step_up_percent / 100) ** (month // 12)
        balance = balance * (1 + monthly_rate) + contribution
    return balance


def required_monthly_contribution(target: float, current: float, annual_return_percent: float, months: int, annual_step_up_percent: float = 0) -> float:
    remaining = target - future_value_current_savings(current, annual_return_percent, months)
    if remaining <= 0:
        return 0
    monthly_rate = annual_return_percent / 100 / 12
    if annual_step_up_percent == 0:
        factor = months if abs(monthly_rate) < 1e-12 else ((1 + monthly_rate) ** months - 1) / monthly_rate
        return remaining / factor
    low, high = 0.0, max(target, 1.0)
    while project_balance(current, high, annual_return_percent, months, annual_step_up_percent) < target and high < 1_000_000_000:
        high *= 2
    for _ in range(80):
        midpoint = (low + high) / 2
        if project_balance(current, midpoint, annual_return_percent, months, annual_step_up_percent) >= target:
            high = midpoint
        else:
            low = midpoint
    return high


def simulate_goals(request: GoalSimulationRequest) -> GoalSimulationResponse:
    goal_results = [_simulate_goal(goal, request, index) for index, goal in enumerate(request.goals)]
    capacity = _allocate_capacity(request, goal_results)
    inputs = {goal.id: goal for goal in request.goals}
    for allocation in capacity.allocations:
        result = next(item for item in goal_results if item.id == allocation.goal_id)
        goal = inputs[result.id]
        result.assigned_monthly_capacity = allocation.assigned_monthly_capacity
        result.monthly_capacity_gap = allocation.unfunded_monthly_gap
        result.capacity_status = "funded" if allocation.unfunded_monthly_gap <= 0.01 else ("partially_funded" if allocation.assigned_monthly_capacity > 0 else "unfunded")
        result.allocated_capacity_projected_value = round(project_balance(goal.current_saved, allocation.assigned_monthly_capacity, request.assumptions.base.nominal_annual_return, result.horizon_months, goal.annual_step_up_percentage), 2)
    warnings: list[str] = []
    if capacity.capacity_conflicts:
        warnings.append("Available monthly capacity is insufficient to cover all calculated required contributions.")
    if sum(goal.planned_monthly_contribution for goal in request.goals) > request.estimated_monthly_capacity:
        warnings.append("Planned monthly contributions exceed the supplied estimated investment capacity.")
    return GoalSimulationResponse(capacity_summary=capacity, goals=goal_results, assumptions=request.assumptions, monte_carlo_enabled=request.monte_carlo_enabled, warnings=warnings, limitations=LIMITATIONS)


def _simulate_goal(goal: GoalInput, request: GoalSimulationRequest, index: int) -> GoalResult:
    months = _months(goal)
    base = request.assumptions.base
    inflation = goal.inflation_rate if goal.inflation_rate is not None else base.inflation_rate
    adjusted_target = goal.target_amount if goal.amount_basis == "future_value" else inflation_adjusted_target(goal.target_amount, inflation, months)
    fv_current = future_value_current_savings(goal.current_saved, base.nominal_annual_return, months)
    required = required_monthly_contribution(adjusted_target, goal.current_saved, base.nominal_annual_return, months, goal.annual_step_up_percentage)
    projected = project_balance(goal.current_saved, goal.planned_monthly_contribution, base.nominal_annual_return, months, goal.annual_step_up_percentage)
    funded_now = goal.current_saved >= goal.target_amount
    if funded_now:
        status = "already_funded"
    elif projected >= adjusted_target:
        status = "on_track"
    elif required <= request.estimated_monthly_capacity:
        status = "needs_adjustment"
    else:
        status = "currently_unfeasible"
    scenarios = [_scenario_projection(name, assumption, goal, months) for name, assumption in (("conservative", request.assumptions.conservative), ("base", base), ("optimistic", request.assumptions.optimistic))]
    timeline = _timeline(goal, months, adjusted_target, base.nominal_annual_return)
    monte_carlo = _monte_carlo(goal, months, adjusted_target, base, request.simulation_count, request.seed + index) if request.monte_carlo_enabled else None
    explanations = [
        "Required contribution uses the ordinary-annuity rearrangement when step-up is zero; otherwise an 80-iteration bounded binary search is used.",
        "Contributions are applied at each month end and increase after each completed 12-month period when step-up is enabled.",
    ]
    warnings = ["Current savings meet or exceed the entered current target; this goal is marked already funded."] if funded_now else []
    return GoalResult(id=goal.id, name=goal.name, category=goal.category, horizon_months=months, status=status, inflation_adjusted_target=round(adjusted_target, 2), future_value_current_savings=round(fv_current, 2), required_monthly_contribution=round(0 if funded_now else required, 2), planned_monthly_contribution=round(goal.planned_monthly_contribution, 2), projected_value=round(projected, 2), funding_gap_or_surplus=round(projected - adjusted_target, 2), progress_percentage=round(min(100, goal.current_saved / goal.target_amount * 100), 2), projected_attainment_percentage=round(projected / adjusted_target * 100, 2), scenarios=scenarios, timeline=timeline, monte_carlo=monte_carlo, explanations=explanations, warnings=warnings)


def _scenario_projection(name: str, assumption: ScenarioAssumption, goal: GoalInput, months: int) -> ScenarioProjection:
    inflation = goal.inflation_rate if goal.inflation_rate is not None else assumption.inflation_rate
    target = goal.target_amount if goal.amount_basis == "future_value" else inflation_adjusted_target(goal.target_amount, inflation, months)
    projected = project_balance(goal.current_saved, goal.planned_monthly_contribution, assumption.nominal_annual_return, months, goal.annual_step_up_percentage)
    return ScenarioProjection(scenario=name, projected_value=round(projected, 2), adjusted_target=round(target, 2), funding_gap_or_surplus=round(projected - target, 2), attainment_percentage=round(projected / target * 100, 2), nominal_annual_return=assumption.nominal_annual_return, annual_volatility=assumption.annual_volatility, inflation_rate=inflation)


def _timeline(goal: GoalInput, months: int, target: float, annual_return: float) -> list[TimelinePoint]:
    balance = goal.current_saved
    monthly_rate = annual_return / 100 / 12
    points = [TimelinePoint(month=0, projected_value=round(balance, 2), adjusted_target=round(target, 2))]
    for month in range(months):
        contribution = goal.planned_monthly_contribution * (1 + goal.annual_step_up_percentage / 100) ** (month // 12)
        balance = balance * (1 + monthly_rate) + contribution
        points.append(TimelinePoint(month=month + 1, projected_value=round(balance, 2), adjusted_target=round(target, 2)))
    return points


def _monte_carlo(goal: GoalInput, months: int, target: float, assumption: ScenarioAssumption, count: int, seed: int) -> MonteCarloResult:
    rng = np.random.default_rng(seed)
    balances = np.full(count, goal.current_saved, dtype=float)
    monthly_mean = assumption.nominal_annual_return / 100 / 12
    monthly_volatility = assumption.annual_volatility / 100 / np.sqrt(12)
    for month in range(months):
        monthly_returns = np.maximum(rng.normal(monthly_mean, monthly_volatility, count), -0.99)
        contribution = goal.planned_monthly_contribution * (1 + goal.annual_step_up_percentage / 100) ** (month // 12)
        balances = balances * (1 + monthly_returns) + contribution
    p10, p50, p90 = np.percentile(balances, [10, 50, 90])
    return MonteCarloResult(simulations=count, seed=seed, p10=round(float(p10), 2), p50=round(float(p50), 2), p90=round(float(p90), 2), attainment_frequency_percentage=round(float(np.mean(balances >= target) * 100), 2), attainment_frequency_label="Percentage of generated scenarios reaching the target under these assumptions.")


def _allocate_capacity(request: GoalSimulationRequest, results: list[GoalResult]) -> CapacitySummary:
    priority_order = {"essential": 0, "high": 1, "medium": 2, "low": 3}
    indexed = list(enumerate(zip(request.goals, results, strict=True)))
    ordered = sorted(indexed, key=lambda item: (priority_order[item[1][0].priority], item[1][1].horizon_months, item[0]))
    remaining = request.estimated_monthly_capacity
    allocations: list[CapacityAllocation] = []
    conflicts: list[str] = []
    for _, (goal, result) in ordered:
        assigned = min(remaining, result.required_monthly_contribution)
        gap = result.required_monthly_contribution - assigned
        remaining -= assigned
        if gap > 0.01:
            conflicts.append(f"{goal.name} has an illustrative monthly capacity gap of ₹{gap:,.2f}.")
        allocations.append(CapacityAllocation(goal_id=goal.id, goal_name=goal.name, priority=goal.priority, required_monthly_contribution=result.required_monthly_contribution, planned_monthly_contribution=goal.planned_monthly_contribution, assigned_monthly_capacity=round(assigned, 2), unfunded_monthly_gap=round(gap, 2)))
    return CapacitySummary(estimated_monthly_capacity=round(request.estimated_monthly_capacity, 2), total_planned_contributions=round(sum(goal.planned_monthly_contribution for goal in request.goals), 2), total_required_contributions=round(sum(result.required_monthly_contribution for result in results), 2), remaining_monthly_capacity=round(remaining, 2), allocations=allocations, capacity_conflicts=conflicts, allocation_explanation="Illustrative capacity is assigned by priority (essential, high, medium, low), then earlier horizon, then stable request order. Planned contributions are reported unchanged.")


def _months(goal: GoalInput) -> int:
    if goal.horizon_months is not None:
        return goal.horizon_months
    today = date.today()
    assert goal.target_date is not None
    return max(1, ceil((goal.target_date - today).days / 30.4375))
