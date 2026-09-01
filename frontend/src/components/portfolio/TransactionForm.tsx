"use client";

import { useState } from "react";
import { formatRupees } from "@/lib/formatters";

interface TransactionFormProps {
  type: "buy" | "sell" | "deposit" | "withdraw" | "maturity" | "update_valuation";
  unitLabel: string; // "shares", "units", "amount", "grams"
  currentPrice?: number;
  maxQuantity?: number;
  defaultQuantity?: number;
  onSubmit: (quantity: number, price: number, date: string) => void;
  onCancel: () => void;
}

export function TransactionForm({ type, unitLabel, currentPrice, maxQuantity, defaultQuantity, onSubmit, onCancel, isFixedPrice }: TransactionFormProps & { isFixedPrice?: boolean }) {
  const [quantity, setQuantity] = useState(defaultQuantity !== undefined ? defaultQuantity.toString() : "");
  const [price, setPrice] = useState(currentPrice ? currentPrice.toString() : "1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    
    if (isNaN(q) || q <= 0) {
      if (type !== "update_valuation") {
        alert("Invalid quantity");
        return;
      }
    }
    if (type === "sell" && maxQuantity !== undefined && q > maxQuantity) {
      alert(`Cannot sell more than you own (${maxQuantity} ${unitLabel}).`);
      return;
    }
    if (type === "withdraw" && maxQuantity !== undefined && q > maxQuantity) {
      alert(`Cannot withdraw more than available balance (${maxQuantity}).`);
      return;
    }
    if (type === "maturity" && maxQuantity !== undefined && q > maxQuantity) {
      alert(`Cannot mature more than available principal (${maxQuantity}).`);
      return;
    }
    
    onSubmit(q, type === "update_valuation" ? 1 : p, new Date(date).toISOString());
  };

  const isMoneyOnly = unitLabel === "amount";
  const isUpdateValuation = type === "update_valuation";
  const isMaturity = type === "maturity";

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 p-5 rounded-xl space-y-4">
      <h3 className="font-bold text-white capitalize">{type.replace("_", " ")} Transaction</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {isUpdateValuation ? (
          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Estimated Value</label>
             <input 
               type="number" 
               className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
               value={quantity}
               onChange={e => setQuantity(e.target.value)}
               required
               min="0"
               step="any"
             />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isMoneyOnly ? "Amount" : `Quantity (${unitLabel})`}
            </label>
            <input 
              type="number" 
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              min="0.0001"
              step="any"
              max={(type === "sell" || type === "withdraw" || type === "maturity") ? maxQuantity : undefined}
            />
          </div>
        )}
        
        {(!isMoneyOnly && !isUpdateValuation && !isMaturity) && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price / Rate</label>
            <input 
              type="number" 
              className={`w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500 ${isFixedPrice ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={price}
              onChange={e => setPrice(e.target.value)}
              readOnly={isFixedPrice}
              required
              min="0.01"
              step="any"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
          <input 
            type="date" 
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-emerald-500"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className={`flex-1 ${type === "sell" || type === "withdraw" ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"} font-bold py-2 rounded-lg transition capitalize`}>
          Confirm {type.replace("_", " ")}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2 rounded-lg transition">
          Cancel
        </button>
      </div>
    </form>
  );
}
