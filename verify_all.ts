import { calculatePortfolioValuation, computeCompoundInterest } from "./frontend/src/lib/financial/portfolioValuation";
import { CashHolding, FixedDepositHolding, BondHolding, GoldHolding } from "./frontend/src/types/holdings";

// 1. CASH TEST
let cash: CashHolding = {
  id: "c1", asset_category: "cash", name: "HDFC", balance: 50000, total_deposited: 50000, total_withdrawn: 0,
  transactions: [
    { id: "tx1", date: "2023-01-01", type: "deposit", quantity: 50000, price: 1 },
    { id: "tx2", date: "2023-01-02", type: "deposit", quantity: 20000, price: 1 },
    { id: "tx3", date: "2023-01-03", type: "withdraw", quantity: 15000, price: 1 }
  ],
  created_at: "", updated_at: ""
};

let valCash = calculatePortfolioValuation([cash], {}).holdingsWithValuation[0];
console.log("CASH TEST:");
console.log("Expected: 55000 balance, 0 invested, 0 gain/loss");
console.log(`Actual:   ${valCash.calculatedQuantity} balance, ${valCash.calculatedInvested} invested, ${valCash.gainLoss} gain/loss\n`);

// 2. FD TEST
let fd: FixedDepositHolding = {
  id: "fd1", asset_category: "fd", name: "SBI FD", institution: "SBI",
  principal: 100000, interest_rate: 10, start_date: "2026-01-01T00:00:00.000Z", maturity_date: "2027-01-01T00:00:00.000Z",
  compounding_frequency: "yearly", status: "active",
  transactions: [{ id: "tx1", date: "2026-01-01T00:00:00.000Z", type: "deposit", quantity: 100000, price: 1 }],
  created_at: "", updated_at: ""
};
let valFD = calculatePortfolioValuation([fd], {}).holdingsWithValuation[0];
console.log("FD TEST:");
console.log(`Valuation: ${valFD.currentValue}`);


// 3. BOND TEST
let bond: BondHolding = {
  id: "b1", asset_category: "bonds", name: "NHAI", quantity: 100, purchase_price: 1020, current_price: 1050, face_value: 1000,
  purchase_date: "2026-01-01",
  transactions: [
    { id: "tx1", date: "2026-01-01", type: "buy", quantity: 100, price: 1020 },
    { id: "tx2", date: "2026-02-01", type: "buy", quantity: 20, price: 1030 },
    { id: "tx3", date: "2026-03-01", type: "sell", quantity: 30, price: 1050 }
  ],
  created_at: "", updated_at: ""
};
let valBond = calculatePortfolioValuation([bond], {}).holdingsWithValuation[0];
console.log("\nBOND TEST:");
console.log(`Expected Qty: 90. Actual Qty: ${valBond.calculatedQuantity}`);
console.log(`Expected Cost Basis: 91950. Actual Cost Basis: ${valBond.calculatedInvested}`);

// 4. GOLD TEST
let gold: GoldHolding = {
  id: "g1", asset_category: "gold", name: "Gold Coins", gold_type: "24K", quantity: 50, unit_name: "grams", average_purchase_price: 6000, invested_value: 300000,
  transactions: [
    { id: "tx1", date: "2026-01-01", type: "buy", quantity: 50, price: 6000 },
    { id: "tx2", date: "2026-02-01", type: "buy", quantity: 10, price: 6200 },
    { id: "tx3", date: "2026-03-01", type: "sell", quantity: 20, price: 6500 }
  ],
  created_at: "", updated_at: ""
};
let valGold = calculatePortfolioValuation([gold], {}).holdingsWithValuation[0];
console.log("\nGOLD TEST:");
console.log(`Expected Qty: 40. Actual Qty: ${valGold.calculatedQuantity}`);
console.log(`Expected Cost Basis: 24133.33... Actual Cost Basis: ${valGold.calculatedInvested}`);

// 5. OTHER ASSET TEST
import { OtherAssetHolding } from "./frontend/src/types/holdings";
let other: OtherAssetHolding = {
  id: "o1", asset_category: "other", name: "House", estimated_value: 6500000, purchase_value: 5000000,
  transactions: [
    { id: "tx1", date: "2020-01-01", type: "buy", quantity: 5000000, price: 1 }
  ],
  created_at: "", updated_at: ""
};
let valOther = calculatePortfolioValuation([other], {}).holdingsWithValuation[0];
console.log("\nOTHER ASSET TEST:");
console.log(`Expected Invested: 5000000. Actual Invested: ${valOther.calculatedInvested}`);
console.log(`Expected Value: 6500000. Actual Value: ${valOther.currentValue}`);
console.log(`Expected Gain: 1500000. Actual Gain: ${valOther.gainLoss}`);
