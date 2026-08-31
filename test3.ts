import { calculatePortfolioValuation } from "./frontend/src/lib/financial/portfolioValuation";
import { AnyHolding } from "./frontend/src/types/holdings";

let testHoldings: AnyHolding[] = [];
const pushTx = (h: AnyHolding, tx: any) => {
  if (!h.transactions) h.transactions = [];
  h.transactions.push(tx);
};

// 1. Stock
let stock: AnyHolding = {
  id: "s1", asset_category: "stocks", name: "S1", ticker: "S1", exchange: "NSE",
  quantity: 10, average_purchase_price: 100, invested_value: 1000,
  transactions: [{ id: "tx1", date: "2023-01-01", type: "buy", quantity: 10, price: 100 }],
  created_at: "", updated_at: ""
};
pushTx(stock, { id: "tx2", date: "2023-02-01", type: "buy", quantity: 5, price: 120 });
pushTx(stock, { id: "tx3", date: "2023-03-01", type: "sell", quantity: 3, price: 130 });
testHoldings.push(stock);

// 2. MF
let mf: AnyHolding = {
  id: "m1", asset_category: "mutual_funds", name: "M1", scheme: "M1", amc: "AMC",
  units: 100, average_purchase_nav: 30, invested_value: 3000,
  transactions: [{ id: "tx4", date: "2023-01-01", type: "buy", quantity: 100, price: 30 }],
  created_at: "", updated_at: ""
};
pushTx(mf, { id: "tx5", date: "2023-02-01", type: "buy", quantity: 50, price: 32 });
pushTx(mf, { id: "tx6", date: "2023-03-01", type: "sell", quantity: 25, price: 35 });
testHoldings.push(mf);

// 3. Cash
let cash: AnyHolding = {
  id: "c1", asset_category: "cash", name: "C1", balance: 50000, total_deposited: 50000, total_withdrawn: 0,
  transactions: [{ id: "tx7", date: "2023-01-01", type: "deposit", quantity: 50000, price: 1 }],
  created_at: "", updated_at: ""
};
pushTx(cash, { id: "tx8", date: "2023-02-01", type: "deposit", quantity: 20000, price: 1 });
pushTx(cash, { id: "tx9", date: "2023-03-01", type: "withdraw", quantity: 15000, price: 1 });
testHoldings.push(cash);

// 4. Bond
let bond: AnyHolding = {
  id: "b1", asset_category: "bonds", name: "B1", quantity: 10, purchase_price: 100, face_value: 100,
  transactions: [{ id: "tx10", date: "2023-01-01", type: "buy", quantity: 10, price: 100 }],
  created_at: "", updated_at: ""
};
pushTx(bond, { id: "tx11", date: "2023-02-01", type: "sell", quantity: 3, price: 100 });
testHoldings.push(bond);

// 5. Gold
let gold: AnyHolding = {
  id: "g1", asset_category: "gold", name: "G1", gold_type: "physical", unit_name: "grams",
  quantity: 100, average_purchase_price: 5000, invested_value: 500000,
  transactions: [{ id: "tx12", date: "2023-01-01", type: "buy", quantity: 100, price: 5000 }],
  created_at: "", updated_at: ""
};
pushTx(gold, { id: "tx13", date: "2023-02-01", type: "sell", quantity: 20, price: 5500 });
testHoldings.push(gold);

// 6. Other
let other: AnyHolding = {
  id: "o1", asset_category: "other", name: "O1", estimated_value: 6500000, purchase_value: 5000000,
  transactions: [{ id: "tx14", date: "2023-01-01", type: "buy", quantity: 1, price: 5000000 }],
  created_at: "", updated_at: ""
};
testHoldings.push(other);

let result = calculatePortfolioValuation(testHoldings, { 
  "S1": { symbol: "S1", current_price: 130, currency: "INR", last_updated: "", status: "live" },
  "M1": { symbol: "M1", current_price: 35, currency: "INR", last_updated: "", status: "live" }
} as any);

result.holdingsWithValuation.forEach(h => {
  console.log(`${h.asset_category}: Qty=${h.calculatedQuantity}, Invested=${h.calculatedInvested}, Current=${h.currentValue}`);
});

console.log("Total Portfolio:", result.totalCurrentValue);
console.log("Total Invested:", result.totalInvestedValue);
