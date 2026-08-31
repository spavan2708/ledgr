import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, EmergencyFundAnalysis, DebtAnalysis, RiskProfileAnalysis, AllocationAnalysis, HealthScore } from "@/types/financial-plan";

export function calculateHealthScore(
  profile: FinancialProfile,
  calc: FinancialCalculations,
  emergency: EmergencyFundAnalysis,
  debt: DebtAnalysis,
  risk: RiskProfileAnalysis,
  allocation: AllocationAnalysis
): HealthScore {
  
  let score = 0;
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  
  // 1. Emergency Fund (max 30 points)
  if (emergency.emergencyFundCoverageMonths >= emergency.targetMonths) {
    score += 30;
    positiveFactors.push("Adequate emergency savings covering target obligations");
  } else if (emergency.emergencyFundCoverageMonths >= emergency.targetMonths / 2) {
    score += 15;
    negativeFactors.push("Emergency savings are only partially funded");
  } else {
    score += 5;
    negativeFactors.push("Critically low emergency savings");
  }
  
  // 2. Debt Burden (max 25 points)
  if (debt.debtPaymentRatio === 0) {
    score += 25;
    positiveFactors.push("No monthly debt burden");
  } else if (debt.debtPaymentRatio <= 20) {
    score += 20;
    positiveFactors.push("Manageable debt payment ratio");
  } else if (debt.debtPaymentRatio <= 40) {
    score += 10;
    negativeFactors.push("Debt burden is slightly high");
  } else {
    negativeFactors.push("Debt payments consume a large portion of income");
  }
  
  // 3. Savings/Investment Capacity (max 25 points)
  const savingsRatio = calc.totalMonthlyIncome > 0 ? (calc.monthlySurplus / calc.totalMonthlyIncome) * 100 : 0;
  if (savingsRatio >= 20) {
    score += 25;
    positiveFactors.push("Strong monthly surplus for saving and investing");
  } else if (savingsRatio >= 10) {
    score += 15;
    positiveFactors.push("Good monthly surplus");
  } else if (savingsRatio > 0) {
    score += 5;
    negativeFactors.push("Low monthly surplus limits wealth building");
  } else {
    negativeFactors.push("No monthly surplus available");
  }
  
  // 4. Asset Diversification & Readiness (max 20 points)
  // Check if they are completely concentrated in one asset class (excluding cash)
  let concentrated = false;
  for (const [key, pct] of Object.entries(allocation.currentAllocation)) {
    if (key !== "cash" && pct >= 80) concentrated = true;
  }
  
  if (calc.totalFinancialAssets > 0 && !concentrated) {
    score += 20;
    positiveFactors.push("Good baseline diversification");
  } else if (calc.totalFinancialAssets > 0 && concentrated) {
    score += 10;
    negativeFactors.push("Current portfolio is highly concentrated");
  } else {
    negativeFactors.push("Starting financial journey with minimal assets");
  }
  
  // Determine rating
  let rating = "Needs Attention";
  if (score >= 80) rating = "Excellent Financial Position";
  else if (score >= 60) rating = "Good Financial Position";
  else if (score >= 40) rating = "Developing Position";
  
  return {
    score,
    rating,
    positiveFactors,
    negativeFactors
  };
}