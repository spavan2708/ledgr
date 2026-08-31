import type { AnyHolding, MarketDataCache } from "@/types/holdings";
import type { FinancialProfile } from "@/types/financial-profile";
import { calculatePortfolioValuation } from "./portfolioValuation";

export function syncHoldingsToProfile(
  holdings: AnyHolding[],
  marketData: Record<string, MarketDataCache>,
  profile: FinancialProfile
): FinancialProfile {
  const valuation = calculatePortfolioValuation(holdings, marketData);
  
  // Clone profile to avoid direct mutation
  const newProfile = JSON.parse(JSON.stringify(profile)) as FinancialProfile;
  
  if (holdings.length === 0) {
    // Legacy preservation: if no holdings exist at all, preserve the static profile values.
    return newProfile;
  }
  
  newProfile.assets = {
    cash_bank: valuation.categoryValues.cash.currentValue,
    fd: valuation.categoryValues.fd.currentValue,
    mutual_funds: valuation.categoryValues.mutual_funds.currentValue,
    stocks_equity: valuation.categoryValues.stocks.currentValue,
    bonds_debt: valuation.categoryValues.bonds.currentValue,
    gold: valuation.categoryValues.gold.currentValue,
    other_assets: valuation.categoryValues.other.currentValue,
  };
  
  return newProfile;
}
