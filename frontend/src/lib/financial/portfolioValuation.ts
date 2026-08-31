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
    return { qty: defaultQuantity, invested: defaultInvested };
  }
  let qty = 0;
  let invested = 0;
  // Chronological sorting assumed or should sort by date here
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (const tx of sorted) {
    if (tx.type === "buy" || tx.type === "deposit" || tx.type === "reinvest") {
      qty += tx.quantity;
      invested += tx.quantity * tx.price;
    } else if (tx.type === "sell" || tx.type === "withdraw" || tx.type === "maturity") {
      if (qty > 0) {
        const avgCost = invested / qty;
        qty -= tx.quantity;
        invested -= tx.quantity * avgCost;
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
  
  return { qty, invested };
}

function computeCompoundInterest(principal: number, rate: number, startDate: string, maturityDate: string, frequency: string): number {
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);
  let now = new Date();
  
  if (now > maturity) {
    now = maturity;
  }
  
  if (start > now) return 0;
  
  let n = 1; // Default to yearly
  if (frequency === "monthly") n = 12;
  else if (frequency === "quarterly") n = 4;
  else if (frequency === "half_yearly") n = 2;
  else if (frequency === "at_maturity") {
    // Treat as simple interest or compounded annually depending on bank rules, usually simple or annual
    // Here we use simple interest for strictly "at_maturity" if not compounded, 
    // but in India "cumulative" FD is compounded quarterly. We will assume simple if literally at_maturity without compounding info.
    const days = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);
    return principal * (rate / 100) * (days / 365);
  }
  
  const years = (now.getTime() - start.getTime()) / (1000 * 3600 * 24 * 365.25);
  const amount = principal * Math.pow(1 + (rate / 100) / n, n * years);
  return Math.max(0, amount - principal);
}

export function calculatePortfolioValuation(
  holdings: AnyHolding[],
  marketData: Record<string, MarketDataCache>,
  goldData?: { prices: { "22K": number; "24K": number } }
): PortfolioValuationResult {
  let totalCurrentValue = 0;
  let totalInvestedValue = 0; // Won't include cash

  const categoryValues = {
    cash: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    fd: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    bonds: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    mutual_funds: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    stocks: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    gold: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 },
    other: { currentValue: 0, investedValue: 0, gainLoss: 0, gainLossPercentage: 0 }
  };

  const holdingsWithValuation = holdings.map(holding => {
    let currentValue = 0;
    let investedValue = 0;
    let calculatedQuantity = 0;

    switch (holding.asset_category) {
      case "cash": {
        const ledger = computeLedger(holding.transactions, holding.balance, holding.balance);
        calculatedQuantity = ledger.qty; // balance
        currentValue = ledger.qty;
        // Cash is an ACCOUNT BALANCE. It has no investment cost basis.
        investedValue = 0; 
        break;
      }
      case "fd": {
        const ledger = computeLedger(holding.transactions, holding.principal, holding.principal);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        
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
        
        const price = marketData[holding.ticker]?.current_price || (investedValue > 0 && calculatedQuantity > 0 ? investedValue / calculatedQuantity : holding.average_purchase_price);
        currentValue = calculatedQuantity * price;
        break;
      }
      case "mutual_funds": {
        const ledger = computeLedger(holding.transactions, holding.units, holding.invested_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        
        const price = marketData[holding.scheme]?.current_price || (investedValue > 0 && calculatedQuantity > 0 ? investedValue / calculatedQuantity : holding.average_purchase_nav);
        currentValue = calculatedQuantity * price;
        break;
      }
      case "gold": {
        const ledger = computeLedger(holding.transactions, holding.quantity, holding.invested_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        
        const purity = (holding as any).gold_type;
        const livePrice = goldData && goldData.prices && (purity === "22K" || purity === "24K") ? goldData.prices[purity] : 0;
        const price = livePrice > 0 ? livePrice : ((investedValue > 0 && calculatedQuantity > 0) ? investedValue / calculatedQuantity : (holding as any).average_purchase_price || 0);
        
        currentValue = calculatedQuantity * price;
        break;
      }
      case "bonds": {
        const ledger = computeLedger(holding.transactions, holding.quantity, holding.quantity * holding.purchase_price);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        
        // Manual/formula approach. Do not hallucinate market data.
        const price = holding.current_price || holding.purchase_price || (investedValue > 0 && calculatedQuantity > 0 ? investedValue / calculatedQuantity : 0);
        currentValue = calculatedQuantity * price;
        break;
      }
      case "other": {
        const ledger = computeLedger(holding.transactions, 1, holding.purchase_value || holding.estimated_value);
        calculatedQuantity = ledger.qty;
        investedValue = ledger.invested;
        currentValue = holding.estimated_value;
        break;
      }
    }

    const gainLoss = holding.asset_category === "cash" ? 0 : currentValue - investedValue;
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

  const totalGainLossPercentage = totalInvestedValue > 0 ? (totalGainLoss / totalInvestedValue) * 100 : 0;

  return {
    totalCurrentValue,
    totalInvestedValue,
    totalGainLoss,
    totalGainLossPercentage,
    categoryValues,
    holdingsWithValuation
  };
}