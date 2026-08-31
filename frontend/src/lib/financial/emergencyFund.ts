import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, EmergencyFundAnalysis } from "@/types/financial-plan";

export function analyzeEmergencyFund(profile: FinancialProfile, calc: FinancialCalculations): EmergencyFundAnalysis {
  const cf = profile.cash_flow;
  const monthlyObligations = calc.totalEssentialExpenses + cf.monthly_debt_payments;
  
  // Baseline is 6 months
  let targetMonths = 6;
  
  // Adjust based on income stability (1 to 5)
  // Highly variable (1) -> Needs more buffer (+3 months)
  // Very stable (5) -> Needs less buffer (-1 month)
  if (profile.risk.income_stability <= 2) targetMonths += 3;
  if (profile.risk.income_stability === 5) targetMonths -= 1;
  
  // Adjust based on dependents
  if (profile.personal.dependents > 0) targetMonths += 2;
  
  const emergencyFundTarget = monthlyObligations * targetMonths;
  const emergencySavings = profile.safety.emergency_savings;
  
  const emergencyFundGap = Math.max(0, emergencyFundTarget - emergencySavings);
  
  const emergencyFundCoverageMonths = monthlyObligations > 0 
    ? emergencySavings / monthlyObligations 
    : (emergencySavings > 0 ? 999 : 0);
    
  const isSufficient = emergencyFundGap === 0;
  
  // Recommend contributing up to 20% of surplus or the whole gap, whichever is smaller
  // But wait, the prompt says "determine an emergency-fund contribution when the emergency fund is below target"
  // Let's use 50% of available surplus if there's a gap, to prioritize it
  let recommendedMonthlyContribution = 0;
  if (!isSufficient && calc.monthlySurplus > 0) {
    recommendedMonthlyContribution = Math.min(emergencyFundGap, calc.monthlySurplus * 0.5);
  }

  return {
    monthlyObligations,
    targetMonths,
    emergencyFundTarget,
    emergencyFundGap,
    emergencyFundCoverageMonths,
    isSufficient,
    recommendedMonthlyContribution
  };
}