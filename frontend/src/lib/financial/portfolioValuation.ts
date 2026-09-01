import type { AnyHolding, MarketDataCache, AssetCategoryType, HoldingTransaction } from "@/types/holdings";

export interface PortfolioValuationResult {
  totalCurrentValue: number;
  totalInvestedValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  categoryValues: Record<AssetCategoryType, {
    currentValue: number;
    investedValue: number;
    gainLoss: number;
    gainLossPercentage: number;
  }>;
  holdingsWithValuation: (AnyHolding & {
    calculatedQuantity: number;
    calculatedInvested: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercentage: number;
    portfolioWeight: number;
  })[];
}

function computeLedger(transactions: HoldingTransaction[] | undefined, defaultQuantity: number, defaultInvested: number) {
  if (!transactions || transactions.length === 0) {
    return { qty: defaultQuantity, invested: defaultInvested, realizedGain: 0 };
  }
  let qty = 0;
  let invested = 0;
  let realizedGain = 0;
  
  const typeWeight: Record<string, number> = {
    "buy": 1,
    "deposit": 1,
    "reinvest": 1,
    "interest": 2,
    "sell": 3,
    "withdraw": 3,
    "maturity": 4
  };

  const sorted = [...transactions].sort((a, b) => {
    const dA = new Date(a.date).toISOString().split('T')[0];
    const dB = new Date(b.date).toISOString().split('T')[0];
    if (dA === dB) {
      return (typeWeight[a.type] || 9) - (typeWeight[b.type] || 9);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  for (const tx of sorted) {
    if (tx.type === "buy" || tx.type === "deposit" || tx.type === "reinvest") {
      qty += tx.quantity;
      invested += tx.quantity * tx.price;
    } else if (tx.type === "maturity") {
      realizedGain += (tx.quantity * tx.price) - invested;
      qty = 0;
      invested = 0;
    } else if (tx.type === "sell" || tx.type === "withdraw") {
      if (qty > 0) {
        const avgCost = invested / qty;
        qty -= tx.quantity;
        invested -= tx.quantity * avgCost;
        realizedGain += tx.quantity * (tx.price - avgCost);
      } else {
        qty -= tx.quantity;
      }
    } else if (tx.type === "interest") {
      // Interest payouts generally don't increase quantity/principal unless reinvested, but they could be recorded.
      // We will skip pure interest payouts in cost-basis reduction for this stage.
    }
  }
  
  // Clean up floating point near zero
  if (Math.abs(qty) < 0.000001) {
    qty = 0;
    invested = 0;
  }
  
  return { qty, invested, realizedGain };
}

function computeCompoundInterest(principal: number, rate: number, startDate: string, maturityDate: string, frequency: string): number {
  if (!startDate || !maturityDate) return 0;
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);
  if (isNaN(start.getTime()) || isNaN(maturity.getTime())) return 0;

  let now = new Date();
  
  if (now >= maturity) {
    now = maturity;
  }
  
  if (start > now) return 0;
  
  let n = 1; // Default to yearly
  if (frequency === "monthly") n = 12;
  else if (frequency === "quarterly") n = 4;
  else if (frequency === "half_yearly") n = 2;
  else if (frequency === "at_maturity") {
    const days = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);
    return principal * (rate / 100) * (days / 365);
  }
  
  const days = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);
  const years = days / 365;
  const amount = principal * Math.pow(1 + (rate / 100) / n, n * years);
  return Math.max(0, amount - principal);
}

