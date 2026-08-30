"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { FormField } from "./FormField";
import { ProfileResults } from "./ProfileResults";
import { ProgressIndicator } from "./ProgressIndicator";
import { RatingField } from "./RatingField";
import { formatRupees } from "@/lib/formatters";
import type { FinancialProfile, FinancialProfileResult, ProfileErrors, ProfileField } from "@/types/financial-profile";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";

const STEP_LABELS = ["Personal", "Cash flow", "Financial base", "Preferences", "Context", "Review"];
const INITIAL_PROFILE: FinancialProfile = {
  name: "", age: 30, occupation: "", monthly_income: 0, monthly_essential_expenses: 0,
  monthly_financial_obligations: 0, monthly_debt_payments: 0, current_savings: 0, emergency_fund: 0,
  outstanding_debt: 0, total_assets: 0, liquid_assets: 0, total_liabilities: 0,
  dependents: 0, income_stability: 3, investment_experience: 1,
  investment_horizon_years: 5, volatility_comfort: 3, additional_context: "",
};

const STEP_FIELDS: ProfileField[][] = [
  ["name", "age", "occupation", "dependents"],
  ["monthly_income", "monthly_essential_expenses", "monthly_financial_obligations", "monthly_debt_payments"],
  ["current_savings", "emergency_fund", "outstanding_debt", "total_assets", "liquid_assets", "total_liabilities"],
  ["income_stability", "investment_experience", "investment_horizon_years", "volatility_comfort"],
  ["additional_context"], [],
];

function validate(profile: FinancialProfile, fields: ProfileField[]): ProfileErrors {
  const errors: ProfileErrors = {};
  if (fields.includes("name") && !profile.name.trim()) errors.name = "Enter your name.";
  if (fields.includes("occupation") && !profile.occupation.trim()) errors.occupation = "Enter your occupation.";
  if (fields.includes("age") && (profile.age < 18 || profile.age > 100)) errors.age = "Age must be between 18 and 100.";
  if (fields.includes("dependents") && (profile.dependents < 0 || profile.dependents > 20)) errors.dependents = "Dependents must be between 0 and 20.";
  const moneyFields: ProfileField[] = ["monthly_income", "monthly_essential_expenses", "monthly_financial_obligations", "monthly_debt_payments", "current_savings", "emergency_fund", "outstanding_debt", "total_assets", "liquid_assets", "total_liabilities"];
  moneyFields.filter((field) => fields.includes(field)).forEach((field) => { if (Number(profile[field]) < 0) errors[field] = "Amount cannot be negative."; });
  if (fields.includes("investment_horizon_years") && (profile.investment_horizon_years < 1 || profile.investment_horizon_years > 60)) errors.investment_horizon_years = "Horizon must be between 1 and 60 years.";
  return errors;
}

function StepHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="mb-8"><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></header>;
}

