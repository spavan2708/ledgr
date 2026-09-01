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


export interface MLPipelineFeatures {
  monthly_income: number;
  essential_expenses: number;
  discretionary_expenses: number;
  monthly_debt_payment: number;
  total_debt: number;
  total_assets: number;
  liquid_savings: number;
  emergency_fund_months: number;
  investment_assets: number;
  cash_percentage: number;
  fd_percentage: number;
  debt_percentage: number;
  mutual_fund_percentage: number;
  equity_percentage: number;
  gold_percentage: number;
  monthly_surplus: number;
  debt_to_income_ratio: number;
  debt_to_asset_ratio: number;
  goal_count: number;
  high_priority_goals: number;
  average_goal_horizon_months: number;
  average_goal_funding_gap: number;
  average_goal_probability: number;
}

export function extractMLPipelineFeatures(
  profile: FinancialProfile,
  goals: GoalSimulationResponse | null
): MLPipelineFeatures {
  // Cash Flow
  const monthly_income = Number(profile.cash_flow.monthly_take_home_income) + Number(profile.cash_flow.other_monthly_income);
  
  const essential_expenses = 
    Number(profile.cash_flow.housing) + 
    Number(profile.cash_flow.food) + 
    Number(profile.cash_flow.utilities) + 
    Number(profile.cash_flow.transport) + 
    Number(profile.cash_flow.insurance) + 
    Number(profile.cash_flow.healthcare) + 
    Number(profile.cash_flow.other_essential);
    
  const discretionary_expenses = 
    Number(profile.cash_flow.shopping) + 
    Number(profile.cash_flow.dining_out) + 
    Number(profile.cash_flow.entertainment) + 
    Number(profile.cash_flow.subscriptions) + 
    Number(profile.cash_flow.travel_leisure) + 
    Number(profile.cash_flow.other_discretionary);

  const monthly_debt_payment = Number(profile.cash_flow.monthly_debt_payments);
  
  const monthly_surplus = monthly_income - essential_expenses - discretionary_expenses - monthly_debt_payment;

  // Liabilities
  const total_debt = Number(profile.liabilities.outstanding_loans) + Number(profile.liabilities.other_liabilities);

  // Assets
  const liquid_savings = Number(profile.safety.emergency_savings) + Number(profile.assets.cash_bank);
  
  const fd = Number(profile.assets.fd);
  const mutual_funds = Number(profile.assets.mutual_funds);
  const stocks_equity = Number(profile.assets.stocks_equity);
  const bonds_debt = Number(profile.assets.bonds_debt);
  
  const investment_assets = fd + mutual_funds + stocks_equity + bonds_debt;
  const total_assets = liquid_savings + investment_assets + Number(profile.assets.other_assets);

  // Ratios
  const emergency_fund_months = liquid_savings / Math.max(1, essential_expenses + monthly_debt_payment);
  const debt_to_income_ratio = monthly_debt_payment / Math.max(1, monthly_income);
  const debt_to_asset_ratio = total_debt / Math.max(1, total_assets);

  // Asset Percentages
  let cash_percentage = 0, fd_percentage = 0, debt_percentage = 0;
  let mutual_fund_percentage = 0, equity_percentage = 0;

  if (total_assets > 0) {
    cash_percentage = (liquid_savings / total_assets) * 100;
    fd_percentage = (fd / total_assets) * 100;
    debt_percentage = (bonds_debt / total_assets) * 100;
    mutual_fund_percentage = (mutual_funds / total_assets) * 100;
    equity_percentage = (stocks_equity / total_assets) * 100;
  }

  // Goals
  let goal_count = 0;
  let high_priority_goals = 0;
  let average_goal_horizon_months = 0;
  let average_goal_funding_gap = 0;
  let average_goal_probability = 0;

  if (goals && goals.goals && goals.goals.length > 0) {
    const gls = goals.goals;
    goal_count = gls.length;
    high_priority_goals = goals.capacity_summary.allocations.filter(a => a.priority === "essential" || a.priority === "high").length;
    
    average_goal_horizon_months = gls.reduce((sum, g) => sum + g.horizon_months, 0) / goal_count;
    
    const total_gap = gls.reduce((sum, g) => sum + (g.funding_gap_or_surplus < 0 ? Math.abs(g.funding_gap_or_surplus) : 0), 0);
    average_goal_funding_gap = total_gap / goal_count;

    const total_prob = gls.reduce((sum, g) => sum + (g.monte_carlo ? g.monte_carlo.attainment_frequency_percentage : 0), 0);
    average_goal_probability = total_prob / goal_count;
  }

  return {
    monthly_income,
    essential_expenses,
    discretionary_expenses,
    monthly_debt_payment,
    total_debt,
    total_assets,
    liquid_savings,
    emergency_fund_months,
    investment_assets,
    cash_percentage,
    fd_percentage,
    debt_percentage,
    mutual_fund_percentage,
    equity_percentage,
    gold_percentage: 0, // Legacy fallback for ML backend
    monthly_surplus,
    debt_to_income_ratio,
    debt_to_asset_ratio,
    goal_count,
    high_priority_goals,
    average_goal_horizon_months,
    average_goal_funding_gap,
    average_goal_probability
  };
}
