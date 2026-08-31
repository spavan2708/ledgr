import { calculateProjectedValue, runMonteCarlo, simulateGoals } from "./goals";
import type { GoalInput, GoalSimulationResponse, ScenarioAssumptions, MonteCarloResult } from "@/types/goals";
import type { FinancialPlan } from "@/types/financial-plan";

export interface SimulatorInputs {
  horizonYears: number;
  monthlyContribution: number;
  annualStepUpPct: number;
  expectedAnnualReturn: number;
  annualVolatility: number;
  inflationRate: number;
  startingPortfolioValue: number;
}

export interface SimulatorTimelinePoint {
  year: number;
  portfolioValue: number;
  totalContributions: number;
  investmentGrowth: number;
}

export interface SimulatorResult {
  inputs: SimulatorInputs;
  finalPortfolioValue: number;
  totalContributions: number;
  totalInvestmentGrowth: number;
  timeline: SimulatorTimelinePoint[];
  goalOutlook: GoalSimulationResponse;
  monteCarlo: MonteCarloResult | null;
  projectedAllocation: Record<string, number>;
}

export const PRESETS: Record<string, Partial<SimulatorInputs>> = {
  conservative: { expectedAnnualReturn: 6, annualVolatility: 5 },
  balanced: { expectedAnnualReturn: 10, annualVolatility: 12 },
  growth: { expectedAnnualReturn: 14, annualVolatility: 18 }
};

export function runSimulator(
  inputs: SimulatorInputs,
  plan: FinancialPlan,
  goalsInput: GoalInput[],
  enableMonteCarlo: boolean = false
): SimulatorResult {
  const horizonMonths = inputs.horizonYears * 12;

  // 1. Core deterministic projection
  const { finalValue, timeline: rawTimeline } = calculateProjectedValue(
    inputs.startingPortfolioValue,
    inputs.monthlyContribution,
    horizonMonths,
    inputs.expectedAnnualReturn,
    inputs.annualStepUpPct
  );

  let totalContributions = 0;
  let currentMonthly = inputs.monthlyContribution;
  for (let m = 1; m <= horizonMonths; m++) {
    totalContributions += currentMonthly;
    if (m % 12 === 0) {
      currentMonthly *= (1 + inputs.annualStepUpPct / 100);
    }
  }

  const timeline: SimulatorTimelinePoint[] = [];
  let cumContrib = 0;
  let currMonth = inputs.monthlyContribution;
  for (let m = 1; m <= horizonMonths; m++) {
    cumContrib += currMonth;
    if (m % 12 === 0) {
      const pt = rawTimeline.find(t => t.month === m);
      if (pt) {
        timeline.push({
          year: m / 12,
          portfolioValue: pt.projected_value,
          totalContributions: cumContrib,
          investmentGrowth: Math.max(0, pt.projected_value - inputs.startingPortfolioValue - cumContrib)
        });
      }
      currMonth *= (1 + inputs.annualStepUpPct / 100);
    }
  }

  const modifiedAssumptions: ScenarioAssumptions = {
    conservative: { nominal_annual_return: inputs.expectedAnnualReturn - 2, annual_volatility: inputs.annualVolatility, inflation_rate: inputs.inflationRate },
    base: { nominal_annual_return: inputs.expectedAnnualReturn, annual_volatility: inputs.annualVolatility, inflation_rate: inputs.inflationRate },
    optimistic: { nominal_annual_return: inputs.expectedAnnualReturn + 2, annual_volatility: inputs.annualVolatility, inflation_rate: inputs.inflationRate }
  };

  const goalOutlook = simulateGoals(goalsInput, inputs.monthlyContribution, modifiedAssumptions, false, 0);

  let mcResult: MonteCarloResult | null = null;
  if (enableMonteCarlo) {
    mcResult = runMonteCarlo(
      inputs.startingPortfolioValue,
      inputs.monthlyContribution,
      horizonMonths,
      inputs.expectedAnnualReturn,
      inputs.annualVolatility,
      inputs.annualStepUpPct,
      1000,
      0
    );
  }

  const targetAlloc = plan.assetAllocation?.targetAllocation || {};
  const projectedAllocation: Record<string, number> = {};
  for (const k of Object.keys(targetAlloc)) {
    projectedAllocation[k] = (targetAlloc[k] / 100) * finalValue;
  }

  return {
    inputs,
    finalPortfolioValue: finalValue,
    totalContributions,
    totalInvestmentGrowth: Math.max(0, finalValue - inputs.startingPortfolioValue - totalContributions),
    timeline,
    goalOutlook,
    monteCarlo: mcResult,
    projectedAllocation
  };
}
