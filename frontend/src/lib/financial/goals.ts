import type { 
  GoalInput, 
  GoalResult, 
  ScenarioAssumptions, 
  ScenarioProjection,
  TimelinePoint,
  MonteCarloResult,
  CapacityAllocation,
  GoalSimulationResponse
} from "@/types/goals";

function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

function calculateProjectedValue(
  initialAmount: number,
  monthlyContribution: number,
  horizonMonths: number,
  nominalAnnualReturn: number, 
  annualStepUpPct: number
): { finalValue: number; timeline: TimelinePoint[] } {
  const r = nominalAnnualReturn / 100 / 12;
  let balance = initialAmount;
  let currentContribution = monthlyContribution;
  const timeline: TimelinePoint[] = [];

  for (let m = 1; m <= horizonMonths; m++) {
    balance = balance * (1 + r) + currentContribution;
    if (m % 12 === 0 || m === horizonMonths) {
      timeline.push({ month: m, projected_value: balance, adjusted_target: 0 }); 
    }
    if (m % 12 === 0) {
      currentContribution *= (1 + annualStepUpPct / 100);
    }
  }

  return { finalValue: balance, timeline };
}

function calculateFlatRequiredMonthlyContribution(
  target: number,
  initial: number,
  horizonMonths: number,
  nominalAnnualReturn: number
): number {
  const r = nominalAnnualReturn / 100 / 12;
  const n = horizonMonths;
  
  if (r === 0) {
    return Math.max(0, (target - initial) / n);
  }

  const fvInitial = initial * Math.pow(1 + r, n);
  const remaining = target - fvInitial;
  
  if (remaining <= 0) return 0;
  const pmt = remaining / ((Math.pow(1 + r, n) - 1) / r);
  return pmt;
}

function runMonteCarlo(
  initialAmount: number,
  monthlyContribution: number,
  horizonMonths: number,
  annualReturn: number, 
  annualVolatility: number, 
  annualStepUpPct: number,
  simulations: number = 1000,
  target: number
): MonteCarloResult {
  const meanMonthlyReturn = annualReturn / 100 / 12;
  const monthlyVolatility = (annualVolatility / 100) / Math.sqrt(12);
  const outcomes: number[] = [];
  let successCount = 0;

  for (let s = 0; s < simulations; s++) {
    let balance = initialAmount;
    let currentContribution = monthlyContribution;
    for (let m = 1; m <= horizonMonths; m++) {
      const r = randomNormal(meanMonthlyReturn, monthlyVolatility);
      balance = balance * (1 + r) + currentContribution;
      if (m % 12 === 0) {
        currentContribution *= (1 + annualStepUpPct / 100);
      }
    }
    outcomes.push(balance);
    if (balance >= target) {
      successCount++;
    }
  }

  outcomes.sort((a, b) => a - b);
  const p10 = outcomes[Math.floor(simulations * 0.1)];
  const p50 = outcomes[Math.floor(simulations * 0.5)];
  const p90 = outcomes[Math.floor(simulations * 0.9)];
  
  const prob = (successCount / simulations) * 100;
  let label = "Unlikely";
  if (prob >= 90) label = "Highly Likely";
  else if (prob >= 75) label = "Likely";
  else if (prob >= 50) label = "Possible";

  return {
    simulations,
    seed: 0, 
    p10,
    p50,
    p90,
    attainment_frequency_percentage: prob,
    attainment_frequency_label: label
  };
}

