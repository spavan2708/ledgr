import type { FinancialProfile, FinancialProfileResult } from "./financial-profile";
import type { FinancialPlan } from "./financial-plan";
import type { GoalInput, GoalSimulationResponse } from "./goals";

export interface ProposalChange { field: string; label: string; format: "currency" | "percentage" | "months" | "status" | "text"; old_value: unknown; new_value: unknown; }
export interface AgentProposal { id: string; session_id: string; kind: "profile_update" | "goal_update"; status: "pending" | "approved" | "rejected" | "expired"; summary: string; changes: ProposalChange[]; proposed_context: SessionContext; created_at: string; expires_at: string; }
export interface ConversationMessage { role: "user" | "assistant"; content: string; proposal?: AgentProposal; }
export interface SessionContext { 
  profile_input: FinancialProfile | null; 
  profile_analysis: FinancialProfileResult | null; 
  financial_plan: FinancialPlan | null;
  declared_monthly_capacity: number | null; 
  goals: GoalInput[]; 
  goal_simulation: GoalSimulationResponse | null; 
}
export interface FinSyncSession extends SessionContext { version: 1; session_id: string; conversation: ConversationMessage[]; proposals: AgentProposal[]; }