export function OnboardingForm() {
  const { setProfile: saveProfile } = useFinSyncSession();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<FinancialProfile>(INITIAL_PROFILE);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [result, setResult] = useState<FinancialProfileResult | null>(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as ProfileField;
    const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const setRating = (field: "income_stability" | "investment_experience" | "volatility_comfort", value: number) => setProfile((current) => ({ ...current, [field]: value }));

  const continueStep = () => {
    const nextErrors = validate(profile, STEP_FIELDS[step]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) { setStep((current) => Math.min(current + 1, 5)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const allErrors = validate(profile, STEP_FIELDS.flat());
    if (Object.keys(allErrors).length) { setErrors(allErrors); setStep(0); return; }
    setLoading(true); setApiError("");
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/v1/profile/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(getApiError(body));
      }
      const analysis = (await response.json()) as FinancialProfileResult;
      setResult(analysis);
      saveProfile(profile, analysis);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "We could not analyze your profile. Please try again.");
    } finally { setLoading(false); }
  };

  if (result) return <ProfileResults result={result} onEdit={() => { setResult(null); setStep(0); }} />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-center justify-between"><Link href="/" className="text-xl font-bold tracking-tight text-white">Fin<span className="text-emerald-400">Sync</span></Link><span className="hidden text-xs text-slate-500 sm:block">Private by design · No account needed</span></div>
      <div className="onboarding-card">
        <ProgressIndicator currentStep={step} labels={STEP_LABELS} />
        <form onSubmit={submit} className="mt-10">
          {step === 0 && <><StepHeader eyebrow="Let’s start with you" title="Build your financial foundation." description="A few personal details help put the numbers that follow into context." /><FieldGrid><FormField id="name" label="Full name" value={profile.name} onChange={onInput} error={errors.name} placeholder="e.g. Ananya Sharma" /><FormField id="age" label="Age" type="number" min={18} max={100} value={profile.age} onChange={onInput} error={errors.age} /><FormField id="occupation" label="Occupation" value={profile.occupation} onChange={onInput} error={errors.occupation} placeholder="e.g. Product manager" /><FormField id="dependents" label="Number of dependents" type="number" min={0} max={20} value={profile.dependents} onChange={onInput} error={errors.dependents} /></FieldGrid></>}
          {step === 1 && <><StepHeader eyebrow="Your monthly cash flow" title="Understand what comes in and goes out." description="Use typical monthly amounts. Debt payments are the debt-only portion of broader obligations and are not subtracted twice." /><FieldGrid><MoneyField id="monthly_income" label="Monthly income" value={profile.monthly_income} onChange={onInput} error={errors.monthly_income} /><MoneyField id="monthly_essential_expenses" label="Essential expenses" value={profile.monthly_essential_expenses} onChange={onInput} error={errors.monthly_essential_expenses} hint="Housing, food, utilities, transport and healthcare." /><MoneyField id="monthly_financial_obligations" label="All financial obligations" value={profile.monthly_financial_obligations} onChange={onInput} error={errors.monthly_financial_obligations} hint="Includes debt payments, insurance commitments and recurring support." /><MoneyField id="monthly_debt_payments" label="Monthly debt payments" value={profile.monthly_debt_payments} onChange={onInput} error={errors.monthly_debt_payments} hint="EMIs and other required debt repayments only." /></FieldGrid></>}
          {step === 2 && <><StepHeader eyebrow="Your balance sheet" title="Map your safety net, assets and liabilities." description="Total assets should include liquid assets. Total liabilities may include debt and other financial liabilities." /><FieldGrid><MoneyField id="current_savings" label="Total current savings" value={profile.current_savings} onChange={onInput} error={errors.current_savings} /><MoneyField id="emergency_fund" label="Dedicated emergency fund" value={profile.emergency_fund} onChange={onInput} error={errors.emergency_fund} /><MoneyField id="outstanding_debt" label="Outstanding debt" value={profile.outstanding_debt} onChange={onInput} error={errors.outstanding_debt} hint="Retained separately for your debt snapshot." /><MoneyField id="total_assets" label="Total assets" value={profile.total_assets} onChange={onInput} error={errors.total_assets} hint="Cash, investments, property and other owned assets." /><MoneyField id="liquid_assets" label="Liquid assets" value={profile.liquid_assets} onChange={onInput} error={errors.liquid_assets} hint="Cash or assets reasonably available for near-term needs." /><MoneyField id="total_liabilities" label="Total liabilities" value={profile.total_liabilities} onChange={onInput} error={errors.total_liabilities} hint="Used with total assets for solvency and leverage ratios." /></FieldGrid><p className="mt-6 rounded-xl border border-sky-400/15 bg-sky-400/5 p-4 text-xs leading-5 text-sky-200/70">These definitions are educational simplifications. Asset liquidity, liability treatment and appropriate reference ranges can vary by household and professional methodology.</p></>}
          {step === 3 && <><StepHeader eyebrow="Risk and preferences" title="Describe how you approach investing." description="There are no right answers. Choose the number that best reflects your current position." /><div className="space-y-8"><RatingField id="income_stability" label="Income stability" value={profile.income_stability} lowLabel="Highly variable" highLabel="Very stable" onChange={(value) => setRating("income_stability", value)} /><RatingField id="investment_experience" label="Investment experience" value={profile.investment_experience} lowLabel="New investor" highLabel="Highly experienced" onChange={(value) => setRating("investment_experience", value)} /><RatingField id="volatility_comfort" label="Comfort with market volatility" value={profile.volatility_comfort} lowLabel="Prefer stability" highLabel="Comfortable with swings" onChange={(value) => setRating("volatility_comfort", value)} /><FormField id="investment_horizon_years" label="Investment horizon (years)" type="number" min={1} max={60} value={profile.investment_horizon_years} onChange={onInput} error={errors.investment_horizon_years} hint="How long until you expect to need most of this invested money?" /></div></>}
          {step === 4 && <><StepHeader eyebrow="The bigger picture" title="Add context numbers can’t capture." description="Optional: share near-term goals, irregular expenses, career changes, family responsibilities or anything else relevant." /><label htmlFor="additional_context" className="mb-2 block text-sm font-semibold text-slate-200">Additional financial context <span className="font-normal text-slate-500">(optional)</span></label><textarea id="additional_context" maxLength={2000} rows={7} value={profile.additional_context} onChange={(event) => setProfile((current) => ({ ...current, additional_context: event.target.value }))} placeholder="For example: I’m planning a home purchase in five years…" className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60" /><p className="mt-2 text-right text-xs text-slate-600">{profile.additional_context?.length ?? 0} / 2,000</p></>}
          {step === 5 && <><StepHeader eyebrow="Review and analyze" title="Your profile at a glance." description="Check your details before FinSync creates your educational financial health simulation." /><Review profile={profile} />{apiError && <div role="alert" className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{apiError}</div>}</>}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">{step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="secondary-button">Back</button> : <span />} {step < 5 ? <button type="button" onClick={continueStep} className="primary-button">Continue <span aria-hidden="true">→</span></button> : <button type="submit" disabled={loading} className="primary-button disabled:cursor-wait disabled:opacity-60">{loading ? "Analyzing profile…" : "Analyze my profile"}</button>}</div>
        </form>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-slate-600">FinSync provides educational financial planning simulations—not guaranteed returns or regulated investment advice.</p>
    </div>
  );
}

