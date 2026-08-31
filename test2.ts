import { calculatePortfolioValuation } from "./frontend/src/lib/financial/portfolioValuation";
import { AnyHolding, StockHolding } from "./frontend/src/types/holdings";

let holding: StockHolding = {
  id: "test",
  asset_category: "stocks",
  name: "Test",
  ticker: "TST",
  exchange: "NSE",
  quantity: 10,
  average_purchase_price: 100,
  invested_value: 1000,
  transactions: [
    { id: "tx1", date: "2023-01-01", type: "buy", quantity: 10, price: 100 }
  ],
  created_at: "2023-01-01",
  updated_at: "2023-01-01"
};

// Simulate BUY 5 @ 120
holding.transactions.push({ id: "tx2", date: "2023-02-01", type: "buy", quantity: 5, price: 120 });

// Calculate
let result = calculatePortfolioValuation([holding], { "TST": { symbol: "TST", current_price: 130, currency: "INR", last_updated: "", status: "live" } } as any);
let val = result.holdingsWithValuation[0];
console.log(`After BUY 5 @ 120: Qty=${val.calculatedQuantity}, Invested=${val.calculatedInvested}, Current=${val.currentValue}`);

// Simulate SELL 3
holding.transactions.push({ id: "tx3", date: "2023-03-01", type: "sell", quantity: 3, price: 130 });

// Calculate
result = calculatePortfolioValuation([holding], { "TST": { symbol: "TST", current_price: 130, currency: "INR", last_updated: "", status: "live" } } as any);
val = result.holdingsWithValuation[0];
console.log(`After SELL 3: Qty=${val.calculatedQuantity}, Invested=${val.calculatedInvested}, Current=${val.currentValue}`);
