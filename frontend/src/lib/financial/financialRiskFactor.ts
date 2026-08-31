import type { FinancialProfile } from "@/types/financial-profile";

export interface MLProbabilities {
  Conservative: number;
  Balanced: number;
  Aggressive: number;
}

export interface FinancialRiskFactorResult {
  behavioralScore: number;
  capacityScore: number;
  finalScore: number;
  riskFactor: number;
  category: "Very Conservative" | "Conservative" | "Balanced" | "Growth" | "Aggressive";
  mlProbabilities: MLProbabilities;
  investmentCapacityStatus: "available" | "unavailable";
  explanation: {
    behavioralBreakdown: Record<string, number>;
    capacityFormula: string;
    finalFormula: string;
    constraintApplied: boolean;
  };
}

export function calculateUnifiedRiskFactor(
  profile: FinancialProfile,
  mlProbs: MLProbabilities,
  monthlySurplus: number
): FinancialRiskFactorResult {
  // 1. BEHAVIORAL RISK SCORE (0-100)
  let behavioralScore = 0;
  const breakdown: Record<string, number> = {};

  // Investment Experience (max 25)
  const exp = profile.risk.investment_experience;
  let expPoints = 5;
  if (exp === "Beginner") expPoints = 10;
  else if (exp === "Some experience") expPoints = 18;
  else if (exp === "Experienced") expPoints = 25;
  behavioralScore += expPoints;
  breakdown["Investment Experience"] = expPoints;

  // Reaction to Loss (max 25)
  const loss = profile.risk.market_loss_reaction;
  let lossPoints = 5;
  if (loss === "Sell some") lossPoints = 12;
  else if (loss === "Hold and wait") lossPoints = 18;
  else if (loss === "Invest more") lossPoints = 25;
  behavioralScore += lossPoints;
  breakdown["Loss Reaction"] = lossPoints;

  // Investment Horizon (max 30)
  const horizon = profile.risk.investment_horizon;
  let horizonPoints = 5;
  if (horizon === "2-5 years") horizonPoints = 12;
  else if (horizon === "5-10 years") horizonPoints = 22;
  else if (horizon === "10+ years") horizonPoints = 30;
  behavioralScore += horizonPoints;
  breakdown["Investment Horizon"] = horizonPoints;

  // Income Stability (max 20)
  const stability = profile.risk.income_stability; // 1 to 5
  const stabilityPoints = (stability / 5) * 20;
  behavioralScore += stabilityPoints;
  breakdown["Income Stability"] = stabilityPoints;

  // 2. FINANCIAL CAPACITY SCORE (0-100)
  // Mapping: Conservative=25, Balanced=50, Aggressive=75
  const capacityScore = 
    (mlProbs.Conservative * 25) + 
    (mlProbs.Balanced * 50) + 
    (mlProbs.Aggressive * 75);

  // 3. FINAL RISK SCORE
  // Base weighted formula: 60% Capacity, 40% Behavioral
  let finalScore = (capacityScore * 0.60) + (behavioralScore * 0.40);
  let constraintApplied = false;

  // Safety Constraint: If financial capacity is very low (< 35), cap the final score to prevent
  // high behavioral tolerance from pushing it into aggressive categories.
  if (capacityScore < 35 && finalScore > 45) {
    finalScore = 45; // Cap at Conservative boundary
    constraintApplied = true;
  }

  // 4. RISK FACTOR (1-10) AND CATEGORY
  // Convert 0-100 to 1-10 linearly.
  // 1-100 -> / 10 -> Math.ceil to get 1-10.
  // Exception: 0 should be 1.
  let riskFactor = Math.ceil(finalScore / 10);
  if (riskFactor < 1) riskFactor = 1;
  if (riskFactor > 10) riskFactor = 10;

  let category: FinancialRiskFactorResult["category"] = "Very Conservative";
  if (riskFactor >= 3 && riskFactor <= 4) category = "Conservative";
  else if (riskFactor >= 5 && riskFactor <= 6) category = "Balanced";
  else if (riskFactor >= 7 && riskFactor <= 8) category = "Growth";
  else if (riskFactor >= 9) category = "Aggressive";

  // 5. SURPLUS CONSTRAINT
  const investmentCapacityStatus = monthlySurplus > 0 ? "available" : "unavailable";

  return {
    behavioralScore: Math.round(behavioralScore),
    capacityScore: Math.round(capacityScore),
    finalScore: Math.round(finalScore),
    riskFactor,
    category,
    mlProbabilities: mlProbs,
    investmentCapacityStatus,
    explanation: {
      behavioralBreakdown: breakdown,
      capacityFormula: `(Conservative% × 25) + (Balanced% × 50) + (Aggressive% × 75)`,
      finalFormula: `(Capacity × 0.6) + (Behavioral × 0.4)`,
      constraintApplied
    }
  };
}
