"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import type { FinancialProfile, FinancialProfileResult } from "@/types/financial-profile";

function computeTotals(p: FinancialProfile) {
  const cf = p.cash_flow;
  const totalIncome = cf.monthly_take_home_income + cf.other_monthly_income;
  const totalEssential = cf.housing + cf.food + cf.utilities + cf.transport + cf.insurance + cf.healthcare + cf.other_essential;
  const totalDiscretionary = cf.shopping + cf.dining_out + cf.entertainment + cf.subscriptions + cf.travel_leisure + cf.other_discretionary;
  const totalExpenses = totalEssential + totalDiscretionary;
  const totalCommitments = cf.monthly_debt_payments + cf.existing_monthly_investments;
  const monthlySurplus = totalIncome - totalExpenses - totalCommitments;

  const a = p.assets;
  const totalAssets = a.cash_bank + a.fd + a.mutual_funds + a.stocks_equity + a.bonds_debt + a.gold + a.other_assets;
  const totalLiabilities = p.liabilities.outstanding_loans + p.liabilities.other_liabilities;
  const netWorth = totalAssets - totalLiabilities;

  return { totalIncome, totalEssential, totalDiscretionary, totalExpenses, totalCommitments, monthlySurplus, totalAssets, totalLiabilities, netWorth };
}

