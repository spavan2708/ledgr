"use client";

import Link from "next/link";
import { useState, useEffect, type ChangeEvent, type KeyboardEvent, type FormEvent, type ReactNode } from "react";
import { FormField } from "./FormField";
import { ProgressIndicator } from "./ProgressIndicator";
import { RatingField } from "./RatingField";
import type { FinancialProfile } from "@/types/financial-profile";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { formatRupees } from "@/lib/formatters";

/* ─── Constants ─────────────────────────────────────────────────── */

const STEP_LABELS = ["About You", "Monthly Cash Flow", "What You Owe & Safety", "Risk & Investment Behaviour"];

const INITIAL_PROFILE: FinancialProfile = {
  personal: { age: 0, occupation: "Salaried", dependents: 0 },
  cash_flow: {
    monthly_take_home_income: 0, other_monthly_income: 0,
    housing: 0, food: 0, utilities: 0, transport: 0, insurance: 0, healthcare: 0, other_essential: 0,
    shopping: 0, dining_out: 0, entertainment: 0, subscriptions: 0, travel_leisure: 0, other_discretionary: 0,
    monthly_debt_payments: 0, existing_monthly_investments: 0,
  },
  assets: { cash_bank: 0, fd: 0, mutual_funds: 0, stocks_equity: 0, bonds_debt: 0, other_assets: 0 },
  liabilities: { outstanding_loans: 0, other_liabilities: 0 },
  safety: { emergency_savings: 0 },
  risk: { investment_experience: "None", market_loss_reaction: "Hold and wait", investment_horizon: "2–5 years", income_stability: 3 },
};

const OCCUPATIONS = ["Salaried", "Self-employed", "Business owner", "Freelancer", "Student", "Retired", "Other"];
const DEPENDENTS_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const EXPERIENCE_OPTIONS = ["None", "Beginner", "Some experience", "Experienced"];
const LOSS_OPTIONS = ["Sell immediately", "Sell some", "Hold and wait", "Invest more"];
const HORIZON_OPTIONS = ["Less than 2 years", "2–5 years", "5–10 years", "10+ years"];

/* ─── Helpers ───────────────────────────────────────────────────── */

/** Display value for a numeric field: show empty string instead of 0 so user can type cleanly. */
function numDisplay(v: number): string {
  return v === 0 ? "" : String(v);
}

/** Parse a string from an input into a number, treating empty/NaN as 0. */
function parseNum(raw: string): number {
  if (raw === "" || raw === "-") return 0;
  const n = Number(raw);
  return Number.isNaN(n) ? 0 : n;
}

/** Block Enter key from triggering form submission inside inputs. */
function blockEnter(e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) {
  if (e.key === "Enter") { e.preventDefault(); }
}

/** Compute derived totals from profile. Assets/net worth are NOT calculated here — they belong to Portfolio. */
function computeTotals(p: FinancialProfile) {
  const cf = p.cash_flow;
  const totalIncome = Number(cf.monthly_take_home_income || 0) + Number(cf.other_monthly_income || 0);
  const totalEssential = Number(cf.housing || 0) + Number(cf.food || 0) + Number(cf.utilities || 0) + Number(cf.transport || 0) + Number(cf.insurance || 0) + Number(cf.healthcare || 0) + Number(cf.other_essential || 0);
  const totalDiscretionary = Number(cf.shopping || 0) + Number(cf.dining_out || 0) + Number(cf.entertainment || 0) + Number(cf.subscriptions || 0) + Number(cf.travel_leisure || 0) + Number(cf.other_discretionary || 0);
  const totalExpenses = totalEssential + totalDiscretionary;
  const totalCommitments = Number(cf.monthly_debt_payments || 0) + Number(cf.existing_monthly_investments || 0);
  const monthlySurplus = totalIncome - totalExpenses - totalCommitments;
  const totalLiabilities = Number(p.liabilities.outstanding_loans || 0) + Number(p.liabilities.other_liabilities || 0);

  return { totalIncome, totalEssential, totalDiscretionary, totalExpenses, totalCommitments, monthlySurplus, totalLiabilities };
}

/* ─── Validation ────────────────────────────────────────────────── */

type StepErrors = Record<string, string>;

