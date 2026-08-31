import pandas as pd
import numpy as np

def validate_dataset(filepath="../data/financial_risk_dataset.csv"):
    df = pd.read_csv(filepath)
    
    print("=" * 50)
    print("DATASET VALIDATION REPORT")
    print("=" * 50)
    
    print(f"\nTotal Records: {len(df)}")
    print(f"Total Features: {len(df.columns) - 1}")
    
    # Missing values
    missing = df.isnull().sum().sum()
    print(f"Missing Values: {missing}")
    
    # Duplicate rows
    duplicates = df.duplicated().sum()
    print(f"Duplicate Rows: {duplicates}")
    
    # Negative values (excluding those that can legitimately be negative)
    num_cols = df.select_dtypes(include=[np.number]).columns
    cols_to_check = [c for c in num_cols if c != 'monthly_surplus']
    negative_counts = (df[cols_to_check] < 0).sum().sum()
    print(f"Invalid Negative Values: {negative_counts}")
    
    # Class distribution
    print("\nClass Distribution:")
    dist = df['risk_category'].value_counts(normalize=True) * 100
    for cls, val in dist.items():
        print(f"  {cls}: {val:.2f}%")
        
    # Impossible ratios or percentages
    print("\nSanity Checks:")
    
    # Asset percentages sum to ~100 or 0
    asset_cols = ['cash_percentage', 'fd_percentage', 'debt_percentage', 
                  'mutual_fund_percentage', 'equity_percentage', 'gold_percentage']
    asset_sums = df[asset_cols].sum(axis=1)
    # Check if sum is around 100 (for those with assets) or 0 (for those without)
    invalid_assets = ((asset_sums > 0.01) & (np.abs(asset_sums - 100) > 0.01)).sum()
    print(f"  Invalid Asset Percentages (don't sum to 100% or 0%): {invalid_assets}")
    
    # Monthly surplus consistency
    calculated_surplus = df['monthly_income'] - (df['essential_expenses'] + df['discretionary_expenses'] + df['monthly_debt_payment'])
    inconsistent_surplus = (np.abs(df['monthly_surplus'] - calculated_surplus) > 0.01).sum()
    print(f"  Inconsistent Monthly Surplus: {inconsistent_surplus}")
    
    # Correlations / Leakage
    print("\nFeature Correlations with Target (checking for leakage):")
    # Encode target to numeric just for simple correlation check
    df['target_encoded'] = df['risk_category'].map({'Conservative': 0, 'Balanced': 1, 'Aggressive': 2})
    corr = df.select_dtypes(include=[np.number]).corr()['target_encoded'].sort_values(key=abs, ascending=False)
    
    # Drop the target itself
    corr = corr.drop('target_encoded')
    for feat, cval in corr.head(5).items():
        print(f"  {feat}: {cval:.3f}")
        
    if corr.abs().max() > 0.95:
        print("\nWARNING: High correlation detected. Potential data leakage!")
    else:
        print("\nNo obvious data leakage detected (max correlation < 0.95).")
        
    print("=" * 50)

if __name__ == "__main__":
    validate_dataset()
