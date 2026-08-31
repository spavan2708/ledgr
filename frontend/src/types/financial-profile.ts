export interface FinancialProfile {
  personal: {
    age: number;
    occupation: string;
    dependents: number;
  };
  cash_flow: {
    monthly_take_home_income: number;
    other_monthly_income: number;
    // Essential expenses breakdown
    housing: number;
    food: number;
    utilities: number;
    transport: number;
    insurance: number;
    healthcare: number;
    other_essential: number;
    // Discretionary expenses breakdown
    shopping: number;
    dining_out: number;
    entertainment: number;
    subscriptions: number;
    travel_leisure: number;
    other_discretionary: number;
    // Financial commitments
    monthly_debt_payments: number;
    existing_monthly_investments: number;
  };
  assets: {
    cash_bank: number;
    fd: number;
    mutual_funds: number;
    stocks_equity: number;
    bonds_debt: number;
    gold: number;
    other_assets: number;
  };
  liabilities: {
    outstanding_loans: number;
    other_liabilities: number;
  };
  safety: {
    emergency_savings: number;
  };
  risk: {
    investment_experience: string;
    market_loss_reaction: string;
    investment_horizon: string;
    income_stability: number;
  };
}

// Backend analysis types (retained for later phases)

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

export interface MLPersona {
  available: boolean;
  model_name: string;
  model_version: string | null;
  persona: string | null;
  cluster_id: number | null;
  similarity_score: number | null;
  key_characteristics: string[];
  limitations: string[];
}

export interface MarketRegime {
  available: boolean;
  model_name: string;
  model_version: string | null;
  symbol: string;
  index_name: string;
  regime: string | null;
  cluster_id: number | null;
  similarity_score: number | null;
  as_of: string;
  data_mode: "live" | "cached" | "demo" | "unavailable";
  source: string;
  latest_market_date: string | null;
  key_characteristics: string[];
  interpretation: string;
  limitations: string[];
  latest_features: Record<string, number | null>;
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
  score_name: "FinSync Adaptive Health Score \u2014 a proprietary educational indicator.";
  health_label: "Needs Attention" | "Developing" | "Healthy" | "Strong";
  score_explanations: ScoreComponent[];
  model_features: ModelFeatures;
  ml_persona: MLPersona;
  comparative_strategies: ComparativeStrategy[];
  positive_factors: string[];
  risk_factors: string[];
  suggested_next_actions: string[];
  warnings: string[];
}