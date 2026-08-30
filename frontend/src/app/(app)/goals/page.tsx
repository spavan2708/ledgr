import type { Metadata } from "next";
import { GoalPlanner } from "@/components/goals/GoalPlanner";
export const metadata: Metadata = { title: "Goals | FinSync", description: "Plan and compare financial goals within your monthly capacity." };
export default function GoalsPage() { return <GoalPlanner />; }
