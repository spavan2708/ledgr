import joblib
import pandas as pd
import json

class RiskPredictor:
    def __init__(self, model_dir="../models"):
        self.model = joblib.load(f"{model_dir}/risk_classifier.pkl")
        with open(f"{model_dir}/metadata.json", "r") as f:
            self.metadata = json.load(f)
            
        self.feature_names = self.metadata["feature_names"]
        
    def predict(self, profile_dict):
        # Convert dictionary to DataFrame with single row to maintain feature order
        df = pd.DataFrame([profile_dict])
        
        # Ensure columns match training data
        df = df.reindex(columns=self.feature_names, fill_value=0)
        
        predicted_class = self.model.predict(df)[0]
        probs = self.model.predict_proba(df)[0]
        classes = self.model.classes_
        
        prob_dict = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}
        
        return {
            "risk_category": predicted_class,
            "probabilities": prob_dict,
            "model_version": self.metadata["model_version"]
        }

# Simple test if run directly
if __name__ == "__main__":
    test_profile = {
        "monthly_income": 80000,
        "essential_expenses": 40000,
        "discretionary_expenses": 15000,
        "monthly_debt_payment": 5000,
        "total_debt": 100000,
        "total_assets": 250000,
        "liquid_savings": 150000,
        "emergency_fund_months": 3.33,
        "investment_assets": 100000,
        "cash_percentage": 40,
        "fd_percentage": 20,
        "debt_percentage": 10,
        "mutual_fund_percentage": 20,
        "equity_percentage": 10,
        "gold_percentage": 0,
        "monthly_surplus": 20000,
        "debt_to_income_ratio": 0.06,
        "debt_to_asset_ratio": 0.4,
        "goal_count": 2,
        "high_priority_goals": 1,
        "average_goal_horizon_months": 84,
        "average_goal_funding_gap": 500000,
        "average_goal_probability": 60
    }
    predictor = RiskPredictor()
    result = predictor.predict(test_profile)
    print(json.dumps(result, indent=2))
