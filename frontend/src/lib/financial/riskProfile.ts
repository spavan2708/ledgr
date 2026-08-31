import type { FinancialProfile } from "@/types/financial-profile";
import type { RiskProfileAnalysis } from "@/types/financial-plan";

export function analyzeRiskProfile(profile: FinancialProfile): RiskProfileAnalysis {
  let score = 0;
  
  // 1. Investment Experience (max 25)
  const exp = profile.risk.investment_experience;
  if (exp === "None") score += 5;
  else if (exp === "Beginner") score += 10;
  else if (exp === "Some experience") score += 18;
  else if (exp === "Experienced") score += 25;
  
  // 2. Reaction to Loss (max 25)
  const loss = profile.risk.market_loss_reaction;
  if (loss === "Sell immediately") score += 5;
  else if (loss === "Sell some") score += 12;
  else if (loss === "Hold and wait") score += 18;
  else if (loss === "Invest more") score += 25;
  
  // 3. Investment Horizon (max 30)
  const horizon = profile.risk.investment_horizon;
  if (horizon === "Less than 2 years") score += 5;
  else if (horizon === "2–5 years") score += 12;
  else if (horizon === "5–10 years") score += 22;
  else if (horizon === "10+ years") score += 30;
  
  // 4. Income Stability (max 20)
  const stability = profile.risk.income_stability;
  score += (stability / 5) * 20;
  
  let category: "Conservative" | "Moderate" | "Growth" = "Conservative";
  let explanation = "";
  
  if (score < 45) {
    category = "Conservative";
    explanation = "Your profile suggests prioritizing capital preservation and stability over high returns.";
  } else if (score < 75) {
    category = "Moderate";
    explanation = "Your profile suggests balancing capital growth with a moderate level of stability.";
  } else {
    category = "Growth";
    explanation = "Your profile suggests you are comfortable with volatility to pursue higher long-term growth.";
  }
  
  return {
    score,
    category,
    explanation
  };
}