export default function ReviewPage() {
  const { session, setProfile } = useFinSyncSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = session?.profile_input;
  
  if (!profile) {
    return (
      <div className="mx-auto mt-20 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-white">No profile data found</h1>
        <p className="mt-4 text-slate-400">Please start the onboarding process.</p>
        <Link href="/profile" className="mt-6 inline-block primary-button">Start Onboarding</Link>
      </div>
    );
  }

  const totals = computeTotals(profile);
  
  const handleEdit = (step: number) => {
    router.push(`/profile?step=${step}`);
  };

  const handleAnalyze = () => { router.push("/profile/analyze"); };

  return (
    <div className="mx-auto w-full max-w-4xl py-10">
      <header className="mb-8">
        <p className="eyebrow">Final Step</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Review Your Information</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Please verify all the details you've entered before we generate your educational financial plan.</p>
      </header>

      <div className="onboarding-card">
        <ReviewScreen profile={profile} totals={totals} onEdit={handleEdit} />
        
        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-10 flex items-center justify-end gap-4 border-t border-white/10 pt-6">
          <button 
            type="button" 
            onClick={handleAnalyze} 
            disabled={loading} 
            className="primary-button disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Analyzingâ€¦" : "Confirm & Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Review Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface ReviewProps {
  profile: FinancialProfile;
  totals: ReturnType<typeof computeTotals>;
  onEdit: (step: number) => void;
}

function ReviewScreen({ profile, totals, onEdit }: ReviewProps) {
  const p = profile;
  const cf = p.cash_flow;

  return (
    <div className="space-y-4">
      {/* About You */}
      <ReviewSection title="About You" onEdit={() => onEdit(0)}>
        <ReviewRow label="Age" value={p.personal.age || "â€”"} />
        <ReviewRow label="Occupation" value={p.personal.occupation} />
        <ReviewRow label="Dependents" value={p.personal.dependents} />
      </ReviewSection>

      {/* Monthly Cash Flow */}
      <ReviewSection title="Monthly Cash Flow" onEdit={() => onEdit(1)}>
        <ReviewSubheading text="Income" />
        <ReviewRow label="Take-home income" value={formatRupees(cf.monthly_take_home_income)} />
        <ReviewRow label="Other income" value={formatRupees(cf.other_monthly_income)} />
        <ReviewCalc label="Total monthly income" value={formatRupees(totals.totalIncome)} />

        <ReviewSubheading text="Essential Expenses" />
        <ReviewRow label="Housing / Rent" value={formatRupees(cf.housing)} />
        <ReviewRow label="Food / Groceries" value={formatRupees(cf.food)} />
        <ReviewRow label="Utilities" value={formatRupees(cf.utilities)} />
        <ReviewRow label="Transport" value={formatRupees(cf.transport)} />
        <ReviewRow label="Insurance" value={formatRupees(cf.insurance)} />
        <ReviewRow label="Healthcare / Medical" value={formatRupees(cf.healthcare)} />
        <ReviewRow label="Other essential" value={formatRupees(cf.other_essential)} />
        <ReviewCalc label="Total essential expenses" value={formatRupees(totals.totalEssential)} />

        <ReviewSubheading text="Discretionary Expenses" />
        <ReviewRow label="Shopping" value={formatRupees(cf.shopping)} />
        <ReviewRow label="Dining out" value={formatRupees(cf.dining_out)} />
        <ReviewRow label="Entertainment" value={formatRupees(cf.entertainment)} />
        <ReviewRow label="Subscriptions" value={formatRupees(cf.subscriptions)} />
        <ReviewRow label="Travel / Leisure" value={formatRupees(cf.travel_leisure)} />
        <ReviewRow label="Other discretionary" value={formatRupees(cf.other_discretionary)} />
        <ReviewCalc label="Total discretionary expenses" value={formatRupees(totals.totalDiscretionary)} />

        <ReviewSubheading text="Financial Commitments" />
        <ReviewRow label="Debt / EMI payments" value={formatRupees(cf.monthly_debt_payments)} />
        <ReviewRow label="Existing investments / SIPs" value={formatRupees(cf.existing_monthly_investments)} />
        <ReviewCalc label="Monthly surplus" value={formatRupees(totals.monthlySurplus)} highlight />
      </ReviewSection>

      {/* Assets */}
      <ReviewSection title="What You Own" onEdit={() => onEdit(2)}>
        <ReviewRow label="Cash / Bank" value={formatRupees(p.assets.cash_bank)} />
        <ReviewRow label="Fixed Deposits" value={formatRupees(p.assets.fd)} />
        <ReviewRow label="Mutual Funds" value={formatRupees(p.assets.mutual_funds)} />
        <ReviewRow label="Stocks / Equity" value={formatRupees(p.assets.stocks_equity)} />
        <ReviewRow label="Bonds / Debt" value={formatRupees(p.assets.bonds_debt)} />
        <ReviewRow label="Gold" value={formatRupees(p.assets.gold)} />
        <ReviewRow label="Other assets" value={formatRupees(p.assets.other_assets)} />
        <ReviewCalc label="Total assets" value={formatRupees(totals.totalAssets)} highlight />
      </ReviewSection>

      {/* Liabilities & Safety */}
      <ReviewSection title="What You Owe & Safety" onEdit={() => onEdit(3)}>
        <ReviewRow label="Outstanding loans" value={formatRupees(p.liabilities.outstanding_loans)} />
        <ReviewRow label="Other liabilities" value={formatRupees(p.liabilities.other_liabilities)} />
        <ReviewCalc label="Total liabilities" value={formatRupees(totals.totalLiabilities)} />
        <ReviewRow label="Emergency fund" value={formatRupees(p.safety.emergency_savings)} />
        <ReviewCalc label="Net worth" value={formatRupees(totals.netWorth)} highlight />
      </ReviewSection>

      {/* Risk */}
      <ReviewSection title="Risk & Investment Behaviour" onEdit={() => onEdit(4)}>
        <ReviewRow label="Investment experience" value={p.risk.investment_experience} />
        <ReviewRow label="20% decline response" value={p.risk.market_loss_reaction} />
        <ReviewRow label="Investment horizon" value={p.risk.investment_horizon} />
        <ReviewRow label="Income stability" value={`${p.risk.income_stability}/5`} />
      </ReviewSection>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-emerald-400/40">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-emerald-300">{title}</h2>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-slate-400 transition-colors hover:text-emerald-300">Edit</button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-200">{value}</dd>
    </div>
  );
}

function ReviewSubheading({ text }: { text: string }) {
  return <p className="mt-3 mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">{text}</p>;
}

function ReviewCalc({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="mt-1 flex justify-between gap-4 border-t border-white/10 pt-2 text-sm">
      <dt className="font-semibold text-slate-400">{label}</dt>
      <dd className={`text-right font-bold ${highlight ? "text-emerald-300" : "text-slate-200"}`}>{value}</dd>
    </div>
  );
}
