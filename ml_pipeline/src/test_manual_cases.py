import pandas as pd
import joblib

def test_manual():
    # Load model
    rf_model = joblib.load("../models/risk_classifier.pkl")
    
    # Load cases
    df = pd.read_csv("../data/test_cases.csv")
    
    print("=" * 60)
    print("MANUAL TEST CASES REPORT")
    print("=" * 60)
    
    correct = 0
    total = len(df)
    
    for _, row in df.iterrows():
        case_name = row["case_name"]
        expected = row["expected_category"]
        
        # Features only
        features = row.drop(["case_name", "expected_category"]).to_frame().T
        
        # Predict
        predicted = rf_model.predict(features)[0]
        probs = rf_model.predict_proba(features)[0]
        classes = rf_model.classes_
        
        prob_dict = {classes[i]: probs[i] for i in range(len(classes))}
        
        is_correct = "PASS" if predicted == expected else "FAIL"
        if predicted == expected:
            correct += 1
            
        print(f"\nCase: {case_name}")
        print(f"Expected: {expected}")
        print(f"Predicted: {predicted}")
        for cls in ["Conservative", "Balanced", "Aggressive"]:
            if cls in prob_dict:
                print(f"{cls} probability: {prob_dict[cls]:.2f}")
        print(f"Result: {is_correct}")
        
    print("\n" + "=" * 60)
    print(f"Summary: {correct}/{total} cases correct ({(correct/total)*100:.1f}%)")
    
if __name__ == "__main__":
    test_manual()
