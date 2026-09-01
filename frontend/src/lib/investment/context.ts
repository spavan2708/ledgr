import type { FinSyncSession } from "@/types/session";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";

export function buildInvestmentContext(session: FinSyncSession | null) {
  if (!session) return null;

  const calc = session.financial_plan?.calculations;
  const emergency = session.financial_plan?.emergencyFund;
  const allocation = session.financial_plan?.assetAllocation;
  const risk = session.financial_plan?.riskProfile;
  const goals = session.goals || [];
  const holdings = session.holdings || [];
  const marketData = session.market_data || {};

  const valuation = calculatePortfolioValuation(holdings, marketData);

  return {
    income: calc?.totalMonthlyIncome,
    expenses: calc?.totalMonthlyExpenses,
    surplus: calc?.monthlySurplus,
    emergency_fund: {
      target: emergency?.emergencyFundTarget,
      gap: emergency?.emergencyFundGap,
      sufficient: emergency?.isSufficient
    },
    allocations: {
      current: allocation?.currentAllocation,
      engine_target: allocation?.targetAllocation
    },
    portfolio: {
      invested: valuation.totalInvestedValue,
      current_value: valuation.totalCurrentValue
    },
    risk_profile: risk,
    goals: goals.map(g => ({
      name: g.name,
      target: g.target_amount,
      horizon_months: g.horizon_months,
      planned_contribution: g.planned_monthly_contribution
    }))
  };
}
