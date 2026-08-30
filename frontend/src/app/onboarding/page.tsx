import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = { title: "Create your financial profile | FinSync", description: "Build an educational financial health profile with FinSync." };

export default function OnboardingPage() {
  return <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 sm:py-10"><div className="ambient-glow" /><OnboardingForm /></main>;
}
