"use client";

import { useEffect, useState } from "react";
import type { FinancialProfile } from "@/types/financial-profile";
import type { GoalSimulationResponse } from "@/types/goals";
import { calculateUnifiedRiskFactor } from "@/lib/financial/financialRiskFactor";
import type { FinancialRiskFactorResult } from "@/lib/financial/financialRiskFactor";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";

interface UnifiedRiskFactorCardProps {
  profile: FinancialProfile;
  goals: GoalSimulationResponse | null;
  monthlySurplus: number;
  onRiskCalculated?: (result: FinancialRiskFactorResult) => void;
}

interface MLResponse {
  ml_risk_profile: {
    category: string;
    probabilities: {
      Conservative: number;
      Balanced: number;
      Aggressive: number;
    };
    model_version: string;
  };
  error?: string;
}

export function UnifiedRiskFactorCard({ profile, goals, monthlySurplus, onRiskCalculated }: UnifiedRiskFactorCardProps) {
  const [data, setData] = useState<FinancialRiskFactorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const { session } = useFinSyncSession();
  
  useEffect(() => {
    // Skip fetch if we already computed it during Analyze phase
    if (session?.financial_plan?.unifiedRiskFactor) {
      setData(session.financial_plan.unifiedRiskFactor);
      if (onRiskCalculated) onRiskCalculated(session.financial_plan.unifiedRiskFactor);
      setLoading(false);
      return;
    }

    async function fetchML() {
      try {
        const res = await fetch("/api/ml/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, goals }),
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch ML risk profile");
        }
        
        const result: MLResponse = await res.json();
        if (result.error) throw new Error(result.error);
        
        const combined = calculateUnifiedRiskFactor(
          profile,
          result.ml_risk_profile.probabilities,
          monthlySurplus
        );
        setData(combined);
        if (onRiskCalculated) {
          onRiskCalculated(combined);
        }
      } catch (err: any) {
        console.error("ML Prediction Error:", err);
        setError("Risk profile temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchML();
  }, [profile, goals, monthlySurplus, session?.financial_plan?.unifiedRiskFactor, onRiskCalculated]);

  if (loading) {
    return (
      <Card title="Financial Risk Factor">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-10 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Financial Risk Factor">
        <div className="rounded-xl bg-slate-800/50 p-4 text-center text-sm text-slate-400">
          {error || "Risk profile temporarily unavailable."}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Financial Risk Factor">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4">
        <div>
          <span className="text-3xl font-bold text-white">{data.category}</span>
        </div>
        <div className="mt-2 md:mt-0">
          <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Factor: {data.riskFactor} / 10
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Financial Capacity</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-sky-400">{data.capacityScore}</span>
            <span className="text-sm text-slate-400 mb-1">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Objective ability (ML Model)</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Behavioral Tolerance</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-amber-400">{data.behavioralScore}</span>
            <span className="text-sm text-slate-400 mb-1">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Subjective willingness</p>
        </div>
      </div>
      
      {data.investmentCapacityStatus === "unavailable" && (
        <div className="mb-6 rounded-xl bg-rose-400/10 p-4">
          <p className="text-sm text-rose-300">
            <span className="font-bold">Investment capacity unavailable.</span><br />
            You currently have no monthly surplus. Focus on emergency savings and debt reduction before investing.
          </p>
        </div>
      )}

      {/* Expandable Explanation */}
      <div className="border-t border-white/5 pt-4">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <span className="font-medium">How this was calculated</span>
          {showDetails ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </button>
        
        {showDetails && (
          <div className="mt-4 space-y-6 text-sm text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <p className="font-bold text-white mb-2 border-b border-white/5 pb-1">1. Financial Capacity (60% Weight)</p>
              <div className="space-y-2 mb-2">
                <ProgressBar label="Conservative" prob={data.mlProbabilities.Conservative} />
                <ProgressBar label="Balanced" prob={data.mlProbabilities.Balanced} />
                <ProgressBar label="Aggressive" prob={data.mlProbabilities.Aggressive} />
              </div>
              <p className="text-xs text-slate-400 font-mono bg-black/20 p-2 rounded">
                Formula: {data.explanation.capacityFormula} = {data.capacityScore}
              </p>
            </div>

            <div>
              <p className="font-bold text-white mb-2 border-b border-white/5 pb-1">2. Behavioral Risk (40% Weight)</p>
              <ul className="space-y-1 mb-2">
                {Object.entries(data.explanation.behavioralBreakdown).map(([key, val]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key}</span>
                    <span className="text-slate-400">+{val} pts</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 font-mono bg-black/20 p-2 rounded">
                Total Behavioral Score = {data.behavioralScore}
              </p>
            </div>

            <div>
              <p className="font-bold text-white mb-2 border-b border-white/5 pb-1">3. Final Unified Score</p>
              <p className="text-xs text-slate-400 font-mono bg-black/20 p-2 rounded mb-2">
                Formula: {data.explanation.finalFormula} = {data.finalScore}
              </p>
              {data.explanation.constraintApplied && (
                <p className="text-xs text-amber-400 bg-amber-400/10 p-2 rounded">
                  Safety Constraint Applied: Your objective financial capacity is low. Behavioral tolerance has been capped to protect your financial safety.
                </p>
              )}
            </div>
            
            <p className="text-xs italic text-slate-500 pt-2 border-t border-white/5">
              Note: This is an educational financial simulation integrating a probabilistic ML model and deterministic rules. It does not constitute personalized financial advice.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ProgressBar({ label, prob }: { label: string; prob: number }) {
  const percent = Math.round(prob * 100);
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="w-24 text-slate-400">{label}</div>
      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500/50 rounded-full transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="w-10 text-right font-medium text-slate-300">{percent}%</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
      <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">{title}</h2>
      {children}
    </section>
  );
}
