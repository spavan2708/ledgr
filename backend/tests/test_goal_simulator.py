from copy import deepcopy
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.goal_simulator import (
    future_value_current_savings, inflation_adjusted_target,
    ordinary_annuity_future_value, project_balance,
    required_monthly_contribution,
)

client = TestClient(app)

BASE_GOAL = {
    "id": "vehicle",
    "name": "Vehicle",
    "category": "vehicle",
    "target_amount": 800000,
    "amount_basis": "today_value",
    "current_saved": 100000,
    "horizon_months": 48,
    "priority": "high",
    "flexibility": "somewhat_flexible",
    "planned_monthly_contribution": 12000,
    "annual_step_up_percentage": 5,
}


def request_body(goals: list[dict] | None = None, monte_carlo: bool = False) -> dict:
    return {"estimated_monthly_capacity": 50000, "goals": goals or [deepcopy(BASE_GOAL)], "monte_carlo_enabled": monte_carlo, "simulation_count": 500, "seed": 42}


def test_inflation_adjustment() -> None:
    assert inflation_adjusted_target(100000, 6, 24) == pytest.approx(112360)


def test_zero_return_formulas() -> None:
    assert future_value_current_savings(100000, 0, 12) == 100000
    assert ordinary_annuity_future_value(1000, 0, 12) == 12000
    assert required_monthly_contribution(112000, 100000, 0, 12) == pytest.approx(1000)


def test_ordinary_annuity_future_value_and_required_contribution() -> None:
    future = ordinary_annuity_future_value(10000, 8, 60)
    required = required_monthly_contribution(future, 0, 8, 60)
    assert future > 600000
    assert required == pytest.approx(10000)


def test_step_up_contribution_and_binary_search() -> None:
    flat = project_balance(0, 10000, 8, 60, 0)
    stepped = project_balance(0, 10000, 8, 60, 10)
    assert stepped > flat
    required = required_monthly_contribution(stepped, 0, 8, 60, 10)
    assert required == pytest.approx(10000, rel=1e-6)


def test_already_funded_goal() -> None:
    goal = deepcopy(BASE_GOAL)
    goal["current_saved"] = goal["target_amount"]
    result = client.post("/api/v1/goals/simulate", json=request_body([goal])).json()["goals"][0]
    assert result["status"] == "already_funded"
    assert result["required_monthly_contribution"] == 0


def test_past_date_and_invalid_timeline_rejection() -> None:
    goal = deepcopy(BASE_GOAL)
    goal.pop("horizon_months")
    goal["target_date"] = (date.today() - timedelta(days=1)).isoformat()
    assert client.post("/api/v1/goals/simulate", json=request_body([goal])).status_code == 422
    goal["target_date"] = (date.today() + timedelta(days=365)).isoformat()
    goal["horizon_months"] = 12
    assert client.post("/api/v1/goals/simulate", json=request_body([goal])).status_code == 422


def test_scenario_projection_ordering() -> None:
    result = client.post("/api/v1/goals/simulate", json=request_body()).json()["goals"][0]
    projected = [scenario["projected_value"] for scenario in result["scenarios"]]
    assert projected[0] < projected[1] < projected[2]


def test_monte_carlo_is_seeded_and_percentiles_ordered() -> None:
    first = client.post("/api/v1/goals/simulate", json=request_body(monte_carlo=True)).json()
    second = client.post("/api/v1/goals/simulate", json=request_body(monte_carlo=True)).json()
    assert first == second
    simulation = first["goals"][0]["monte_carlo"]
    assert simulation["p10"] <= simulation["p50"] <= simulation["p90"]
    assert 0 <= simulation["attainment_frequency_percentage"] <= 100
    assert simulation["attainment_frequency_label"] == "Percentage of generated scenarios reaching the target under these assumptions."


def test_capacity_allocation_priority_and_conflict() -> None:
    low = {**deepcopy(BASE_GOAL), "id": "low", "name": "Low priority", "priority": "low", "horizon_months": 24, "target_amount": 2000000}
    essential = {**deepcopy(BASE_GOAL), "id": "essential", "name": "Emergency", "category": "emergency_reserve", "priority": "essential", "horizon_months": 36, "target_amount": 1500000}
    body = request_body([low, essential])
    body["estimated_monthly_capacity"] = 10000
    summary = client.post("/api/v1/goals/simulate", json=body).json()["capacity_summary"]
    assert summary["allocations"][0]["goal_id"] == "essential"
    assert summary["allocations"][0]["assigned_monthly_capacity"] == 10000
    assert summary["remaining_monthly_capacity"] == 0
    assert summary["capacity_conflicts"]


def test_goal_simulation_independent_of_market_and_ml(monkeypatch) -> None:
    monkeypatch.setattr("app.ml.market_regime.inference.get_market_regime", lambda mode: (_ for _ in ()).throw(RuntimeError("offline")))
    response = client.post("/api/v1/goals/simulate", json=request_body())
    assert response.status_code == 200
    assert response.json()["goals"][0]["projected_value"] > 0
    assert client.get("/api/v1/market/regime?mode=demo").status_code == 200


def test_profile_and_persona_endpoint_remains_functional() -> None:
    from tests.test_profile import HEALTHY_PROFILE
    response = client.post("/api/v1/profile/analyze", json=HEALTHY_PROFILE)
    assert response.status_code == 200
    assert "ml_persona" in response.json()