function validateStep(step: number, profile: FinancialProfile): StepErrors {
  const errors: StepErrors = {};
  if (step === 0) {
    if (!profile.personal.age || profile.personal.age < 10 || profile.personal.age > 120) errors.age = "Enter a valid age (10–120).";
  }
  if (step === 1) {
    if (profile.cash_flow.monthly_take_home_income <= 0) errors.monthly_take_home_income = "Monthly take-home income is required.";
  }
  // Steps 2, 3, 4 have no mandatory fields beyond defaults (all start at 0 which is valid)
  return errors;
}

/* ─── Sub-components ────────────────────────────────────────────── */

function StepHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="mb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </header>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-emerald-300">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-300" : "text-slate-200"}`}>{value}</span>
    </div>
  );
}

function MoneyField({ value, onChange, ...props }: Omit<React.ComponentProps<typeof FormField>, "prefix" | "type" | "min">) {
  const displayValue = value ? Number(value).toLocaleString('en-IN') : "";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = raw;
    if (onChange) onChange(e);
  };

  return <FormField {...props} value={displayValue} onChange={handleChange} type="text" prefix="₹" />;
}

function SelectField({ id, label, value, options, onChange, onKeyDown, hint }: {
  id: string; label: string; value: string | number; options: (string | number)[]; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; onKeyDown?: (e: KeyboardEvent<HTMLSelectElement>) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor={id}>{label}</label>
      <div className="field-shell">
        <select id={id} name={id} value={value} onChange={onChange} onKeyDown={onKeyDown} className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-white outline-none">
          {options.map(o => <option key={o} value={o} className="text-black">{o}</option>)}
        </select>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */

export function OnboardingForm() {
  const { session, setProfile: saveProfile, setLastOnboardingStep, setProfileStatus } = useFinSyncSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(session?.last_onboarding_step ?? 0);
  const [profile, setProfile] = useState<FinancialProfile>(session?.profile_input ?? INITIAL_PROFILE);
  const [errors, setErrors] = useState<StepErrors>({});

  useEffect(() => {
    // Start tracking in_progress explicitly if not editing
    if (!session?.profile_status || session.profile_status === 'new') {
      setProfileStatus('in_progress');
    }

    // If the profile is fully completed and we don't have a specific step in the URL, redirect to Review.
    if (session?.profile_status === "completed" && !searchParams.has("step")) {
      router.replace("/profile/review");
      return;
    }
    
    const stepParam = searchParams.get("step");
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
        setStep(parsed);
      }
    }
  }, [searchParams, session?.profile_status, router, setProfileStatus]);

  /* ── Generic change handlers ── */

  const onPersonalInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setProfile(p => ({ ...p, personal: { ...p.personal, [name]: type === "number" ? parseNum(value) : value } }));
    setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
  };

  const onCashFlowInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, cash_flow: { ...p.cash_flow, [name]: parseNum(value) } }));
    setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
  };

  const onLiabilitiesInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, liabilities: { ...p.liabilities, [name]: parseNum(value) } }));
  };

  const onSafetyInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, safety: { ...p.safety, [name]: parseNum(value) } }));
  };

  const onRiskSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, risk: { ...p.risk, [name]: value } }));
  };

  const onRating = (val: number) => {
    setProfile(p => ({ ...p, risk: { ...p.risk, income_stability: val } }));
  };

  /* ── Navigation ── */

  const continueStep = () => {
    const stepErrors = validateStep(step, profile);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    
    // Save incrementally
    saveProfile(profile);

    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      setLastOnboardingStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Step 4 is the final data entry step. Proceed to review.
      setLastOnboardingStep(3);
      setProfileStatus('review');
      router.push("/profile/review");
    }
  };

  const goBack = () => {
    setStep(s => {
      const prevStep = Math.max(s - 1, 0);
      setLastOnboardingStep(prevStep);
      return prevStep;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    continueStep();
  };

  const totals = computeTotals(profile);

  /* ── Render ── */

  return (
    <div className="mx-auto w-full max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-[-0.05em] text-black">ledgr</Link>
        <span className="hidden text-xs text-slate-500 sm:block">Private by design &middot; No account needed</span>
      </div>
      <div className="onboarding-card">
        <ProgressIndicator currentStep={step} labels={STEP_LABELS} />
        <form onSubmit={handleFormSubmit} className="mt-10">

          {/* ═══════════ STEP 1 — About You ═══════════ */}
          {step === 0 && <>
            <StepHeader eyebrow="Step 1 of 4" title="About You" description="A few personal details to help put your finances into context." />
            <FieldGrid>
              <FormField
                id="age" label="Age" type="number" min={10} max={120}
                value={numDisplay(profile.personal.age)}
                onChange={onPersonalInput} onKeyDown={blockEnter}
                error={errors.age} placeholder="e.g. 28"
              />
              <SelectField
                id="occupation" label="Occupation"
                value={profile.personal.occupation}
                options={OCCUPATIONS}
                onChange={onPersonalInput} onKeyDown={blockEnter}
              />
              <SelectField
                id="dependents" label="Number of dependents"
                value={profile.personal.dependents}
                options={DEPENDENTS_OPTIONS}
                onChange={onPersonalInput} onKeyDown={blockEnter}
              />
            </FieldGrid>
          </>}

          {/* ═══════════ STEP 2 — Monthly Cash Flow ═══════════ */}
          {step === 1 && <>
            <StepHeader eyebrow="Step 2 of 4" title="Monthly Cash Flow" description="Understand where your money comes from and where it goes each month." />

            <div className="space-y-6">
              {/* Income */}
              <SectionCard title="Income">
                <FieldGrid>
                  <MoneyField id="monthly_take_home_income" label="Monthly take-home income" value={numDisplay(profile.cash_flow.monthly_take_home_income)} onChange={onCashFlowInput} onKeyDown={blockEnter} error={errors.monthly_take_home_income} />
                  <MoneyField id="other_monthly_income" label="Other monthly income" value={numDisplay(profile.cash_flow.other_monthly_income)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="Optional — rental income, freelance, etc." />
                </FieldGrid>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <SummaryRow label="Total monthly income" value={formatRupees(totals.totalIncome)} highlight />
                </div>
              </SectionCard>

              {/* Essential Expenses */}
              <SectionCard title="Essential Monthly Expenses">
                <FieldGrid>
                  <MoneyField id="housing" label="Housing / Rent" value={numDisplay(profile.cash_flow.housing)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="food" label="Food / Groceries" value={numDisplay(profile.cash_flow.food)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="utilities" label="Utilities" value={numDisplay(profile.cash_flow.utilities)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="Electricity, water, internet, phone" />
                  <MoneyField id="transport" label="Transport" value={numDisplay(profile.cash_flow.transport)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="insurance" label="Insurance" value={numDisplay(profile.cash_flow.insurance)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="Health, life, vehicle premiums" />
                  <MoneyField id="healthcare" label="Healthcare / Medical" value={numDisplay(profile.cash_flow.healthcare)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="other_essential" label="Other essential expenses" value={numDisplay(profile.cash_flow.other_essential)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                </FieldGrid>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <SummaryRow label="Total essential expenses" value={formatRupees(totals.totalEssential)} />
                </div>
              </SectionCard>

              {/* Discretionary Expenses */}
              <SectionCard title="Discretionary Monthly Expenses">
                <FieldGrid>
                  <MoneyField id="shopping" label="Shopping" value={numDisplay(profile.cash_flow.shopping)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="dining_out" label="Dining out" value={numDisplay(profile.cash_flow.dining_out)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="entertainment" label="Entertainment" value={numDisplay(profile.cash_flow.entertainment)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="subscriptions" label="Subscriptions" value={numDisplay(profile.cash_flow.subscriptions)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="OTT, music, apps, etc." />
                  <MoneyField id="travel_leisure" label="Travel / Leisure" value={numDisplay(profile.cash_flow.travel_leisure)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                  <MoneyField id="other_discretionary" label="Other discretionary" value={numDisplay(profile.cash_flow.other_discretionary)} onChange={onCashFlowInput} onKeyDown={blockEnter} />
                </FieldGrid>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <SummaryRow label="Total discretionary expenses" value={formatRupees(totals.totalDiscretionary)} />
                </div>
              </SectionCard>

              {/* Financial Commitments */}
              <SectionCard title="Financial Commitments">
                <FieldGrid>
                  <MoneyField id="monthly_debt_payments" label="Debt / Loan / EMI payments" value={numDisplay(profile.cash_flow.monthly_debt_payments)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="Home loan, car loan, personal loan EMIs" />
                  <MoneyField id="existing_monthly_investments" label="Existing monthly investments / SIPs" value={numDisplay(profile.cash_flow.existing_monthly_investments)} onChange={onCashFlowInput} onKeyDown={blockEnter} hint="Current SIPs, recurring deposits, etc." />
                </FieldGrid>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <SummaryRow label="Total financial commitments" value={formatRupees(totals.totalCommitments)} />
                </div>
              </SectionCard>

              {/* Cash Flow Summary */}
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-emerald-300">Cash Flow Summary</h3>
                <SummaryRow label="Total monthly income" value={formatRupees(totals.totalIncome)} />
                <SummaryRow label="Total living expenses" value={formatRupees(totals.totalExpenses)} />
                <SummaryRow label="Total financial commitments" value={formatRupees(totals.totalCommitments)} />
                <SummaryRow label="Total monthly outflow" value={formatRupees(totals.totalExpenses + totals.totalCommitments)} />
                <div className="mt-2 border-t border-emerald-400/20 pt-2">
                  <SummaryRow label="Monthly surplus / available" value={formatRupees(totals.monthlySurplus)} highlight />
                </div>
              </div>
            </div>
          </>}

          
          {/* ═══════════ STEP 4 — What You Owe & Safety ═══════════ */}
          {step === 2 && <>
            <StepHeader eyebrow="Step 3 of 4" title="What You Owe & Safety" description="Outstanding debts and your emergency safety net." />
            <FieldGrid>
              <MoneyField id="outstanding_loans" label="Total outstanding loan amount" value={numDisplay(profile.liabilities.outstanding_loans)} onChange={onLiabilitiesInput} onKeyDown={blockEnter} hint="Total remaining balance on all loans" />
              <MoneyField id="other_liabilities" label="Other outstanding liabilities" value={numDisplay(profile.liabilities.other_liabilities)} onChange={onLiabilitiesInput} onKeyDown={blockEnter} hint="Credit card dues, informal borrowings, etc." />
            </FieldGrid>
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-emerald-300">Emergency Safety</h3>
              <MoneyField id="emergency_savings" label="Emergency fund target" value={numDisplay(profile.safety.emergency_savings)} onChange={onSafetyInput} onKeyDown={blockEnter} hint="How much would you like to keep available as an emergency reserve? Your actual Cash/Bank balance will be recorded later in Portfolio." />
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <SummaryRow label="Total liabilities" value={formatRupees(computeTotals(profile).totalLiabilities)} />
              <SummaryRow label="Emergency fund target" value={formatRupees(profile.safety.emergency_savings)} />
              <p className="mt-3 text-xs text-slate-500">Your actual assets and net worth will be calculated after you add your holdings in Portfolio.</p>
            </div>
          </>}

          {/* ═══════════ STEP 5 — Risk & Investment Behaviour ═══════════ */}
          {step === 3 && <>
            <StepHeader eyebrow="Step 4 of 4" title="Risk & Investment Behaviour" description="Help us understand your comfort with investing. There are no right or wrong answers." />
            <div className="space-y-6">
              <SelectField
                id="investment_experience" label="Investment experience"
                value={profile.risk.investment_experience}
                options={EXPERIENCE_OPTIONS}
                onChange={onRiskSelect} onKeyDown={blockEnter}
              />
              <SelectField
                id="market_loss_reaction"
                label="If your investments temporarily fell by 20%, what would you most likely do?"
                value={profile.risk.market_loss_reaction}
                options={LOSS_OPTIONS}
                onChange={onRiskSelect} onKeyDown={blockEnter}
              />
              <SelectField
                id="investment_horizon" label="General investment horizon"
                value={profile.risk.investment_horizon}
                options={HORIZON_OPTIONS}
                onChange={onRiskSelect} onKeyDown={blockEnter}
                hint="Individual goals can have different horizons and those will be collected later under Goals."
              />
              <RatingField
                id="income_stability" label="Income stability"
                value={profile.risk.income_stability}
                lowLabel="1 = Very unstable" highLabel="5 = Very stable"
                onChange={onRating}
              />
            </div>
          </>}

          {/* ═══════════ Navigation Bar ═══════════ */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
            {step > 0 ? (
              <button type="button" onClick={goBack} className="secondary-button">Back</button>
            ) : <span />}
            
            <button type="button" onClick={continueStep} className="primary-button">
              {step < 3 ? "Continue " : "Review Profile "} <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </form>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-slate-600">
        ledgr provides educational financial planning simulations &mdash; not guaranteed returns or regulated investment advice.
      </p>
    </div>
  );
}
