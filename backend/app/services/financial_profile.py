from app.schemas.profile import (
    ComparativeStrategy,
    FinancialMetrics,
    FinancialProfileRequest,
    FinancialProfileResponse,
    ModelFeatures,
    RatioDetail,
    ScoreComponent,
)
from app.ml.inference import predict_persona

RATIO_DISCLAIMER = "Reference ranges are general educational guidelines and may vary by household, goal, location, and professional methodology."


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _rounded(value: float | None, digits: int = 4) -> float | None:
    return round(value, digits) if value is not None else None


def _normalized(value: float | None, scale: float = 1) -> float | None:
    """Map a numerical feature to 0..1 while preserving unavailable as null."""
    return round(_clamp(value / scale, 0, 1), 4) if value is not None else None


def _component(name: str, score: float, maximum: float, explanation: str) -> ScoreComponent:
    return ScoreComponent(name=name, score=round(_clamp(score, 0, maximum), 1), max_score=maximum, explanation=explanation)


def _ratio(key: str, name: str, value: float | None, unit: str, formula: str, interpretation: str, reference: str) -> RatioDetail:
    return RatioDetail(key=key, display_name=name, value=_rounded(value), unit=unit, formula_description=formula, interpretation=interpretation, reference_range_used=reference, disclaimer=RATIO_DISCLAIMER)


def _percentage_interpretation(value: float | None, low: float, high: float, lower_is_better: bool) -> str:
    if value is None:
        return "Unavailable because the formula denominator is zero."
    if lower_is_better:
        return "Within the general reference range." if value <= high else "Above the general reference range; review the underlying outflow or liability."
    return "Within or above the general reference range." if value >= low else "Below the general reference range; gradual improvement may strengthen resilience."


def _build_strategies(capacity: float, coverage: float | None, debt_service: float | None, net_worth: float) -> list[ComparativeStrategy]:
    reserve_gap = coverage is not None and coverage < 6
    high_debt = debt_service is not None and debt_service > 0.30
    amounts = (capacity * (0.25 if reserve_gap else 0.50), capacity * 0.65, capacity * 0.90)
    reserve_text = "Direct most available cash toward a six-month reserve before investing." if reserve_gap else "Maintain the funded reserve and replenish it after use."
    debt_text = "Prioritize reducing debt-service pressure before increasing investing." if high_debt else "Continue scheduled payments; review expensive debt before adding risk."
    return [
        ComparativeStrategy(name="Safety First", summary="Emphasizes liquidity and balance-sheet resilience before market exposure.", reserve_priority=reserve_text, debt_priority=debt_text, investable_amount=round(amounts[0], 2), risk_level="Low", advantages=["Preserves more monthly cash for shocks.", "Supports reserve and debt progress."], trade_offs=["Allocates less to long-term investing now.", "May build wealth more slowly if conditions remain stable."], suitability_conditions=["Emergency coverage is below six months." if reserve_gap else "Maintaining a strong reserve is the primary preference.", "Income is variable or near-term spending is expected."]),
        ComparativeStrategy(name="Balanced Progress", summary="Splits available capacity across resilience, debt management, and long-term investing.", reserve_priority=reserve_text, debt_priority=debt_text, investable_amount=round(amounts[1], 2), risk_level="Moderate", advantages=["Balances near-term protection with long-term participation.", "Leaves part of capacity available for other priorities."], trade_offs=["Builds reserves more slowly than Safety First.", "Accepts moderate market and cash-flow risk."], suitability_conditions=["Monthly net cash flow is positive.", "Debt payments and reserve contributions remain affordable."]),
        ComparativeStrategy(name="Growth Focused", summary="Uses more estimated capacity for long-term investing while retaining a smaller buffer.", reserve_priority="Keep reserve contributions active; do not use emergency funds for investing.", debt_priority="Use only after high-cost debt and required payments are addressed." if high_debt else debt_text, investable_amount=round(amounts[2], 2), risk_level="High", advantages=["Directs more current surplus toward long-term goals.", "May suit a longer horizon and higher volatility comfort."], trade_offs=["Leaves less flexibility for unexpected expenses.", "Carries greater market and cash-flow risk without guaranteed outcomes."], suitability_conditions=["Emergency reserves are adequate." if not reserve_gap else "Use only after closing the emergency-reserve gap.", "Income is stable, horizon is long, and volatility is acceptable.", "Net worth is positive." if net_worth >= 0 else "Use only after liabilities no longer exceed assets."]),
    ]


