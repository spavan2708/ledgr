from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FinancialProfileRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=18, le=100)
    occupation: str = Field(min_length=1, max_length=100)
    monthly_income: float = Field(ge=0)
    monthly_essential_expenses: float = Field(ge=0)
    monthly_financial_obligations: float = Field(ge=0)
    monthly_debt_payments: float = Field(ge=0)
    current_savings: float = Field(ge=0)
    emergency_fund: float = Field(ge=0)
    outstanding_debt: float = Field(ge=0)
    total_assets: float = Field(ge=0)
    liquid_assets: float = Field(ge=0)
    total_liabilities: float = Field(ge=0)
    dependents: int = Field(ge=0, le=20)
    income_stability: int = Field(ge=1, le=5)
    investment_experience: int = Field(ge=1, le=5)
    investment_horizon_years: int = Field(ge=1, le=60)
    volatility_comfort: int = Field(ge=1, le=5)
    additional_context: str | None = Field(default=None, max_length=2000)

    @field_validator("additional_context")
    @classmethod
    def empty_context_is_none(cls, value: str | None) -> str | None:
        return value or None


class FinancialMetrics(BaseModel):
    net_cash_flow: float
    investable_surplus: float
    savings_ratio: float | None
    expense_ratio: float | None
    debt_service_ratio: float | None
    debt_to_asset_ratio: float | None
    solvency_ratio: float | None
    liquidity_ratio: float | None
    emergency_fund_coverage_months: float | None
    net_worth: float
    estimated_monthly_investment_capacity: float
    # Compatibility aliases retained for Phase 1 clients.
    expense_to_income_ratio: float | None
    debt_to_income_ratio: float | None
    savings_rate: float | None


class RatioDetail(BaseModel):
    key: str
    display_name: str
    value: float | None
    unit: Literal["percentage", "months"]
    formula_description: str
    interpretation: str
    reference_range_used: str
    disclaimer: str


class ScoreComponent(BaseModel):
    name: str
    score: float
    max_score: float
    explanation: str


class ModelFeatures(BaseModel):
    savings_ratio: float | None
    expense_ratio: float | None
    debt_service_ratio: float | None
    debt_to_asset_ratio: float | None
    solvency_ratio: float | None
    liquidity_months: float | None
    emergency_fund_months: float | None
    income_stability: float
    dependents: float
    investment_horizon_years: float
    volatility_comfort: float
    investment_experience: float


class MLPersona(BaseModel):
    available: bool
    model_name: str
    model_version: str | None
    persona: str | None
    cluster_id: int | None
    similarity_score: float | None = Field(default=None, ge=0, le=1)
    key_characteristics: list[str]
    limitations: list[str]


class ComparativeStrategy(BaseModel):
    name: Literal["Safety First", "Balanced Progress", "Growth Focused"]
    summary: str
    reserve_priority: str
    debt_priority: str
    investable_amount: float
    risk_level: Literal["Low", "Moderate", "High"]
    advantages: list[str]
    trade_offs: list[str]
    suitability_conditions: list[str]


class FinancialProfileResponse(BaseModel):
    profile: FinancialProfileRequest
    metrics: FinancialMetrics
    ratios: list[RatioDetail]
    financial_health_score: int = Field(ge=0, le=100)
    score_name: Literal["FinSync Adaptive Health Score — a proprietary educational indicator."]
    health_label: Literal["Needs Attention", "Developing", "Healthy", "Strong"]
    score_explanations: list[ScoreComponent]
    model_features: ModelFeatures
    ml_persona: MLPersona
    comparative_strategies: list[ComparativeStrategy]
    positive_factors: list[str]
    risk_factors: list[str]
    suggested_next_actions: list[str]
    warnings: list[str]
