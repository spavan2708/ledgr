# FinSync Educational ML Risk Classifier

This module contains a purely educational machine learning pipeline to classify simulated financial profiles into three risk categories: Conservative, Balanced, and Aggressive.

**IMPORTANT FINANCIAL SAFETY WARNING:**
This is an educational financial simulation, NOT a real financial advisory system. This model does not determine a person's true financial risk and does not guarantee investment outcomes. The categories output by this model represent a "simulated risk profile" for educational classification only.

## Setup
Ensure you have Python 3 installed.
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## 1. Create the Dataset
To generate 10,000 synthetic profiles with rule-based labels:
```bash
cd src
python generate_dataset.py
```
Outputs: `data/financial_risk_dataset.csv`

## 2. Validate the Dataset
To check for impossible values, negative constraints, and data leakage:
```bash
python validate_dataset.py
```

## 3. Train the Model
To split the dataset (80/10/10) and train the Logistic Regression and Random Forest models:
```bash
python train_model.py
```
Outputs models and `metadata.json` in `models/`.

## 4. Evaluate the Model
To calculate macro F1, test accuracy, overfitting metrics, and generate charts:
```bash
python evaluate_model.py
```
Outputs: `outputs/feature_importance.png`, `outputs/confusion_matrix.png`

## 5. Run Manual Tests
To test the manual CSV cases and view probabilities:
```bash
python test_manual_cases.py
```

## 6. Make a Prediction for a New Profile
Import and use `predict.py` in your backend:
```python
from src.predict import RiskPredictor

predictor = RiskPredictor(model_dir="models")
profile_dict = { "monthly_income": 80000, ... }
result = predictor.predict(profile_dict)
print(result)
```