def analyze_financial_profile(profile: FinancialProfileRequest) -> FinancialProfileResponse:
    """Calculate recognized household ratios and an explainable proprietary score."""
    income = profile.monthly_income
    essential = profile.monthly_essential_expenses
    obligations = profile.monthly_financial_obligations
    assets = profile.total_assets
    liabilities = profile.total_liabilities
    net_cash_flow = income - essential - obligations
    net_worth = assets - liabilities

    savings_ratio = net_cash_flow / income if income > 0 else None
    expense_ratio = essential / income if income > 0 else None
    debt_service_ratio = profile.monthly_debt_payments / income if income > 0 else None
    debt_to_asset = liabilities / assets if assets > 0 else None
    solvency = net_worth / assets if assets > 0 else None
    liquidity = profile.liquid_assets / essential if essential > 0 else None
    emergency_coverage = profile.emergency_fund / essential if essential > 0 else None

    if emergency_coverage is None or emergency_coverage >= 6:
        reserve_multiplier = 0.85
    elif emergency_coverage >= 3:
        reserve_multiplier = 0.70
    else:
        reserve_multiplier = 0.50
    debt_multiplier = 0.70 if debt_service_ratio is not None and debt_service_ratio > 0.30 else 1.0
    capacity = max(0.0, net_cash_flow) * reserve_multiplier * debt_multiplier

    ratios = [
        _ratio("savings_ratio", "Savings ratio", savings_ratio, "percentage", "Net cash flow ÷ monthly income", _percentage_interpretation(savings_ratio, 0.20, 0.20, False), "20% or more"),
        _ratio("expense_ratio", "Expense ratio", expense_ratio, "percentage", "Monthly essential expenses ÷ monthly income", _percentage_interpretation(expense_ratio, 0, 0.50, True), "50% or less"),
        _ratio("debt_service_ratio", "Debt-service ratio", debt_service_ratio, "percentage", "Monthly debt payments ÷ monthly income", _percentage_interpretation(debt_service_ratio, 0, 0.30, True), "30% or less; 20% or less earns full score points"),
        _ratio("debt_to_asset_ratio", "Debt-to-asset ratio", debt_to_asset, "percentage", "Total liabilities ÷ total assets", _percentage_interpretation(debt_to_asset, 0, 0.50, True), "50% or less"),
        _ratio("solvency_ratio", "Solvency ratio", solvency, "percentage", "Net worth ÷ total assets", _percentage_interpretation(solvency, 0.50, 1, False), "50% or more"),
        _ratio("liquidity_ratio", "Liquidity ratio", liquidity, "months", "Liquid assets ÷ monthly essential expenses", "Unavailable because essential expenses are zero." if liquidity is None else ("Meets the six-month general liquidity guideline." if liquidity >= 6 else "Below the six-month general liquidity guideline."), "6 months or more"),
        _ratio("emergency_fund_coverage", "Emergency-fund coverage", emergency_coverage, "months", "Emergency fund ÷ monthly essential expenses", "Unavailable because essential expenses are zero." if emergency_coverage is None else ("Meets the six-month general reserve guideline." if emergency_coverage >= 6 else "Below the six-month general reserve guideline."), "3–6 months; six months earns full score points"),
    ]

    # The seven components below total 100 points. Every component names its
    # source ratio or reported input and its exact linear threshold.
    savings_score = 25 * _clamp((savings_ratio or 0) / 0.20, 0, 1)
    expense_score = 15 * _clamp((1 - (expense_ratio or 1)) / 0.50, 0, 1) if expense_ratio is not None else 0
    if debt_service_ratio is None:
        debt_score = 0
    elif debt_service_ratio <= 0.20:
        debt_score = 15
    else:
        debt_score = 15 * _clamp((0.50 - debt_service_ratio) / 0.30, 0, 1)
    solvency_score = 15 * _clamp((solvency or 0) / 0.50, 0, 1)
    liquidity_score = 5 * _clamp((liquidity or 0) / 6, 0, 1) + 10 * _clamp((emergency_coverage or 0) / 6, 0, 1)
    stability_score = profile.income_stability * 2
    horizon_rating = _clamp(profile.investment_horizon_years / 2, 1, 5)
    readiness_score = (profile.investment_experience + profile.volatility_comfort + horizon_rating) / 3
    components = [
        _component("Savings ratio", savings_score, 25, "Net cash flow ÷ income; scales linearly to full points at 20%. Zero income earns zero points."),
        _component("Expense ratio", expense_score, 15, "Essential expenses ÷ income; full points at 50% or less, declining linearly to zero at 100%."),
        _component("Debt-service ratio", debt_score, 15, "Monthly debt payments ÷ income; full points through 20%, declining linearly to zero at 50%."),
        _component("Solvency ratio", solvency_score, 15, "Net worth ÷ assets; scales linearly to full points at 50%. Zero assets earn zero points."),
        _component("Liquidity and emergency coverage", liquidity_score, 15, "Liquid-asset months provide 5 points and emergency-fund months provide 10; each reaches full points at six months."),
        _component("Income stability", stability_score, 10, "Reported 1–5 stability contributes exactly two points per level."),
        _component("Investing readiness", readiness_score, 5, "Average of 1–5 experience, 1–5 volatility comfort, and horizon readiness capped at five."),
    ]
    total_score = int(round(_clamp(sum(item.score for item in components), 0, 100)))
    label = "Needs Attention" if total_score < 40 else "Developing" if total_score < 60 else "Healthy" if total_score < 80 else "Strong"

    positives: list[str] = []
    risks: list[str] = []
    actions: list[str] = []
    warnings: list[str] = []
    if net_cash_flow > 0: positives.append("Monthly income exceeds essential expenses and financial obligations.")
    else: risks.append("Monthly outgo is equal to or greater than income."); actions.append("Review essential spending and obligations to restore positive net cash flow.")
    if savings_ratio is not None and savings_ratio >= 0.20: positives.append("The savings ratio meets the 20% educational reference point.")
    elif income > 0: risks.append("The savings ratio is below 20%."); actions.append("Work toward a 20% savings ratio in manageable steps.")
    if emergency_coverage is not None and emergency_coverage >= 6: positives.append("The emergency reserve covers at least six months of essentials.")
    elif emergency_coverage is not None: risks.append("Emergency-fund coverage is below six months."); actions.append("Build emergency coverage toward three to six months of essentials.")
    if debt_service_ratio is not None and debt_service_ratio > 0.30: risks.append("The debt-service ratio exceeds the 30% educational guideline."); actions.append("Review debt payments before increasing investment contributions.")
    elif debt_service_ratio is not None and debt_service_ratio <= 0.20: positives.append("The debt-service ratio is at or below 20%.")
    if net_worth < 0: risks.append("Total liabilities exceed total assets, producing negative net worth."); actions.append("Prioritize a plan to reduce liabilities and rebuild positive net worth.")
    else: positives.append("Reported assets equal or exceed total liabilities.")
    if profile.income_stability >= 4: positives.append("Reported income stability supports consistent planning.")
    elif profile.income_stability <= 2: risks.append("Reported income stability is low."); actions.append("Maintain a larger liquid buffer for income variability.")
    if capacity > 0: actions.append("Compare the three educational allocation scenarios before choosing a monthly amount.")
    if income == 0: warnings.append("Income-based ratios are null because monthly income is zero; those score components receive zero points.")
    if assets == 0: warnings.append("Debt-to-asset and solvency ratios are null because total assets are zero; the solvency score component receives zero points.")
    if essential == 0: warnings.append("Liquidity and emergency-fund coverage are null because essential expenses are zero; those score inputs receive zero points.")
    if net_cash_flow < 0: warnings.append("Reported monthly expenses and obligations exceed income; investment capacity is set to zero.")
    if profile.liquid_assets > assets: warnings.append("Liquid assets exceed total assets; verify that total assets include all liquid holdings.")
    if profile.monthly_debt_payments > obligations: warnings.append("Monthly debt payments exceed broader financial obligations; verify that obligations include debt payments.")
    if profile.outstanding_debt != liabilities: warnings.append("Outstanding debt and total liabilities differ; total liabilities are used for balance-sheet ratios.")

    model_features = ModelFeatures(savings_ratio=_normalized(savings_ratio), expense_ratio=_normalized(expense_ratio), debt_service_ratio=_normalized(debt_service_ratio), debt_to_asset_ratio=_normalized(debt_to_asset), solvency_ratio=_normalized(solvency), liquidity_months=_normalized(liquidity, 12), emergency_fund_months=_normalized(emergency_coverage, 12), income_stability=profile.income_stability / 5, dependents=profile.dependents / 20, investment_horizon_years=profile.investment_horizon_years / 60, volatility_comfort=profile.volatility_comfort / 5, investment_experience=profile.investment_experience / 5)

    return FinancialProfileResponse(
        profile=profile,
        metrics=FinancialMetrics(net_cash_flow=round(net_cash_flow, 2), investable_surplus=round(net_cash_flow, 2), savings_ratio=_rounded(savings_ratio), expense_ratio=_rounded(expense_ratio), debt_service_ratio=_rounded(debt_service_ratio), debt_to_asset_ratio=_rounded(debt_to_asset), solvency_ratio=_rounded(solvency), liquidity_ratio=_rounded(liquidity, 2), emergency_fund_coverage_months=_rounded(emergency_coverage, 2), net_worth=round(net_worth, 2), estimated_monthly_investment_capacity=round(capacity, 2), expense_to_income_ratio=_rounded(expense_ratio), debt_to_income_ratio=_rounded(debt_service_ratio), savings_rate=_rounded(savings_ratio)),
        ratios=ratios,
        financial_health_score=total_score,
        score_name="FinSync Adaptive Health Score — a proprietary educational indicator.",
        health_label=label,
        score_explanations=components,
        model_features=model_features,
        ml_persona=predict_persona(model_features),
        comparative_strategies=_build_strategies(capacity, emergency_coverage, debt_service_ratio, net_worth),
        positive_factors=positives, risk_factors=risks, suggested_next_actions=list(dict.fromkeys(actions)), warnings=warnings,
    )
