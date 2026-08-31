"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { generateFinancialPlan } from "@/lib/financial/engine";

const STEPS = [
  { id: "cashflow", label: "Analyzing Monthly Cash Flow", desc: "Calculating your essential expenses and identifying investable surplus." },
  { id: "emergency", label: "Evaluating Emergency Fund", desc: "Checking coverage for your monthly obligations based on stability factors." },
  { id: "debt", label: "Assessing Debt Burden", desc: "Reviewing debt payment ratios and liabilities." },
  { id: "risk", label: "Determining Risk Profile", desc: "Aligning your experience and horizon with allocation models." },
  { id: "allocation", label: "Building Target Allocation", desc: "Comparing your current portfolio to optimal target ranges." },
  { id: "score", label: "Calculating Health Score", desc: "Aggregating metrics into your final educational score." }
];

export default function AnalyzePage() {
  const { session, setProfile } = useFinSyncSession();
  const router = useRouter();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    if (!session?.profile_input) {
      router.push("/profile");
      return;
    }

    initialized.current = true;

    // Actually run the engine right away
    const plan = generateFinancialPlan(session.profile_input);
    
    // Save to session so Results page can pick it up
    setProfile(session.profile_input, plan, session.profile_analysis);

    // Simulate visual progression
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < STEPS.length) {
        setCurrentStepIndex(index);
      } else {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => {
          router.push("/profile/results");
        }, 600);
      }
    }, 600); // 600ms per step

    return () => {
      initialized.current = false;
      clearInterval(interval);
    };
  }, [session?.profile_input, router, setProfile]);

  if (!session?.profile_input) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-20 text-center">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Building Your Financial Plan</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">Our deterministic rules engine is processing your profile.</p>
      </div>

      <div className="w-full space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6 text-left shadow-xl shadow-black/50">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex && !isComplete;
          const isDone = index < currentStepIndex || isComplete;

          return (
            <div key={step.id} className={`flex items-start gap-4 rounded-xl p-4 transition-all duration-500 ${isActive ? "bg-emerald-400/10" : isDone ? "opacity-100" : "opacity-40"}`}>
              <div className="mt-1 flex-shrink-0">
                {isDone ? (
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : isActive ? (
                  <svg className="h-6 w-6 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-slate-700" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${isActive || isDone ? "text-white" : "text-slate-500"}`}>{step.label}</h3>
                <p className={`mt-1 text-sm ${isActive ? "text-emerald-200/80" : "text-slate-500"}`}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
