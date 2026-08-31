import pandas as pd
import numpy as np
import os
from risk_label_rules import assign_risk_label

def generate_synthetic_data(num_samples=10000, seed=42):
    np.random.seed(seed)
    
    profiles = []
    
    for _ in range(num_samples):
        # Generate raw basic inputs
        monthly_income = np.random.lognormal(mean=np.log(80000), sigma=0.6)
        monthly_income = max(10000, round(monthly_income, -2))
        
        essential_expenses = monthly_income * np.random.uniform(0.3, 0.8)
        discretionary_expenses = monthly_income * np.random.uniform(0.05, 0.3)
        monthly_debt_payment = monthly_income * np.random.uniform(0.0, 0.5)
        
        # Ensure expenses don't exceed a realistic ceiling relative to income (though some debt spiral can happen)
        total_out = essential_expenses + discretionary_expenses + monthly_debt_payment
        if total_out > monthly_income * 1.5:
            # Scale down
            scale = (monthly_income * 1.5) / total_out
            essential_expenses *= scale
            discretionary_expenses *= scale
            monthly_debt_payment *= scale
            
        monthly_surplus = monthly_income - (essential_expenses + discretionary_expenses + monthly_debt_payment)
        
        # Debt and Assets
        total_debt = monthly_debt_payment * np.random.uniform(12, 360) if monthly_debt_payment > 0 else 0
        
        liquid_savings = np.random.lognormal(mean=np.log(monthly_income * 2), sigma=1.0)
        liquid_savings = round(max(0, liquid_savings), -2)
        
        investment_assets = np.random.lognormal(mean=np.log(monthly_income * 10), sigma=1.5)
        investment_assets = round(max(0, investment_assets), -2)
        
        total_assets = liquid_savings + investment_assets
        
        # Derived ratios
        emergency_fund_months = liquid_savings / max(1, essential_expenses + monthly_debt_payment)
        dti_ratio = monthly_debt_payment / max(1, monthly_income)
        debt_to_asset_ratio = total_debt / max(1, total_assets)
        
        # Asset Allocation percentages (if assets exist)
        if total_assets > 0:
            # We want somewhat realistic allocations depending on if they have investments
            cash_p = liquid_savings / total_assets
            rem = 1.0 - cash_p
            if rem > 0:
                fd_p = rem * np.random.uniform(0.0, 0.5)
                debt_p = rem * np.random.uniform(0.0, 0.3)
                gold_p = rem * np.random.uniform(0.0, 0.2)
                # Remainder goes to equity/mutual funds
                eq_mf_rem = rem - (fd_p + debt_p + gold_p)
                mf_p = eq_mf_rem * np.random.uniform(0.2, 0.8)
                eq_p = eq_mf_rem - mf_p
            else:
                fd_p, debt_p, mutual_fund_p, equity_p, gold_p = 0, 0, 0, 0, 0
                mf_p, eq_p = 0, 0
        else:
            cash_p, fd_p, debt_p, mf_p, eq_p, gold_p = 0, 0, 0, 0, 0, 0
            
        # Goals
        goal_count = np.random.randint(0, 6)
        high_priority_goals = np.random.randint(0, goal_count + 1) if goal_count > 0 else 0
        avg_goal_horizon_months = np.random.uniform(12, 360) if goal_count > 0 else 0
        avg_goal_funding_gap = np.random.uniform(0, 5000000) if goal_count > 0 else 0
        avg_goal_prob = np.random.uniform(0, 100) if goal_count > 0 else 0
        
        profile = {
            "monthly_income": monthly_income,
            "essential_expenses": essential_expenses,
            "discretionary_expenses": discretionary_expenses,
            "monthly_debt_payment": monthly_debt_payment,
            "total_debt": total_debt,
            "total_assets": total_assets,
            "liquid_savings": liquid_savings,
            "emergency_fund_months": emergency_fund_months,
            "investment_assets": investment_assets,
            "cash_percentage": cash_p * 100,
            "fd_percentage": fd_p * 100,
            "debt_percentage": debt_p * 100,
            "mutual_fund_percentage": mf_p * 100,
            "equity_percentage": eq_p * 100,
            "gold_percentage": gold_p * 100,
            "monthly_surplus": monthly_surplus,
            "debt_to_income_ratio": dti_ratio,
            "debt_to_asset_ratio": debt_to_asset_ratio,
            "goal_count": goal_count,
            "high_priority_goals": high_priority_goals,
            "average_goal_horizon_months": avg_goal_horizon_months,
            "average_goal_funding_gap": avg_goal_funding_gap,
            "average_goal_probability": avg_goal_prob
        }
        
        profile["risk_category"] = assign_risk_label(profile, noise_std=6.0)
        profiles.append(profile)
        
    df = pd.DataFrame(profiles)
    
    # Save to CSV
    os.makedirs("../data", exist_ok=True)
    df.to_csv("../data/financial_risk_dataset.csv", index=False)
    print(f"Generated {num_samples} profiles and saved to data/financial_risk_dataset.csv")
    print("\nClass distribution:")
    print(df['risk_category'].value_counts(normalize=True) * 100)
    
if __name__ == "__main__":
    generate_synthetic_data()
