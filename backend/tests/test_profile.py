from copy import deepcopy

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

HEALTHY_PROFILE = {
    "name": "Ananya Sharma",
    "age": 32,
    "occupation": "Product manager",
    "monthly_income": 180000,
    "monthly_essential_expenses": 50000,
    "monthly_financial_obligations": 15000,
    "monthly_debt_payments": 10000,
    "current_savings": 900000,
    "emergency_fund": 350000,
    "outstanding_debt": 300000,
    "total_assets": 2500000,
    "liquid_assets": 750000,
    "total_liabilities": 300000,
    "dependents": 1,
    "income_stability": 5,
    "investment_experience": 4,
    "investment_horizon_years": 12,
    "volatility_comfort": 4,
    "additional_context": "Planning for a home in five years.",
}


def analyze(profile: dict) -> dict:
    response = client.post("/api/v1/profile/analyze", json=profile)
    assert response.status_code == 200
    return response.json()


def test_financially_healthy_profile() -> None:
    result = analyze(HEALTHY_PROFILE)
    assert result["profile"]["name"] == "Ananya Sharma"
    assert result["health_label"] in {"Healthy", "Strong"}
    assert result["metrics"]["investable_surplus"] == 115000
    assert result["metrics"]["estimated_monthly_investment_capacity"] > 0
    assert result["positive_factors"]
    assert len(result["score_explanations"]) == 7
    assert result["score_name"] == "FinSync Adaptive Health Score — a proprietary educational indicator."
    assert len(result["comparative_strategies"]) == 3


def test_expenses_greater_than_income() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile["monthly_income"] = 50000
    profile["monthly_essential_expenses"] = 60000
    result = analyze(profile)
    assert result["metrics"]["investable_surplus"] < 0
    assert result["metrics"]["estimated_monthly_investment_capacity"] == 0
    assert result["risk_factors"]
    assert result["warnings"]


def test_zero_income() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile["monthly_income"] = 0
    result = analyze(profile)
    assert result["metrics"]["expense_to_income_ratio"] is None
    assert result["metrics"]["debt_to_income_ratio"] is None
    assert result["metrics"]["savings_rate"] is None
    assert any("zero" in warning.lower() for warning in result["warnings"])


def test_negative_money_is_rejected() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile["outstanding_debt"] = -1
    response = client.post("/api/v1/profile/analyze", json=profile)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "outstanding_debt"


def test_ratings_must_be_between_one_and_five() -> None:
    for field, value in (("income_stability", 0), ("investment_experience", 6), ("volatility_comfort", 9)):
        profile = deepcopy(HEALTHY_PROFILE)
        profile[field] = value
        response = client.post("/api/v1/profile/analyze", json=profile)
        assert response.status_code == 422
        assert response.json()["detail"][0]["loc"][-1] == field


def test_score_always_stays_in_range() -> None:
    profiles = [deepcopy(HEALTHY_PROFILE)]
    low = deepcopy(HEALTHY_PROFILE)
    low.update({"monthly_income": 0, "monthly_essential_expenses": 1000000, "monthly_financial_obligations": 1000000, "emergency_fund": 0, "income_stability": 1, "investment_experience": 1, "investment_horizon_years": 1, "volatility_comfort": 1})
    profiles.append(low)
    for profile in profiles:
        score = analyze(profile)["financial_health_score"]
        assert 0 <= score <= 100


def test_zero_assets_returns_null_balance_sheet_ratios() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile.update({"total_assets": 0, "liquid_assets": 0})
    result = analyze(profile)
    assert result["metrics"]["debt_to_asset_ratio"] is None
    assert result["metrics"]["solvency_ratio"] is None
    assert result["model_features"]["debt_to_asset_ratio"] is None
    assert any("assets are zero" in warning.lower() for warning in result["warnings"])


def test_liabilities_greater_than_assets() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile.update({"total_assets": 500000, "liquid_assets": 200000, "total_liabilities": 800000, "outstanding_debt": 800000})
    result = analyze(profile)
    assert result["metrics"]["net_worth"] == -300000
    assert result["metrics"]["solvency_ratio"] < 0
    assert any("negative net worth" in factor.lower() for factor in result["risk_factors"])


def test_high_debt_service_ratio() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile["monthly_debt_payments"] = 70000
    profile["monthly_financial_obligations"] = 70000
    result = analyze(profile)
    assert result["metrics"]["debt_service_ratio"] > 0.30
    assert any("exceeds" in factor.lower() for factor in result["risk_factors"])
    debt_component = next(item for item in result["score_explanations"] if item["name"] == "Debt-service ratio")
    assert debt_component["score"] < debt_component["max_score"]


def test_fully_funded_emergency_reserve() -> None:
    profile = deepcopy(HEALTHY_PROFILE)
    profile["emergency_fund"] = profile["monthly_essential_expenses"] * 6
    result = analyze(profile)
    assert result["metrics"]["emergency_fund_coverage_months"] == 6
    assert any("six months" in factor.lower() for factor in result["positive_factors"])


def test_all_ratio_details_are_returned() -> None:
    result = analyze(HEALTHY_PROFILE)
    expected = {"savings_ratio", "expense_ratio", "debt_service_ratio", "debt_to_asset_ratio", "solvency_ratio", "liquidity_ratio", "emergency_fund_coverage"}
    assert {ratio["key"] for ratio in result["ratios"]} == expected
    for ratio in result["ratios"]:
        assert set(ratio) == {"key", "display_name", "value", "unit", "formula_description", "interpretation", "reference_range_used", "disclaimer"}
        assert "educational guidelines" in ratio["disclaimer"]


def test_model_features_structure_and_normalization() -> None:
    features = analyze(HEALTHY_PROFILE)["model_features"]
    assert set(features) == {"savings_ratio", "expense_ratio", "debt_service_ratio", "debt_to_asset_ratio", "solvency_ratio", "liquidity_months", "emergency_fund_months", "income_stability", "dependents", "investment_horizon_years", "volatility_comfort", "investment_experience"}
    assert features["income_stability"] == 1
    assert features["dependents"] == 0.05
    assert all(value is None or 0 <= value <= 1 for value in features.values())
