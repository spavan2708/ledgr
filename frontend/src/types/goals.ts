export type GoalCategory = "emergency_reserve" | "education" | "vehicle" | "house" | "travel" | "business" | "retirement" | "wealth_creation" | "custom";
export type Priority = "essential" | "high" | "medium" | "low";
export type Flexibility = "fixed" | "somewhat_flexible" | "flexible";

export interface GoalInput {
  id: string; name: string; category: GoalCategory; target_amount: number;
  amount_basis: "today_value" | "future_value"; current_saved: number;
  horizon_months: number; priority: Priority; flexibility: Flexibility;
  planned_monthly_contribution: number; annual_step_up_percentage: number;
  inflation_rate?: number; notes?: string;
}

export interface ScenarioAssumption { nominal_annual_return: number; annual_volatility: number; inflation_rate: number; }
export interface ScenarioAssumptions { conservative: ScenarioAssumption; base: ScenarioAssumption; optimistic: ScenarioAssumption; }
export interface ScenarioProjection extends ScenarioAssumption { scenario: "conservative" | "base" | "optimistic"; projected_value: number; adjusted_target: number; funding_gap_or_surplus: number; attainment_percentage: number; }
export interface TimelinePoint { month: number; projected_value: number; adjusted_target: number; }
export interface MonteCarloResult { simulations: number; seed: number; p10: number; p50: number; p90: number; attainment_frequency_percentage: number; attainment_frequency_label: string; }
export interface GoalResult { id: string; name: string; category: GoalCategory; horizon_months: number; status: "already_funded" | "on_track" | "needs_adjustment" | "currently_unfeasible"; inflation_adjusted_target: number; future_value_current_savings: number; required_monthly_contribution: number; planned_monthly_contribution: number; projected_value: number; funding_gap_or_surplus: number; progress_percentage: number; projected_attainment_percentage: number; scenarios: ScenarioProjection[]; timeline: TimelinePoint[]; monte_carlo: MonteCarloResult | null; explanations: string[]; warnings: string[]; assigned_monthly_capacity: number; monthly_capacity_gap: number; capacity_status: "funded" | "partially_funded" | "unfunded"; allocated_capacity_projected_value: number; }
export interface CapacityAllocation { goal_id: string; goal_name: string; priority: Priority; required_monthly_contribution: number; planned_monthly_contribution: number; assigned_monthly_capacity: number; unfunded_monthly_gap: number; }
export interface GoalSimulationResponse { capacity_summary: { estimated_monthly_capacity: number; total_planned_contributions: number; total_required_contributions: number; remaining_monthly_capacity: number; allocations: CapacityAllocation[]; capacity_conflicts: string[]; allocation_explanation: string; }; goals: GoalResult[]; assumptions: ScenarioAssumptions; monte_carlo_enabled: boolean; warnings: string[]; limitations: string[]; }
