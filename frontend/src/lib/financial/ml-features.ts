import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations } from "@/types/financial-plan";
import type { GoalSimulationResponse } from "@/types/goals";
import type { EmergencyFundAnalysis } from "@/types/financial-plan";
import type { DebtAnalysis } from "@/types/financial-plan";

export interface MLFeatureVector {
  emergencyFundScore: number;
  debtScore: number;
  cashFlowScore: number;
  goalPressureScore: number;
  goalTimeHorizonScore: number;
  goalFeasibilityScore: number;
  existingAllocationRisk: number;
  overallRiskScore: number;
  mlInsightsPlaceholder: string;
}

export function extractMLFeatures(
  profile: FinancialProfile,
  calc: FinancialCalculations,
  emergency: EmergencyFundAnalysis,
  debt: DebtAnalysis,
  goals: GoalSimulationResponse | null
): MLFeatureVector {
  // Deterministic fallback/placeholder values for the future ML model
  let goalPressureScore = 0;
  let goalTimeHorizonScore = 50;
  let goalFeasibilityScore = 50;

  if (goals && goals.goals.length > 0) {
    const totalRequired = goals.capacity_summary.total_required_contributions;
    const capacity = goals.capacity_summary.estimated_monthly_capacity;
    goalPressureScore = capacity > 0 ? Math.min(100, (totalRequired / capacity) * 100) : 100;
    
    const avgHorizon = goals.goals.reduce((sum, g) => sum + g.horizon_months, 0) / goals.goals.length;
    goalTimeHorizonScore = Math.min(100, avgHorizon); // capping at 100 months for the score representation

    const avgFeasibility = goals.goals.reduce((sum, g) => sum + g.projected_attainment_percentage, 0) / goals.goals.length;
    goalFeasibilityScore = Math.min(100, avgFeasibility);
  }

  const cashFlowScore = calc.totalMonthlyIncome > 0 
    ? Math.max(0, 100 - (calc.totalMonthlyExpenses / calc.totalMonthlyIncome * 100))
    : 0;

  const debtScore = 100 - debt.debtPaymentRatio; // simplified deterministic score

  return {
    emergencyFundScore: emergency.isSufficient ? 100 : (emergency.emergencyFundCoverageMonths / emergency.targetMonths) * 100,
    debtScore: Math.max(0, Math.min(100, debtScore)),
    cashFlowScore: Math.max(0, Math.min(100, cashFlowScore)),
    goalPressureScore,
    goalTimeHorizonScore,
    goalFeasibilityScore,
    existingAllocationRisk: 50, // placeholder
    overallRiskScore: 50, // placeholder for combined risk output
    mlInsightsPlaceholder: "ML Engine Integration Pending"
  };
}
