import numpy as np

def assign_risk_label(profile, noise_std=5.0):
    """
    Transparent scoring framework to generate synthetic training labels.
    Calculates a risk capacity score and assigns a category.
    Higher score = Higher risk capacity = Aggressive.
    """
    score = 50.0  # Base score
    
    # 1. Emergency Fund (Capacity to handle shocks)
    ef_months = profile.get("emergency_fund_months", 0)
    if ef_months >= 6:
        score += 15
    elif ef_months >= 3:
        score += 5
    elif ef_months < 1.5:
        score -= 20
    else:
        score -= 10
        
    # 2. Debt Burden
    dti = profile.get("debt_to_income_ratio", 0)
    if dti < 0.1:
        score += 15
    elif dti < 0.25:
        score += 5
    elif dti > 0.5:
        score -= 20
    elif dti > 0.35:
        score -= 10
        
    # 3. Monthly Surplus (Cash flow strength)
    income = profile.get("monthly_income", 1)
    surplus = profile.get("monthly_surplus", 0)
    surplus_margin = surplus / max(1, income)
    
    if surplus_margin > 0.3:
        score += 15
    elif surplus_margin > 0.15:
        score += 5
    elif surplus_margin < 0.05:
        score -= 15
        
    # 4. Investment Horizon
    horizon = profile.get("average_goal_horizon_months", 60)
    if horizon >= 180:
        score += 20
    elif horizon >= 84:
        score += 10
    elif horizon < 36:
        score -= 15
        
    # 5. Goal Funding Pressure
    # If the gap is huge relative to income, risk capacity is actually lower (cannot afford to lose)
    gap = profile.get("average_goal_funding_gap", 0)
    gap_to_income = gap / max(1, income)
    if gap_to_income > 50: # Huge shortfall
        score -= 10
        
    # Add random noise to make the ML model learn generalizations rather than strict thresholds
    score += np.random.normal(0, noise_std)
    
    if score < 36:
        return "Conservative"
    elif score < 60:
        return "Balanced"
    else:
        return "Aggressive"