export function simulateGoals(
  goals: GoalInput[],
  capacity: number,
  assumptions: ScenarioAssumptions,
  enableMonteCarlo: boolean,
  simulationCount: number
): GoalSimulationResponse {
  const priorityWeight = { essential: 4, high: 3, medium: 2, low: 1 };
  const flexWeight = { fixed: 3, somewhat_flexible: 2, flexible: 1 };
  
  const sortedGoals = [...goals].sort((a, b) => {
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (flexWeight[a.flexibility] !== flexWeight[b.flexibility]) {
      return flexWeight[b.flexibility] - flexWeight[a.flexibility];
    }
    return a.horizon_months - b.horizon_months;
  });

  let remainingCapacity = capacity;
  const allocations: CapacityAllocation[] = [];
  const capacity_conflicts: string[] = [];
  
  let totalPlanned = 0;
  let totalRequired = 0;
  const goalResults: GoalResult[] = [];

  for (const goal of sortedGoals) {
    const baseAssumptions = assumptions.base;
    const inflation = goal.inflation_rate !== undefined && goal.inflation_rate !== null && !isNaN(goal.inflation_rate) ? goal.inflation_rate : baseAssumptions.inflation_rate;
    
    const years = goal.horizon_months / 12;
    const futureTarget = goal.amount_basis === "today_value" 
      ? goal.target_amount * Math.pow(1 + inflation / 100, years)
      : goal.target_amount;

    const { finalValue: projectedBase, timeline } = calculateProjectedValue(
      goal.current_saved,
      goal.planned_monthly_contribution,
      goal.horizon_months,
      baseAssumptions.nominal_annual_return,
      goal.annual_step_up_percentage
    );

    const reqContrib = calculateFlatRequiredMonthlyContribution(
      futureTarget,
      goal.current_saved,
      goal.horizon_months,
      baseAssumptions.nominal_annual_return
    );

    totalPlanned += goal.planned_monthly_contribution;
    totalRequired += reqContrib;

    let assigned = 0;
    if (remainingCapacity >= goal.planned_monthly_contribution) {
      assigned = goal.planned_monthly_contribution;
      remainingCapacity -= assigned;
    } else {
      assigned = Math.max(0, remainingCapacity);
      remainingCapacity = 0;
    }

    const unfundedGap = goal.planned_monthly_contribution - assigned;
    if (unfundedGap > 0) {
      capacity_conflicts.push(`Insufficient capacity to fully fund '${goal.name}'. Shortfall: ₹${Math.round(unfundedGap).toLocaleString('en-IN')} / month`);
    }

    allocations.push({
      goal_id: goal.id,
      goal_name: goal.name,
      priority: goal.priority,
      required_monthly_contribution: reqContrib,
      planned_monthly_contribution: goal.planned_monthly_contribution,
      assigned_monthly_capacity: assigned,
      unfunded_monthly_gap: unfundedGap
    });

    const scenarios: ScenarioProjection[] = (["conservative", "base", "optimistic"] as const).map(scen => {
      const asc = assumptions[scen];
      const scInflation = goal.inflation_rate !== undefined && goal.inflation_rate !== null && !isNaN(goal.inflation_rate) ? goal.inflation_rate : asc.inflation_rate;
      const scTarget = goal.amount_basis === "today_value" 
        ? goal.target_amount * Math.pow(1 + scInflation / 100, years)
        : goal.target_amount;
        
      const { finalValue: scVal } = calculateProjectedValue(
        goal.current_saved,
        goal.planned_monthly_contribution,
        goal.horizon_months,
        asc.nominal_annual_return,
        goal.annual_step_up_percentage
      );

      return {
        ...asc,
        scenario: scen,
        projected_value: scVal,
        adjusted_target: scTarget,
        funding_gap_or_surplus: scVal - scTarget,
        attainment_percentage: (scVal / scTarget) * 100
      };
    });

    for (const pt of timeline) {
      const ptYears = pt.month / 12;
      pt.adjusted_target = goal.amount_basis === "today_value"
        ? goal.target_amount * Math.pow(1 + inflation / 100, ptYears)
        : goal.target_amount * (pt.month / goal.horizon_months);
    }

    const baseProj = scenarios.find(s => s.scenario === "base")!;
    let status: GoalResult["status"] = "currently_unfeasible";
    if (goal.current_saved >= futureTarget) {
      status = "already_funded";
    } else if (baseProj.attainment_percentage >= 100) {
      status = "on_track";
    } else if (baseProj.attainment_percentage >= 80) {
      status = "needs_adjustment";
    }

    let capStatus: GoalResult["capacity_status"] = "unfunded";
    if (assigned >= goal.planned_monthly_contribution) {
      capStatus = "funded";
    } else if (assigned > 0) {
      capStatus = "partially_funded";
    }

    const { finalValue: allocatedVal } = calculateProjectedValue(
      goal.current_saved,
      assigned,
      goal.horizon_months,
      baseAssumptions.nominal_annual_return,
      goal.annual_step_up_percentage
    );

    let mcResult: MonteCarloResult | null = null;
    if (enableMonteCarlo) {
      mcResult = runMonteCarlo(
        goal.current_saved,
        goal.planned_monthly_contribution,
        goal.horizon_months,
        baseAssumptions.nominal_annual_return,
        baseAssumptions.annual_volatility,
        goal.annual_step_up_percentage,
        simulationCount,
        futureTarget
      );
    }

    const explanations: string[] = [];
    if (goal.amount_basis === "today_value") {
      explanations.push(`Target inflated at ${inflation}% annually to ₹${Math.round(futureTarget).toLocaleString('en-IN')}`);
    }

    goalResults.push({
      id: goal.id,
      name: goal.name,
      category: goal.category,
      horizon_months: goal.horizon_months,
      status,
      inflation_adjusted_target: futureTarget,
      future_value_current_savings: goal.current_saved * Math.pow(1 + baseAssumptions.nominal_annual_return / 100 / 12, goal.horizon_months),
      required_monthly_contribution: reqContrib,
      planned_monthly_contribution: goal.planned_monthly_contribution,
      projected_value: projectedBase,
      funding_gap_or_surplus: baseProj.funding_gap_or_surplus,
      progress_percentage: Math.min(100, (goal.current_saved / futureTarget) * 100),
      projected_attainment_percentage: baseProj.attainment_percentage,
      scenarios,
      timeline,
      monte_carlo: mcResult,
      explanations,
      warnings: [],
      assigned_monthly_capacity: assigned,
      monthly_capacity_gap: unfundedGap,
      capacity_status: capStatus,
      allocated_capacity_projected_value: allocatedVal
    });
  }

  const orderedResults = goals.map(g => goalResults.find(gr => gr.id === g.id)!);

  return {
    capacity_summary: {
      estimated_monthly_capacity: capacity,
      total_planned_contributions: totalPlanned,
      total_required_contributions: totalRequired,
      remaining_monthly_capacity: remainingCapacity,
      allocations,
      capacity_conflicts,
      allocation_explanation: `Goals prioritized by: Priority -> Flexibility -> Horizon`
    },
    goals: orderedResults,
    assumptions,
    monte_carlo_enabled: enableMonteCarlo,
    warnings: [],
    limitations: [
      "Taxes and fees are not included",
      "Inflation and returns are assumed constant unless simulated",
      "Monte Carlo models assume normal distribution of returns"
    ]
  };
}
