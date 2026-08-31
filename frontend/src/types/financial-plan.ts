export interface FinancialPlan {
  calculations: FinancialCalculations;
  emergencyFund: EmergencyFundAnalysis;
  debt: DebtAnalysis;
  riskProfile: RiskProfileAnalysis;
  allocation: AllocationAnalysis;
  recommendations: InvestmentRecommendations;
  healthScore: HealthScore;
}

export interface FinancialCalculations {
  totalMonthlyIncome: number;
  totalEssentialExpenses: number;
  totalMonthlyExpenses: number;
  monthlySurplus: number;
  totalFinancialAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface EmergencyFundAnalysis {
  monthlyObligations: number;
  targetMonths: number;
  emergencyFundTarget: number;
  emergencyFundGap: number;
  emergencyFundCoverageMonths: number;
  isSufficient: boolean;
  recommendedMonthlyContribution: number;
}

export interface DebtAnalysis {
  debtPaymentRatio: number;
  debtToAssetRatio: number;
  warning: string | null;
}

export interface RiskProfileAnalysis {
  score: number;
  category: "Conservative" | "Moderate" | "Growth";
  explanation: string;
}

export interface AssetCategory {
  id: "cash" | "fd" | "bonds" | "mutual_funds" | "stocks" | "gold";
  name: string;
}

export interface AllocationAnalysis {
  targetAllocation: Record<string, number>; // percentages
  currentAllocation: Record<string, number>; // percentages
  currentValues: Record<string, number>; // amounts
  comparison: Record<string, {
    difference: number;
    status: "Overweight" | "Near Target" | "Underweight";
  }>;
}

export interface InvestmentRecommendations {
  investableMonthlyAmount: number;
  recommendedAllocation: Record<string, number>; // amount per category
}

export interface HealthScore {
  score: number; // 0-100
  rating: string;
  positiveFactors: string[];
  negativeFactors: string[];
}