export function calculatePortfolioValuation(
  holdings: AnyHolding[],
  marketData: Record<string, MarketDataCache>
): PortfolioValuationResult {
  let totalCurrentValue = 0;
  let totalInvestedValue = 0; // Won't include cash

  const categoryValues = {
    cash: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    fd: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    bonds: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    mutual_funds: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    stocks: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    other: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 }
  };

  const holdingsWithValuation = holdings.map(holding => {
    let currentValue = 0;
    let investedValue = 0;
    let calculatedQuantity = 0;
    let realizedGain = 0;

    switch (holding.asset_category) {
      case "cash": {
        const ledger = computeLedger(holding.transactions, holding.balance, holding.balance);
        calculatedQuantity = ledger.qty; // balance
        currentValue = ledger.qty;
        // Cash is an ACCOUNT BALANCE. It has no investment cost basis.
        investedValue = 0; 
        realizedGain = ledger.realizedGain;
        break;
      }
      case "fd": {
        const ledger = computeLedger(holding.transactions, holding.principal, holding.principal);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        realizedGain = ledger.realizedGain;
        
        let accruedInterest = 0;
        if (holding.status === "active" || holding.status === "matured") {
           if (holding.accrued_interest !== undefined) {
             accruedInterest = holding.accrued_interest;
           } else {
             accruedInterest = computeCompoundInterest(ledger.qty, holding.interest_rate, holding.start_date, holding.maturity_date, holding.compounding_frequency);
           }
        }
        currentValue = ledger.qty + accruedInterest;
        break;
      }
      case "stocks": {
        const ledger = computeLedger(holding.transactions, holding.quantity, holding.invested_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        realizedGain = ledger.realizedGain;
        
        const price = marketData[holding.ticker]?.current_price || (investedValue > 0 && calculatedQuantity > 0 ? investedValue / calculatedQuantity : holding.average_purchase_price);
        currentValue = calculatedQuantity * price;
        break;
      }
      case "mutual_funds": {
        const ledger = computeLedger(holding.transactions, holding.units, holding.invested_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        realizedGain = ledger.realizedGain;
        
        const price = marketData[holding.scheme]?.current_price || (investedValue > 0 && calculatedQuantity > 0 ? investedValue / calculatedQuantity : holding.average_purchase_nav);
        currentValue = calculatedQuantity * price;
        break;
      }

      case "bonds": {
        const ledger = computeLedger(holding.transactions, holding.quantity, holding.quantity * holding.purchase_price);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        realizedGain = ledger.realizedGain;
        
        let accruedCoupon = 0;
        let estimatedPrincipal = holding.current_price || holding.face_value || holding.purchase_price || 0;
        
        if (holding.purchase_date) {
           const start = new Date(holding.purchase_date);
           let now = new Date();
           if (holding.maturity_date) {
             const maturity = new Date(holding.maturity_date);
             if (now >= maturity) {
               now = maturity;
               estimatedPrincipal = holding.face_value || estimatedPrincipal;
             }
           }
           if (holding.coupon_rate && holding.face_value && now > start) {
              const days = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);
              const annualCouponPerUnit = holding.face_value * (holding.coupon_rate / 100);
              accruedCoupon = annualCouponPerUnit * calculatedQuantity * (days / 365);
           }
        }
        
        currentValue = (calculatedQuantity * estimatedPrincipal) + accruedCoupon;
        break;
      }
      case "other": {
        const ledger = computeLedger(holding.transactions, 1, holding.purchase_value || holding.estimated_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        realizedGain = ledger.realizedGain;
        currentValue = holding.estimated_value;
        break;
      }
    }

    const gainLoss = holding.asset_category === "cash" ? 0 : (currentValue - investedValue) + realizedGain;
    const gainLossPercentage = (holding.asset_category !== "cash" && investedValue > 0) ? (gainLoss / investedValue) * 100 : 0;

    totalCurrentValue += currentValue;
    totalInvestedValue += investedValue;

    categoryValues[holding.asset_category].currentValue += currentValue;
    categoryValues[holding.asset_category].investedValue += investedValue;
    categoryValues[holding.asset_category].gainLoss += gainLoss;

    return {
      ...holding,
      calculatedQuantity,
      calculatedInvested: investedValue,
      currentValue,
      gainLoss,
      gainLossPercentage,
      portfolioWeight: 0
    };
  });

  // Calculate percentages and weights
  holdingsWithValuation.forEach(h => {
    h.portfolioWeight = totalCurrentValue > 0 ? (h.currentValue / totalCurrentValue) * 100 : 0;
  });

  let totalGainLoss = 0;
  for (const key of Object.keys(categoryValues) as AssetCategoryType[]) {
    const cat = categoryValues[key];
    cat.gainLossPercentage = cat.investedValue > 0 ? (cat.gainLoss / cat.investedValue) * 100 : 0;
    totalGainLoss += cat.gainLoss;
  }

  // Round totals to ensure mathematically cohesive rendering in the UI since the UI formats without fractions
  const finalInvested = Math.round(totalInvestedValue);
  const finalCurrent = Math.round(totalCurrentValue);
  const finalGainLoss = finalCurrent - finalInvested;
  const finalGainLossPercentage = finalInvested > 0 ? (finalGainLoss / finalInvested) * 100 : 0;

  return {
    totalCurrentValue: finalCurrent,
    totalInvestedValue: finalInvested,
    totalGainLoss: finalGainLoss,
    totalGainLossPercentage: finalGainLossPercentage,
    categoryValues,
    holdingsWithValuation
  };
}