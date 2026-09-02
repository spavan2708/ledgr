import { BarChart3, CircleUserRound, Goal, BriefcaseBusiness, TrendingUp, Search, GraduationCap, MessageCircle } from "lucide-react";

export const APP_NAVIGATION = [
  ["Overview", "/dashboard", BarChart3],
  ["Profile", "/profile", CircleUserRound],
  ["Goals", "/goals", Goal],
  ["Portfolio", "/portfolio", BriefcaseBusiness],
  ["Future Simulator", "/simulator", TrendingUp],
  ["Market Intelligence", "/market", Search],
  ["Tutor", "/tutor", GraduationCap],
  ["ledgr assistant", "/assistant", MessageCircle],
] as const;
