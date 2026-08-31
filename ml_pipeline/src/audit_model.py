import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import make_scorer, precision_score, recall_score, f1_score, accuracy_score
import joblib

# Add local path for importing rules
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from risk_label_rules import assign_risk_label
from predict import RiskPredictor

def run_audit():
    print("="*50)
    print("ML PIPELINE AUDIT SCRIPT")
    print("="*50)

    df = pd.read_csv("../data/financial_risk_dataset.csv")
    X = df.drop("risk_category", axis=1)
    y = df["risk_category"]

    # 1. Leakage Check (Correlation)
    print("\n1. CORRELATION WITH TARGET (Encoded)")
    y_enc = y.map({'Conservative': 0, 'Balanced': 1, 'Aggressive': 2})
    corr = X.apply(lambda col: col.corr(y_enc)).sort_values(key=abs, ascending=False)
    print(corr.head(10))

    # 3. Train/Test Split Leakage Check
    train_df = pd.read_csv("../data/splits/train.csv")
    test_df = pd.read_csv("../data/splits/test.csv")
    # Check if any row in test exactly matches a row in train
    merged = pd.merge(train_df.drop('risk_category', axis=1), test_df.drop('risk_category', axis=1), how='inner')
    print(f"\n3. Exact Duplicate Rows between Train and Test: {len(merged)}")

    # 4. Cross-Validation
    print("\n4. CROSS-VALIDATION (5-Fold Stratified)")
    rf = RandomForestClassifier(n_estimators=300, random_state=42, class_weight="balanced")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    scoring = {
        'accuracy': 'accuracy',
        'macro_f1': make_scorer(f1_score, average='macro'),
        'prec_cons': make_scorer(precision_score, labels=['Conservative'], average=None),
        'rec_cons': make_scorer(recall_score, labels=['Conservative'], average=None),
        'prec_bal': make_scorer(precision_score, labels=['Balanced'], average=None),
        'rec_bal': make_scorer(recall_score, labels=['Balanced'], average=None),
        'prec_agg': make_scorer(precision_score, labels=['Aggressive'], average=None),
        'rec_agg': make_scorer(recall_score, labels=['Aggressive'], average=None),
    }
    
    scores = cross_validate(rf, X, y, cv=cv, scoring=scoring, n_jobs=-1)
    print(f"Mean Accuracy: {np.mean(scores['test_accuracy']):.4f} ± {np.std(scores['test_accuracy']):.4f}")
    print(f"Mean Macro F1: {np.mean(scores['test_macro_f1']):.4f} ± {np.std(scores['test_macro_f1']):.4f}")
    
    for cls in ['cons', 'bal', 'agg']:
        print(f"{cls.upper()} - Precision: {np.mean(scores['test_prec_'+cls]):.4f}, Recall: {np.mean(scores['test_rec_'+cls]):.4f}")

    # 5. Random-Seed Stability
    print("\n5. RANDOM-SEED STABILITY")
    seeds = [10, 42, 123, 999, 2026]
    accs, f1s = [], []
    for s in seeds:
        Xs_train, Xs_test, ys_train, ys_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=s)
        rf_s = RandomForestClassifier(n_estimators=300, random_state=s, class_weight="balanced", n_jobs=-1)
        rf_s.fit(Xs_train, ys_train)
        preds = rf_s.predict(Xs_test)
        accs.append(accuracy_score(ys_test, preds))
        f1s.append(f1_score(ys_test, preds, average='macro'))
        
    print(f"Accuracy across seeds: {np.mean(accs):.4f} ± {np.std(accs):.4f} ({accs})")
    print(f"Macro F1 across seeds: {np.mean(f1s):.4f} ± {np.std(f1s):.4f} ({f1s})")

    # 7. Manual Test Cases vs Rule System
    print("\n7. MANUAL TEST CASES ANALYSIS")
    manual_df = pd.read_csv("../data/test_cases.csv")
    predictor = RiskPredictor(model_dir="../models")
    
    for _, row in manual_df.iterrows():
        case_name = row["case_name"]
        expected = row["expected_category"]
        features = row.drop(["case_name", "expected_category"]).to_dict()
        
        # Calculate what the rule engine says for this exact case (noise_std=0 to be deterministic)
        rule_label = assign_risk_label(features, noise_std=0.0)
        
        # ML prediction
        ml_res = predictor.predict(features)
        predicted = ml_res["risk_category"]
        probs = ml_res["probabilities"]
        
        if predicted != expected:
            print(f"\n[INCORRECT CASE] {case_name}")
            print(f"  Expected Human Label: {expected}")
            print(f"  Rule-Generated Label: {rule_label}")
            print(f"  ML Prediction: {predicted}")
            print(f"  Probabilities: {probs}")
            
    # 9. Probability output checks
    print("\n9. PROBABILITY OUTPUT CHECK (on Test Set)")
    test_X = test_df.drop("risk_category", axis=1)
    rf_main = joblib.load("../models/risk_classifier.pkl")
    probs = rf_main.predict_proba(test_X)
    sums = np.sum(probs, axis=1)
    print(f"Probabilities sum strictly to 1.0? Min sum: {sums.min():.6f}, Max sum: {sums.max():.6f}")
    
    max_probs = np.max(probs, axis=1)
    highly_conf = test_X[max_probs >= 0.85].head(1)
    mod_conf = test_X[(max_probs >= 0.5) & (max_probs < 0.6)].head(1)
    uncert = test_X[max_probs < 0.45].head(1)
    
    if len(highly_conf):
        print(f"Highly Confident example prob: {rf_main.predict_proba(highly_conf)[0]}")
    if len(mod_conf):
        print(f"Moderately Confident example prob: {rf_main.predict_proba(mod_conf)[0]}")
    if len(uncert):
        print(f"Uncertain example prob: {rf_main.predict_proba(uncert)[0]}")

    # 10. Model Complexity Check
    print("\n10. MODEL COMPLEXITY CHECK (100 vs 300 estimators)")
    rf_100 = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced", n_jobs=-1)
    rf_100.fit(Xs_train, ys_train)
    p100 = rf_100.predict(Xs_test)
    print(f"Accuracy with 100 estimators: {accuracy_score(ys_test, p100):.4f}")
    print(f"Accuracy with 300 estimators: {accs[-1]:.4f}")

if __name__ == "__main__":
    run_audit()
