import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, DebtAnalysis } from "@/types/financial-plan";

export function analyzeDebt(profile: FinancialProfile, calc: FinancialCalculations): DebtAnalysis {
  const cf = profile.cash_flow;
  
  const debtPaymentRatio = calc.totalMonthlyIncome > 0 
    ? (cf.monthly_debt_payments / calc.totalMonthlyIncome) * 100 
    : 0;
    
  const debtToAssetRatio = calc.totalFinancialAssets > 0 
    ? (calc.totalLiabilities / calc.totalFinancialAssets) * 100 
    : (calc.totalLiabilities > 0 ? 100 : 0);
    
  let warning = null;
  if (debtPaymentRatio > 40) {
    warning = "Your monthly debt payments are high relative to your income. Focus on debt reduction before increasing investments.";
  } else if (debtPaymentRatio > 30) {
    warning = "Your debt payments consume a significant portion of your income. Consider reviewing your loan commitments.";
  }
  
  return {
    debtPaymentRatio,
    debtToAssetRatio,
    warning
  };
}