import type { FinSyncSession } from "@/types/session";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";

export function buildTutorFinancialContext(session: FinSyncSession) {
  const calc = session.financial_plan?.calculations;
  const emergency = session.financial_plan?.emergencyFund;
  const allocation = session.financial_plan?.assetAllocation;
  const risk = session.financial_plan?.riskProfile;
  const goals = session.goals || [];
  const goalSim = session.goal_simulation?.goals || [];
  const holdings = session.holdings || [];
  const marketData = session.market_data || {};

  // Savings rate is derived deterministically from existing UI logic
  let savingsRate = undefined;
  if (calc && calc.totalMonthlyIncome > 0) {
    savingsRate = (calc.monthlySurplus / calc.totalMonthlyIncome) * 100;
  }

  // Portfolio valuation calculates current totals natively using existing engine
  const valuation = calculatePortfolioValuation(holdings, marketData);

  return {
    monthly_income: calc?.totalMonthlyIncome,
    essential_expenses: calc?.totalEssentialExpenses,
    discretionary_expenses: calc?.totalDiscretionaryExpenses,
    debt_obligations: calc?.totalDebtPayments,
    monthly_surplus: calc?.monthlySurplus,
    savings_rate_percent: savingsRate,
    
    emergency_fund_target: emergency?.emergencyFundTarget,
    emergency_fund_gap: emergency?.emergencyFundGap,
    emergency_fund_current_liquidity: (emergency?.emergencyFundTarget || 0) - (emergency?.emergencyFundGap || 0),
    emergency_fund_sufficiency: emergency?.isSufficient,
    
    current_portfolio_allocation: allocation?.currentAllocation,
    target_portfolio_allocation: allocation?.targetAllocation,
    portfolio_holdings: holdings.map(h => ({ name: h.name, category: h.asset_category })),
    
    invested_amount: valuation.totalInvestedValue,
    current_portfolio_value: valuation.totalCurrentValue,
    absolute_return: valuation.totalGainLoss,
    return_percentage: valuation.totalGainLossPercentage,
    
    risk_score_category: risk,
    
    goals: goals.map(g => ({ name: g.name, target: g.target_amount, horizon_months: g.horizon_months })),
    goal_progress: goalSim.map(g => ({ 
      id: g.id, 
      probability: g.monte_carlo?.attainment_frequency_percentage, 
      projected: g.projected_value 
    })),
    
    // Future simulator uses the Monte Carlo results if generated alongside goals
    future_simulator_results: session.goal_simulation?.monte_carlo_enabled ? "Available in goal simulation" : "Unavailable"
  };
}

export function buildTutorLearningContext(
  session: FinSyncSession, 
  currentLevel: string, 
  currentLesson: string, 
  currentSection?: string
) {
  return {
    current_level: currentLevel,
    current_section: currentSection || "Unknown",
    current_lesson: currentLesson,
    
    completed_lessons: session.tutor_completed_lessons || [],
    quiz_scores: session.tutor_quiz_scores || {},
    unlocked_level: session.tutor_unlocked_level || "BEGINNER",
    
    // Explicitly marking missing/unsupported signals as unavailable rather than fabricating
    weak_topics: "Unavailable",
    strong_topics: "Unavailable",
    repeated_questions: "Unavailable"
  };
}
