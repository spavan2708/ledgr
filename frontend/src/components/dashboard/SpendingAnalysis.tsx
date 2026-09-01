"use client";

import React, { useState, useEffect } from "react";
import { FinancialProfile } from "@/types/financial-profile";
import { formatRupees } from "@/lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SpendingAnalysisProps {
  profile: FinancialProfile | null;
  monthlySurplus: number;
}

export function SpendingAnalysis({ profile, monthlySurplus }: SpendingAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!profile || !profile.cash_flow) {
    return (
      <div className="space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">Spending Analysis</h2>
          <p className="text-sm text-slate-400">Add your monthly expenses in Financial Profile to see your spending analysis.</p>
        </section>
      </div>
    );
  }

  const { cash_flow } = profile;

  const expenses = [
    // Essential
    { name: "Housing / Rent", amount: cash_flow.housing, type: "essential" },
    { name: "Food / Groceries", amount: cash_flow.food, type: "essential" },
    { name: "Utilities", amount: cash_flow.utilities, type: "essential" },
    { name: "Transport", amount: cash_flow.transport, type: "essential" },
    { name: "Insurance", amount: cash_flow.insurance, type: "essential" },
    { name: "Healthcare / Medical", amount: cash_flow.healthcare, type: "essential" },
    { name: "Other Essential", amount: cash_flow.other_essential, type: "essential" },
    // Discretionary
    { name: "Shopping", amount: cash_flow.shopping, type: "discretionary" },
    { name: "Dining Out", amount: cash_flow.dining_out, type: "discretionary" },
    { name: "Entertainment", amount: cash_flow.entertainment, type: "discretionary" },
    { name: "Subscriptions", amount: cash_flow.subscriptions, type: "discretionary" },
    { name: "Travel / Leisure", amount: cash_flow.travel_leisure, type: "discretionary" },
    { name: "Other Discretionary", amount: cash_flow.other_discretionary, type: "discretionary" },
    // Commitments
    { name: "Debt / EMI", amount: cash_flow.monthly_debt_payments, type: "commitment" },
    { name: "Existing Investments", amount: cash_flow.existing_monthly_investments, type: "commitment" },
  ];

  const validExpenses = expenses.filter((e) => e.amount > 0).sort((a, b) => b.amount - a.amount);
  
  if (validExpenses.length === 0) {
    return (
      <div className="space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">Spending Analysis</h2>
          <p className="text-sm text-slate-400">Add your monthly expenses in Financial Profile to see your spending analysis.</p>
        </section>
      </div>
    );
  }

  const totalEssential = expenses.filter(e => e.type === "essential").reduce((sum, e) => sum + e.amount, 0);
  const totalDiscretionary = expenses.filter(e => e.type === "discretionary").reduce((sum, e) => sum + e.amount, 0);
  const totalCommitments = expenses.filter(e => e.type === "commitment").reduce((sum, e) => sum + e.amount, 0);
  
  const totalLivingExpenses = totalEssential + totalDiscretionary;
  const totalOutflow = totalLivingExpenses + totalCommitments;

  const essentialPct = totalLivingExpenses > 0 ? Math.round((totalEssential / totalLivingExpenses) * 100) : 0;
  const discretionaryPct = totalLivingExpenses > 0 ? Math.round((totalDiscretionary / totalLivingExpenses) * 100) : 0;

  const chartData = [
    { name: "Essential", value: totalEssential, color: "#34d399" }, // emerald-400
    { name: "Discretionary", value: totalDiscretionary, color: "#38bdf8" }, // sky-400
    { name: "Commitments", value: totalCommitments, color: "#fbbf24" }, // amber-400
  ].filter(d => d.value > 0);

  const largestExpense = validExpenses[0];
  const largestDiscretionary = validExpenses.find(e => e.type === "discretionary");

  return (
    <div className="space-y-8">
      {/* 1. Expense Breakdown Graph (Recharts Donut) */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">Expense Breakdown</h2>
        
        {mounted && (
          <div className="h-[250px] w-full relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatRupees(Number(value))}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400">Total Outflow</span>
              <span className="text-xl font-bold text-white">{formatRupees(totalOutflow)}</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 pb-8 border-b border-white/5">
          {chartData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-sm text-slate-300">{d.name} <span className="font-semibold text-white ml-1">{formatRupees(d.value)}</span></span>
            </div>
          ))}
        </div>

        {/* Expense List */}
        <div className="space-y-4">
          {validExpenses.map((expense, idx) => {
            const barColor = expense.type === "essential" ? "bg-emerald-400" : expense.type === "discretionary" ? "bg-sky-400" : "bg-amber-400";
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-8 rounded-full ${barColor}`} />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{expense.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{expense.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatRupees(expense.amount)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Spending Insights */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
        <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">Spending Insights</h2>
        <div className="space-y-4">
          {largestExpense && (
            <div className="flex justify-between py-2 text-sm border-b border-white/5">
              <span className="text-slate-400">Largest expense</span>
              <span className="text-white text-right font-medium">{largestExpense.name} &middot; {formatRupees(largestExpense.amount)}</span>
            </div>
          )}
          {totalLivingExpenses > 0 && (
            <>
              <div className="flex justify-between py-2 text-sm border-b border-white/5">
                <span className="text-slate-400">Essential spending</span>
                <span className="text-white text-right font-medium">{essentialPct}% of living expenses</span>
              </div>
              <div className="flex justify-between py-2 text-sm border-b border-white/5">
                <span className="text-slate-400">Discretionary spending</span>
                <span className="text-white text-right font-medium">{discretionaryPct}% of living expenses</span>
              </div>
            </>
          )}
          {largestDiscretionary && (
            <div className="flex justify-between py-2 text-sm border-b border-white/5">
              <span className="text-slate-400">Largest discretionary</span>
              <span className="text-white text-right font-medium">{largestDiscretionary.name} &middot; {formatRupees(largestDiscretionary.amount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 text-sm border-b border-white/5">
            <span className="text-slate-400">Monthly surplus</span>
            <span className="text-emerald-300 text-right font-bold">{formatRupees(monthlySurplus)}</span>
          </div>
          {largestExpense && totalOutflow > 0 && (largestExpense.amount / totalOutflow) > 0.3 && (
            <div className="mt-4 rounded-xl bg-amber-400/10 p-4 border border-amber-400/20">
              <p className="text-sm text-amber-200">
                <span className="font-bold mr-1">Note:</span>
                {largestExpense.name} accounts for {Math.round((largestExpense.amount / totalOutflow) * 100)}% of your total monthly outflow.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. AI Insight Summary */}
      <section className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <h2 className="font-bold text-sky-400 uppercase tracking-widest text-xs">AI Insight Summary</h2>
        </div>
        <p className="text-sm text-sky-100/90 leading-relaxed">
          {essentialPct <= 50 
            ? `Your essential spending is well optimized at ${essentialPct}%, leaving ample room for your ${discretionaryPct}% discretionary lifestyle choices.` 
            : `Your essential spending is quite high at ${essentialPct}%. Consider reviewing major fixed costs to free up cash flow.`
          }
          {" "}
          {monthlySurplus > 0 
            ? `You have a healthy surplus of ${formatRupees(monthlySurplus)} which is perfect for building wealth.` 
            : `Currently, your outflow exceeds your income. Prioritize reducing discretionary expenses to regain a surplus.`
          }
        </p>
      </section>
    </div>
  );
}
