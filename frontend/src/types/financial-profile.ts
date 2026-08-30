export interface FinancialProfile {
  name: string;
  age: number;
  occupation: string;
  monthly_income: number;
  monthly_essential_expenses: number;
  monthly_financial_obligations: number;
  monthly_debt_payments: number;
  current_savings: number;
  emergency_fund: number;
  outstanding_debt: number;
  total_assets: number;
  liquid_assets: number;
  total_liabilities: number;
  dependents: number;
  income_stability: number;
  investment_experience: number;
  investment_horizon_years: number;
  volatility_comfort: number;
  additional_context?: string;
}

export interface FinancialMetrics {
  net_cash_flow: number;
  investable_surplus: number;
  savings_ratio: number | null;
  expense_ratio: number | null;
  debt_service_ratio: number | null;
  debt_to_asset_ratio: number | null;
  solvency_ratio: number | null;
  liquidity_ratio: number | null;
  net_worth: number;
  expense_to_income_ratio: number | null;
  debt_to_income_ratio: number | null;
  savings_rate: number | null;
  emergency_fund_coverage_months: number | null;
  estimated_monthly_investment_capacity: number;
}

export interface RatioDetail {
  key: string;
  display_name: string;
  value: number | null;
  unit: "percentage" | "months";
  formula_description: string;
  interpretation: string;
  reference_range_used: string;
  disclaimer: string;
}

export interface ModelFeatures {
  savings_ratio: number | null;
  expense_ratio: number | null;
  debt_service_ratio: number | null;
  debt_to_asset_ratio: number | null;
  solvency_ratio: number | null;
  liquidity_months: number | null;
  emergency_fund_months: number | null;
  income_stability: number;
  dependents: number;
  investment_horizon_years: number;
  volatility_comfort: number;
  investment_experience: number;
}

export interface ComparativeStrategy {
  name: "Safety First" | "Balanced Progress" | "Growth Focused";
  summary: string;
  reserve_priority: string;
  debt_priority: string;
  investable_amount: number;
  risk_level: "Low" | "Moderate" | "High";
  advantages: string[];
  trade_offs: string[];
  suitability_conditions: string[];
}

export interface ScoreComponent {
  name: string;
  score: number;
  max_score: number;
  explanation: string;
}

export interface FinancialProfileResult {
  profile: FinancialProfile;
  metrics: FinancialMetrics;
  ratios: RatioDetail[];
  financial_health_score: number;
  score_name: "FinSync Adaptive Health Score — a proprietary educational indicator.";
  health_label: "Needs Attention" | "Developing" | "Healthy" | "Strong";
  score_explanations: ScoreComponent[];
  model_features: ModelFeatures;
  comparative_strategies: ComparativeStrategy[];
  positive_factors: string[];
  risk_factors: string[];
  suggested_next_actions: string[];
  warnings: string[];
}

export type ProfileField = keyof FinancialProfile;
export type ProfileErrors = Partial<Record<ProfileField, string>>;
