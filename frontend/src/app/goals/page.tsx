import type { Metadata } from "next";
import { GoalPlanner } from "@/components/goals/GoalPlanner";

export const metadata: Metadata = { title: "Goal planner | FinSync", description: "Explore deterministic financial goal scenarios with FinSync." };

export default async function GoalsPage({ searchParams }: PageProps<"/goals">) {
  const params = await searchParams;
  const parsed = Number(params.capacity ?? 0);
  return <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 sm:py-10"><div className="ambient-glow" /><GoalPlanner initialCapacity={Number.isFinite(parsed) ? Math.max(0, parsed) : 0} /></main>;
}
