import pandas as pd
import numpy as np
import os
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

def evaluate():
    os.makedirs("../outputs", exist_ok=True)
    
    # Load splits
    train_df = pd.read_csv("../data/splits/train.csv")
    val_df = pd.read_csv("../data/splits/val.csv")
    test_df = pd.read_csv("../data/splits/test.csv")
    
    X_train = train_df.drop("risk_category", axis=1)
    y_train = train_df["risk_category"]
    
    X_val = val_df.drop("risk_category", axis=1)
    y_val = val_df["risk_category"]
    
    X_test = test_df.drop("risk_category", axis=1)
    y_test = test_df["risk_category"]
    
    # Load models
    lr_model = joblib.load("../models/lr_baseline.pkl")
    rf_model = joblib.load("../models/risk_classifier.pkl")
    scaler = joblib.load("../models/scaler.pkl")
    
    X_train_scaled = scaler.transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    class_names = sorted(y_test.unique().tolist())
    
    print("=" * 50)
    print("MODEL EVALUATION")
    print("=" * 50)
    
    # Evaluate Logistic Regression
    y_test_pred_lr = lr_model.predict(X_test_scaled)
    lr_test_acc = accuracy_score(y_test, y_test_pred_lr)
    
    # Evaluate Random Forest
    y_train_pred_rf = rf_model.predict(X_train)
    y_val_pred_rf = rf_model.predict(X_val)
    y_test_pred_rf = rf_model.predict(X_test)
    
    rf_train_acc = accuracy_score(y_train, y_train_pred_rf)
    rf_val_acc = accuracy_score(y_val, y_val_pred_rf)
    rf_test_acc = accuracy_score(y_test, y_test_pred_rf)
    
    rf_macro_prec = precision_score(y_test, y_test_pred_rf, average='macro')
    rf_macro_rec = recall_score(y_test, y_test_pred_rf, average='macro')
    rf_macro_f1 = f1_score(y_test, y_test_pred_rf, average='macro')
    
    print("\nOVERFITTING CHECK (Random Forest):")
    print(f"Training Accuracy:   {rf_train_acc * 100:.2f}%")
    print(f"Validation Accuracy: {rf_val_acc * 100:.2f}%")
    print(f"Test Accuracy:       {rf_test_acc * 100:.2f}%")
    
    diff = rf_train_acc - rf_test_acc
    if diff > 0.10:
        print(f"WARNING: Potential overfitting detected. Train accuracy is {diff * 100:.1f}% higher than test accuracy.")
    else:
        print("Model generalizes well. No severe overfitting detected.")
        
    print("\n" + "=" * 50)
    print("PERFORMANCE COMPARISON")
    
    print(f"\nModel: Logistic Regression (Baseline)")
    print(f"Test Accuracy:       {lr_test_acc * 100:.2f}%")
    
    print(f"\nModel: Random Forest")
    print(f"Accuracy:        {rf_test_acc * 100:.2f}%")
    print(f"Macro Precision: {rf_macro_prec * 100:.2f}%")
    print(f"Macro Recall:    {rf_macro_rec * 100:.2f}%")
    print(f"Macro F1:        {rf_macro_f1 * 100:.2f}%")
    
    print("\nClassification Report (Random Forest):")
    print(classification_report(y_test, y_test_pred_rf))
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_test_pred_rf, labels=class_names)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix - Random Forest')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig("../outputs/confusion_matrix.png")
    plt.close()
    
    # Feature Importance
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    features = X_train.columns
    
    print("\nTop 10 Most Influential Features:")
    for i in range(min(10, len(features))):
        print(f"{i+1}. {features[indices[i]]} ({importances[indices[i]]:.4f})")
        
    plt.figure(figsize=(10, 8))
    sns.barplot(x=importances[indices][:15], y=features[indices][:15])
    plt.title('Top 15 Feature Importances - Random Forest')
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig("../outputs/feature_importance.png")
    plt.close()
    
    # Update metadata with test metrics
    with open("../models/metadata.json", "r") as f:
        metadata = json.load(f)
        
    metadata["test_accuracy"] = rf_test_acc
    metadata["macro_f1"] = rf_macro_f1
    
    with open("../models/metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("\nEvaluation complete. Plots saved to /outputs.")

if __name__ == "__main__":
    evaluate()
