"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";
import type { AssetCategoryType, AnyHolding, StockHolding, MutualFundHolding } from "@/types/holdings";
import { TransactionForm } from "@/components/portfolio/TransactionForm";
import { syncHoldingsToProfile } from "@/lib/financial/syncHoldings";
import { generateFinancialPlan } from "@/lib/financial/engine";

export default function HoldingDetailPage({ params }: { params: Promise<{ category: string, id: string }> }) {
  const { category, id } = use(params);
  const router = useRouter();
  const { session, setHoldings, setProfile } = useFinSyncSession();
  
  const [txType, setTxType] = useState<"buy" | "sell" | "deposit" | "withdraw" | "maturity" | "update_valuation" | null>(null);

  const holdings = session?.holdings || [];
  const marketData = session?.market_data || {};
  const goldData = session?.gold_data;

  const valuation = calculatePortfolioValuation(holdings, marketData, goldData);
  const holding = valuation.holdingsWithValuation.find(h => h.id === id && h.asset_category === category);

  if (!holding) {
    return <div className="text-center p-10 text-white">Holding not found</div>;
  }

  const handleTransaction = (quantity: number, price: number, date: string) => {
    if (!session) return;
    
    const newHoldings = [...holdings];
    const holdingIndex = newHoldings.findIndex(h => h.id === holding.id);
    if (holdingIndex === -1) return;

    // Clone the holding
    const updated = JSON.parse(JSON.stringify(newHoldings[holdingIndex])) as AnyHolding;
    
    if (txType === "update_valuation") {
      if (updated.asset_category === "other" || updated.asset_category === "gold" || updated.asset_category === "bonds") {
         (updated as any).estimated_value = quantity; // Using quantity field for the new value
         (updated as any).current_price = quantity; // bonds fallback
      }
    } else {
      // Ensure legacy holdings have a starting ledger
      if (!updated.transactions || updated.transactions.length === 0) {
        let initialQty = 0;
        let initialInvested = 0;
        if (updated.asset_category === 'stocks') { initialQty = updated.quantity; initialInvested = updated.invested_value; }
        else if (updated.asset_category === 'mutual_funds') { initialQty = updated.units; initialInvested = updated.invested_value; }
        else if (updated.asset_category === 'cash') { initialQty = updated.balance; initialInvested = updated.balance; }
        else if (updated.asset_category === 'fd') { initialQty = updated.principal; initialInvested = updated.principal; }
        else if (updated.asset_category === 'bonds') { initialQty = updated.quantity; initialInvested = updated.quantity * updated.purchase_price; }
        else if (updated.asset_category === 'gold') { initialQty = updated.quantity; initialInvested = updated.invested_value; }
        else if (updated.asset_category === 'other') { initialQty = 1; initialInvested = updated.purchase_value || updated.estimated_value; }

        const pricePerUnit = initialQty > 0 ? initialInvested / initialQty : 1;
        const initType = (updated.asset_category === 'cash' || updated.asset_category === 'fd') ? 'deposit' : 'buy';
        updated.transactions = [{
          id: crypto.randomUUID(),
          type: initType,
          quantity: initialQty,
          price: pricePerUnit,
          date: updated.created_at || new Date().toISOString()
        }];
      }

      updated.transactions.push({
        id: crypto.randomUUID(),
        type: txType as any,
        quantity,
        price,
        date
      });

      if (updated.asset_category === "fd" && txType === "maturity") {
        updated.status = "matured";
      }
    }
    
    updated.updated_at = new Date().toISOString();
    newHoldings[holdingIndex] = updated;
    
    setHoldings(newHoldings);
    
    if (session.profile_input) {
      const newProfile = syncHoldingsToProfile(newHoldings, marketData, session.profile_input);
      const plan = generateFinancialPlan(newProfile);
      if (session.financial_plan?.unifiedRiskFactor) plan.unifiedRiskFactor = session.financial_plan.unifiedRiskFactor;
      if (session.financial_plan?.assetAllocation) plan.assetAllocation = session.financial_plan.assetAllocation; 
      setProfile(newProfile, plan, session.profile_analysis);
    }
    
    setTxType(null);
  };

  const getUnitLabel = () => {
    switch (holding.asset_category) {
      case "stocks": return "shares";
      case "mutual_funds": return "units";
      case "cash": return "amount";
      case "fd": return "amount";
      case "bonds": return "units";
      case "gold": return "grams";
      case "other": return "amount";
      default: return "units";
    }
  };

  const getMaxQuantity = () => {
    if (txType === "sell" || txType === "withdraw" || txType === "maturity") {
      return holding.calculatedQuantity;
    }
    return undefined;
  };

  const getCurrentPriceFallback = () => {
    if (holding.asset_category === "stocks") {
      return marketData[(holding as StockHolding).ticker]?.current_price || (holding as StockHolding).average_purchase_price;
    }
    if (holding.asset_category === "mutual_funds") {
      return marketData[(holding as MutualFundHolding).scheme]?.current_price || (holding as MutualFundHolding).average_purchase_nav;
    }
    if (holding.asset_category === "bonds") return (holding as any).current_price || (holding as any).purchase_price;
    if (holding.asset_category === "gold") {
      const purity = (holding as any).gold_type;
      return (goldData && goldData.prices && goldData.prices[purity]) || (holding as any).average_purchase_price;
    }
    if (holding.asset_category === "other") return (holding as any).estimated_value;
    return 1;
  };

  const isCash = holding.asset_category === "cash";
  const isFD = holding.asset_category === "fd";

  const renderActionButtons = () => {
    switch (holding.asset_category) {
      case "stocks":
        return (
          <>
            <button onClick={() => setTxType("buy")} className="primary-button text-xs py-1.5">Buy More</button>
            <button onClick={() => setTxType("sell")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Sell</button>
          </>
        );
      case "mutual_funds":
        return (
          <>
            <button onClick={() => setTxType("buy")} className="primary-button text-xs py-1.5">Buy More</button>
            <button onClick={() => setTxType("sell")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Redeem</button>
          </>
        );
      case "cash":
        return (
          <>
            <button onClick={() => setTxType("deposit")} className="primary-button text-xs py-1.5">Deposit</button>
            <button onClick={() => setTxType("withdraw")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Withdraw</button>
          </>
        );
      case "fd":
        return (
          <>
            <button onClick={() => setTxType("deposit")} className="primary-button text-xs py-1.5">Invest</button>
            <button onClick={() => setTxType("maturity")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Close / Mature</button>
          </>
        );
      case "bonds":
        return (
          <>
            <button onClick={() => setTxType("buy")} className="primary-button text-xs py-1.5">Buy More</button>
            <button onClick={() => setTxType("sell")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Sell</button>
            <button onClick={() => setTxType("maturity")} className="primary-button text-xs py-1.5">Mature</button>
          </>
        );
      case "gold":
        return (
          <>
            <button onClick={() => setTxType("buy")} className="primary-button text-xs py-1.5">Buy</button>
            <button onClick={() => setTxType("sell")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Sell</button>
          </>
        );
      case "other":
        return (
          <>
            <button onClick={() => setTxType("buy")} className="primary-button text-xs py-1.5">Add / Increase</button>
            <button onClick={() => setTxType("sell")} className="secondary-button border-rose-500/50 text-rose-400 hover:bg-rose-500/10 text-xs py-1.5">Reduce / Dispose</button>
            <button onClick={() => setTxType("update_valuation")} className="primary-button text-xs py-1.5">Update Valuation</button>
          </>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-10 space-y-8">
      <Link href={`/portfolio/${category}`} className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        ← Back to {category}
      </Link>

      <header className="mb-10 flex flex-col md:flex-row justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">{holding.name}</h1>
          <div className="flex gap-2">
            {holding.asset_category === 'stocks' && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded uppercase font-bold">{(holding as StockHolding).exchange}: {(holding as StockHolding).ticker}</span>}
            {holding.asset_category === 'mutual_funds' && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold">{(holding as MutualFundHolding).amc}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
           <button onClick={() => {
             const mapping: Record<string, string> = { stocks: 'stock', mutual_funds: 'mf', bonds: 'bond', other: 'other', fd: 'fd', cash: 'cash', gold: 'gold' };
             const route = mapping[holding.asset_category] || holding.asset_category;
             router.push(`/portfolio/add/${route}?editId=${holding.id}`);
           }} className="secondary-button text-xs py-1.5">Edit Metadata</button>
           {renderActionButtons()}
        </div>
      </header>
      
      {txType && (
        <div className="mb-8">
           <TransactionForm 
             type={txType} 
             unitLabel={getUnitLabel()}
             currentPrice={getCurrentPriceFallback()}
             maxQuantity={getMaxQuantity()}
             isFixedPrice={holding.asset_category === "gold"}
             onSubmit={handleTransaction}
             onCancel={() => setTxType(null)}
           />
        </div>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatBox 
           label={
             isCash ? "Cash Balance" : 
             (holding.asset_category === "bonds" || holding.asset_category === "gold" || holding.asset_category === "other") ? "Estimated Current Value" :
             "Current Value"
           } 
           value={formatRupees(holding.currentValue)} 
           highlight 
         />
         {!isCash && (
           <StatBox 
             label={isFD ? "Principal" : "Cost Basis"} 
             value={formatRupees(holding.calculatedInvested)} 
           />
         )}
         
         {!isCash && !isFD && (
           <>
             <StatBox 
               label="Overall Gain/Loss" 
               value={`${holding.gainLoss > 0 ? '+' : ''}${formatRupees(holding.gainLoss)}`} 
               textColor={holding.gainLoss > 0 ? 'text-emerald-400' : holding.gainLoss < 0 ? 'text-rose-400' : 'text-white'}
             />
             <StatBox 
               label="Gain/Loss %" 
               value={`${holding.gainLossPercentage > 0 ? '+' : ''}${holding.gainLossPercentage.toFixed(2)}%`} 
               textColor={holding.gainLossPercentage > 0 ? 'text-emerald-400' : holding.gainLossPercentage < 0 ? 'text-rose-400' : 'text-white'}
             />
           </>
         )}
         {isFD && (
           <StatBox 
               label="Interest Earned" 
               value={`+${formatRupees(holding.currentValue - holding.calculatedInvested)}`} 
               textColor="text-emerald-400"
             />
         )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Holding Details */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <h2 className="mb-5 font-bold text-emerald-300 uppercase tracking-widest text-sm">Holding Details</h2>
           <div className="space-y-4">
             {holding.asset_category === 'stocks' && (
               <>
                 <Row label="Quantity Held" value={holding.calculatedQuantity.toString()} />
                 <Row label="Average Purchase Price" value={formatRupees(holding.calculatedQuantity > 0 ? holding.calculatedInvested / holding.calculatedQuantity : 0)} />
                 <Row label="Current Market Price" value={formatRupees(marketData[(holding as StockHolding).ticker]?.current_price || (holding as StockHolding).average_purchase_price)} />
                 <Row label="Valuation Source" value="Live Market (Yahoo)" />
                 <Row label="Last Price Update" value={marketData[(holding as StockHolding).ticker]?.last_updated ? new Date(marketData[(holding as StockHolding).ticker].last_updated).toLocaleString() : 'N/A'} />
               </>
             )}
             {holding.asset_category === 'mutual_funds' && (
               <>
                 <Row label="Units Held" value={holding.calculatedQuantity.toString()} />
                 <Row label="Average Purchase NAV" value={formatRupees(holding.calculatedQuantity > 0 ? holding.calculatedInvested / holding.calculatedQuantity : 0)} />
                 <Row label="Latest NAV" value={formatRupees(marketData[(holding as MutualFundHolding).scheme]?.current_price || (holding as MutualFundHolding).average_purchase_nav)} />
                 <Row label="Valuation Source" value="Live NAV (AMFI)" />
                 <Row label="NAV Date" value={marketData[(holding as MutualFundHolding).scheme]?.last_updated ? new Date(marketData[(holding as MutualFundHolding).scheme].last_updated).toLocaleDateString() : 'N/A'} />
               </>
             )}
             {holding.asset_category === 'cash' && (
               <>
                <Row label="Current Balance" value={formatRupees(holding.calculatedQuantity)} />
                <Row label="Valuation Source" value="Account Balance" />
               </>
             )}
             {holding.asset_category === 'fd' && (
               <>
                <Row label="Principal" value={formatRupees(holding.calculatedInvested)} />
                <Row label="Interest Rate" value={`${(holding as any).interest_rate}% p.a.`} />
                <Row label="Maturity Date" value={new Date((holding as any).maturity_date).toLocaleDateString()} />
                <Row label="Status" value={(holding as any).status.toUpperCase()} />
                <Row label="Valuation Source" value="Formula / Compounding" />
               </>
             )}
             {holding.asset_category === 'bonds' && (
               <>
                <Row label="Quantity Held" value={holding.calculatedQuantity.toString()} />
                <Row label="Valuation Source" value="Manual / Estimated" />
               </>
             )}
             {holding.asset_category === 'gold' && (
               <>
                <Row label="Grams Held" value={holding.calculatedQuantity.toString()} />
                <Row label="Valuation Source" value="Manual / Estimated" />
               </>
             )}
             {holding.asset_category === 'other' && (
               <>
                <Row label="Valuation Source" value="Manual / Estimated" />
               </>
             )}
           </div>
        </section>

        {/* Transaction History */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-[400px]">
           <h2 className="mb-5 font-bold text-emerald-300 uppercase tracking-widest text-sm">Transaction History</h2>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {((holding as any).transactions || []).length === 0 ? (
               <p className="text-slate-500 text-sm italic">No transactions recorded.</p>
             ) : (
               ((holding as any).transactions).slice().reverse().map((tx: any) => (
                 <div key={tx.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${tx.type === 'buy' || tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {tx.type === 'buy' || tx.type === 'deposit' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white capitalize">{tx.type}</div>
                        <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="font-bold text-sm text-slate-200">{isCash ? formatRupees(tx.quantity) : `${tx.quantity} ${getUnitLabel()}`}</div>
                      {!isCash && <div className="text-xs text-slate-400">@ {formatRupees(tx.price)}</div>}
                   </div>
                 </div>
               ))
             )}
           </div>
        </section>
      </div>

    </div>
  );
}

function StatBox({ label, value, highlight, textColor }: { label: string; value: string; highlight?: boolean; textColor?: string }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'} p-5 text-center`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${textColor ? textColor : highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
