import { calculatePortfolioValuation } from "./frontend/src/lib/financial/portfolioValuation";
import { AnyHolding } from "./frontend/src/types/holdings";

let holding: AnyHolding = {
  id: "m1", asset_category: "mutual_funds", name: "M1", scheme: "M1", amc: "AMC",
  units: 110.4, average_purchase_nav: 30, invested_value: 3312,
  transactions: [{ id: "tx1", date: "2023-01-01", type: "buy", quantity: 110.4, price: 30 }],
  created_at: "", updated_at: ""
};

holding.transactions.push({ id: "tx2", date: "2023-03-01", type: "sell", quantity: 110.4, price: 35 });

let result = calculatePortfolioValuation([holding], {} as any);
let val = result.holdingsWithValuation[0];

console.log(`Zero Balance Check: Qty=${val.calculatedQuantity}, Invested=${val.calculatedInvested}, Current=${val.currentValue}`);
