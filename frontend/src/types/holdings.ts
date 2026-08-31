export type AssetCategoryType = "cash" | "fd" | "stocks" | "mutual_funds" | "bonds" | "gold" | "other";

export type ValuationSource = "LIVE_MARKET" | "LIVE_NAV" | "ACCOUNT_BALANCE" | "FORMULA" | "MANUAL";

export type TransactionType = "buy" | "sell" | "deposit" | "withdraw" | "maturity" | "reinvest" | "interest";

export interface HoldingTransaction {
  id: string;
  date: string; // ISO
  type: TransactionType;
  quantity: number; // amount, units, or principal
  price: number;    // price per unit, or 1 for cash
}

export interface BaseHolding {
  id: string;
  asset_category: AssetCategoryType;
  name: string;
  notes?: string;
  created_at: string; // ISO
  updated_at: string; // ISO
  transactions: HoldingTransaction[];
  valuation_source?: ValuationSource;
}

export interface StockHolding extends BaseHolding {
  asset_category: "stocks";
  ticker: string;
  exchange: string;
  quantity: number; // Legacy/Fallback
  average_purchase_price: number; // Legacy/Fallback
  invested_value: number; // Legacy/Fallback
}

export interface MutualFundHolding extends BaseHolding {
  asset_category: "mutual_funds";
  amc: string;
  scheme: string; // or ISIN
  plan?: string;
  option?: string;
  units: number; // Legacy/Fallback
  average_purchase_nav: number; // Legacy/Fallback
  invested_value: number; // Legacy/Fallback
}

export interface FixedDepositHolding extends BaseHolding {
  asset_category: "fd";
  institution: string;
  principal: number; // Legacy/Fallback
  interest_rate: number; // percentage
  start_date: string;
  maturity_date: string;
  compounding_frequency: "monthly" | "quarterly" | "half_yearly" | "yearly" | "at_maturity";
  accrued_interest?: number; // manual override
  status: "active" | "matured" | "closed";
}

export interface BondHolding extends BaseHolding {
  asset_category: "bonds";
  quantity: number; // Legacy/Fallback
  purchase_price: number; // Legacy/Fallback
  face_value: number;
  coupon_rate?: number; // percentage
  maturity_date?: string;
  purchase_date?: string;
  current_price?: number; // manual fallback
}

export interface GoldHolding extends BaseHolding {
  asset_category: "gold";
  gold_type: "22K" | "24K"; // Represents purity
  quantity: number; // Legacy/Fallback (grams)
  unit_name: string; // "grams"
  average_purchase_price: number; // Legacy/Fallback
  invested_value: number; // Legacy/Fallback
}

export interface CashHolding extends BaseHolding {
  asset_category: "cash";
  institution?: string;
  balance: number; // Legacy/Fallback
  total_deposited: number; // Legacy/Fallback
  total_withdrawn: number; // Legacy/Fallback
}

export interface OtherAssetHolding extends BaseHolding {
  asset_category: "other";
  description?: string;
  estimated_value: number; // Legacy/Fallback
  purchase_value?: number; // Legacy/Fallback
}

export type AnyHolding = StockHolding | MutualFundHolding | FixedDepositHolding | BondHolding | GoldHolding | CashHolding | OtherAssetHolding;

// Market Data Cache Types
export interface MarketDataCache {
  symbol: string; // Ticker or ISIN
  current_price: number;
  currency: string;
  last_updated: string; // ISO
  status: "live" | "delayed" | "stale" | "unavailable";
}