function FieldGrid({ children }: { children: ReactNode }) { return <div className="grid gap-6 sm:grid-cols-2">{children}</div>; }
function MoneyField(props: Omit<React.ComponentProps<typeof FormField>, "prefix" | "type" | "min">) { return <FormField {...props} type="number" min={0} step={1} prefix="₹" />; }
function Review({ profile }: { profile: FinancialProfile }) {
  const groups = [{ title: "Personal", rows: [["Name", profile.name], ["Age", profile.age], ["Occupation", profile.occupation], ["Dependents", profile.dependents]] }, { title: "Monthly cash flow", rows: [["Income", formatRupees(profile.monthly_income)], ["Essentials", formatRupees(profile.monthly_essential_expenses)], ["Obligations", formatRupees(profile.monthly_financial_obligations)], ["Debt payments", formatRupees(profile.monthly_debt_payments)]] }, { title: "Balance sheet", rows: [["Savings", formatRupees(profile.current_savings)], ["Emergency fund", formatRupees(profile.emergency_fund)], ["Outstanding debt", formatRupees(profile.outstanding_debt)], ["Total assets", formatRupees(profile.total_assets)], ["Liquid assets", formatRupees(profile.liquid_assets)], ["Total liabilities", formatRupees(profile.total_liabilities)]] }, { title: "Preferences", rows: [["Income stability", `${profile.income_stability}/5`], ["Experience", `${profile.investment_experience}/5`], ["Volatility comfort", `${profile.volatility_comfort}/5`], ["Horizon", `${profile.investment_horizon_years} years`]] }];
  return <div className="grid gap-4 sm:grid-cols-2">{groups.map((group) => <section key={group.title} className="rounded-2xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold text-emerald-300">{group.title}</h2><dl className="mt-4 space-y-3">{group.rows.map(([label, value]) => <div key={String(label)} className="flex justify-between gap-4 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right text-slate-200">{value}</dd></div>)}</dl></section>)}</div>;
}
function getApiError(body: unknown): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0 && typeof detail[0] === "object" && detail[0] !== null && "msg" in detail[0]) return `Please review your information: ${String(detail[0].msg)}`;
  }
  return "We could not analyze your profile. Please check the API connection and try again.";
}
