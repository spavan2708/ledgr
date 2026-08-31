import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

def train():
    np.random.seed(42)
    
    print("Loading dataset...")
    df = pd.read_csv("../data/financial_risk_dataset.csv")
    
    X = df.drop("risk_category", axis=1)
    y = df["risk_category"]
    
    feature_names = X.columns.tolist()
    class_names = sorted(y.unique().tolist())
    
    print("Splitting dataset into 80% train, 10% validation, 10% test...")
    # First split: 80% train, 20% temp
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # Second split: 10% val, 10% test
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42
    )
    
    print(f"Train size: {len(X_train)}")
    print(f"Validation size: {len(X_val)}")
    print(f"Test size: {len(X_test)}")
    
    # Preprocessing
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. Logistic Regression Baseline
    print("\nTraining Logistic Regression baseline...")
    lr_model = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    lr_model.fit(X_train_scaled, y_train)
    
    # 2. Random Forest
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced"
    )
    rf_model.fit(X_train, y_train)
    
    # Save models and scaler
    os.makedirs("../models", exist_ok=True)
    joblib.dump(lr_model, "../models/lr_baseline.pkl")
    joblib.dump(rf_model, "../models/risk_classifier.pkl")
    joblib.dump(scaler, "../models/scaler.pkl")
    
    # Save splits for evaluation step
    os.makedirs("../data/splits", exist_ok=True)
    pd.concat([X_train, y_train], axis=1).to_csv("../data/splits/train.csv", index=False)
    pd.concat([X_val, y_val], axis=1).to_csv("../data/splits/val.csv", index=False)
    pd.concat([X_test, y_test], axis=1).to_csv("../data/splits/test.csv", index=False)
    
    # Metadata
    metadata = {
        "model_name": "RandomForestClassifier",
        "model_version": "risk_classifier_v1",
        "training_dataset_size": len(X_train),
        "feature_names": feature_names,
        "class_names": class_names,
        "random_seed": 42,
        "training_date": datetime.now().isoformat()
    }
    
    with open("../models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Training complete. Models and metadata saved to /models.")

if __name__ == "__main__":
    train()
