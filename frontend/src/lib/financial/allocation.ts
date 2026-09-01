import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations, RiskProfileAnalysis, AllocationAnalysis } from "@/types/financial-plan";

const TARGET_ALLOCATIONS = {
  Conservative: {
    cash: 10,
    fd: 30,
    bonds: 30,
    mutual_funds: 25,
    stocks: 10
  },
  Moderate: {
    cash: 5,
    fd: 15,
    bonds: 20,
    mutual_funds: 45,
    stocks: 20
  },
  Growth: {
    cash: 5,
    fd: 5,
    bonds: 10,
    mutual_funds: 55,
    stocks: 30
  }
};

export function analyzeAllocation(profile: FinancialProfile, calc: FinancialCalculations, risk: RiskProfileAnalysis): AllocationAnalysis {
  const targetAllocation = TARGET_ALLOCATIONS[risk.category];
  
  const a = profile.assets;
  // Calculate total main investable assets (excluding "other" to avoid distortion)
  const investableTotal = Number(a.cash_bank || 0) + Number(a.fd || 0) + Number(a.bonds_debt || 0) + Number(a.mutual_funds || 0) + Number(a.stocks_equity || 0);
  
  const currentValues = {
    cash: Number(a.cash_bank || 0),
    fd: Number(a.fd || 0),
    bonds: Number(a.bonds_debt || 0),
    mutual_funds: Number(a.mutual_funds || 0),
    stocks: Number(a.stocks_equity || 0)
  };
  
  const currentAllocation: Record<string, number> = {};
  const comparison: AllocationAnalysis["comparison"] = {};
  
  const TOLERANCE = 5; // 5% tolerance band
  
  for (const [key, targetPct] of Object.entries(targetAllocation)) {
    const val = currentValues[key as keyof typeof currentValues] || 0;
    const currentPct = investableTotal > 0 ? (val / investableTotal) * 100 : 0;
    currentAllocation[key] = currentPct;
    
    const difference = currentPct - targetPct;
    let status: "Overweight" | "Near Target" | "Underweight" = "Near Target";
    
    if (difference > TOLERANCE) status = "Overweight";
    else if (difference < -TOLERANCE) status = "Underweight";
    
    comparison[key] = { difference, status };
  }
  
  return {
    targetAllocation,
    currentAllocation,
    currentValues,
    comparison
  };
}