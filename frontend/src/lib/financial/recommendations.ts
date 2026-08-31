import type { FinancialCalculations, EmergencyFundAnalysis, RiskProfileAnalysis, AllocationAnalysis, InvestmentRecommendations } from "@/types/financial-plan";

export function generateRecommendations(
  calc: FinancialCalculations, 
  emergency: EmergencyFundAnalysis,
  risk: RiskProfileAnalysis,
  allocation: AllocationAnalysis
): InvestmentRecommendations {
  
  let investableMonthlyAmount = 0;
  
  if (calc.monthlySurplus > 0) {
    investableMonthlyAmount = Math.max(0, calc.monthlySurplus - emergency.recommendedMonthlyContribution);
  }
  
  // Distribute the investable amount based on the target allocation profile
  const recommendedAllocation: Record<string, number> = {};
  
  // To avoid small precision errors, track remaining and allocate exactly
  let remaining = investableMonthlyAmount;
  const categories = Object.keys(allocation.targetAllocation);
  
  for (let i = 0; i < categories.length; i++) {
    const key = categories[i];
    const targetPct = allocation.targetAllocation[key];
    
    if (i === categories.length - 1) {
      // Last category gets exactly whatever is remaining
      recommendedAllocation[key] = remaining;
    } else {
      // Round to nearest multiple of 100 or simply round
      const rawAmount = (investableMonthlyAmount * targetPct) / 100;
      const roundedAmount = Math.round(rawAmount / 100) * 100; // Round to nearest 100
      
      // Ensure we don't allocate more than remaining
      const finalAmount = Math.min(roundedAmount, remaining);
      recommendedAllocation[key] = finalAmount;
      remaining -= finalAmount;
    }
  }
  
  return {
    investableMonthlyAmount,
    recommendedAllocation
  };
}