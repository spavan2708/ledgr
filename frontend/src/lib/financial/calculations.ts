import type { FinancialProfile } from "@/types/financial-profile";
import type { FinancialCalculations } from "@/types/financial-plan";

export function calculateFinancials(profile: FinancialProfile): FinancialCalculations {
  const cf = profile.cash_flow;
  const totalMonthlyIncome = Number(cf.monthly_take_home_income || 0) + Number(cf.other_monthly_income || 0);
  
  const totalEssentialExpenses = 
    Number(cf.housing || 0) + 
    Number(cf.food || 0) + 
    Number(cf.utilities || 0) + 
    Number(cf.transport || 0) + 
    Number(cf.insurance || 0) + 
    Number(cf.healthcare || 0) + 
    Number(cf.other_essential || 0);
    
  const nonEssentialMonthlyExpenses = 
    Number(cf.shopping || 0) + 
    Number(cf.dining_out || 0) + 
    Number(cf.entertainment || 0) + 
    Number(cf.subscriptions || 0) + 
    Number(cf.travel_leisure || 0) + 
    Number(cf.other_discretionary || 0);

  const totalMonthlyExpenses = totalEssentialExpenses + nonEssentialMonthlyExpenses + Number(cf.monthly_debt_payments || 0);
  
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;

  const a = profile.assets;
  const totalFinancialAssets = 
    Number(a.cash_bank || 0) + 
    Number(a.fd || 0) + 
    Number(a.mutual_funds || 0) + 
    Number(a.stocks_equity || 0) + 
    Number(a.bonds_debt || 0) + 
    Number(a.gold || 0) + 
    Number(a.other_assets || 0);

  const l = profile.liabilities;
  const totalLiabilities = Number(l.outstanding_loans || 0) + Number(l.other_liabilities || 0);

  const netWorth = totalFinancialAssets - totalLiabilities;

  return {
    totalMonthlyIncome,
    totalEssentialExpenses,
    totalMonthlyExpenses,
    monthlySurplus,
    totalFinancialAssets,
    totalLiabilities,
    netWorth
  };
}