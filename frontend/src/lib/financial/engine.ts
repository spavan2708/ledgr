import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialPlan } from "@/types/financial-plan";
import { calculateFinancials } from "./calculations";
import { analyzeEmergencyFund } from "./emergencyFund";
import { analyzeDebt } from "./debt";
import { analyzeRiskProfile } from "./riskProfile";
import { analyzeAllocation } from "./allocation";
import { generateRecommendations } from "./recommendations";
import { calculateHealthScore } from "./healthScore";

export function generateFinancialPlan(profile: FinancialProfile): FinancialPlan {
  const calculations = calculateFinancials(profile);
  const emergencyFund = analyzeEmergencyFund(profile, calculations);
  const debt = analyzeDebt(profile, calculations);
  const riskProfile = analyzeRiskProfile(profile);
  const allocation = analyzeAllocation(profile, calculations, riskProfile);
  const recommendations = generateRecommendations(calculations, emergencyFund, riskProfile, allocation);
  const healthScore = calculateHealthScore(profile, calculations, emergencyFund, debt, riskProfile, allocation);

  return {
    calculations,
    emergencyFund,
    debt,
    riskProfile,
    allocation,
    recommendations,
    healthScore
  };
}