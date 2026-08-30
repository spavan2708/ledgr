from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.goals import GoalInput, GoalSimulationResponse
from app.schemas.profile import FinancialProfileRequest, FinancialProfileResponse


class AgentContext(BaseModel):
    model_config = ConfigDict(extra="forbid")
    profile_input: FinancialProfileRequest | None = None
    profile_analysis: FinancialProfileResponse | None = None
    declared_monthly_capacity: float | None = Field(default=None, ge=0)
    goals: list[GoalInput] = Field(default_factory=list, max_length=25)
    goal_simulation: GoalSimulationResponse | None = None


class AgentChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str = Field(min_length=8, max_length=100)
    message: str = Field(min_length=1, max_length=4000)
    context: AgentContext = Field(default_factory=AgentContext)


class ProposalChange(BaseModel):
    field: str
    label: str
    format: Literal["currency", "percentage", "months", "status", "text"]
    old_value: Any
    new_value: Any


class AgentProposal(BaseModel):
    id: str
    session_id: str
    kind: Literal["profile_update", "goal_update"]
    status: Literal["pending", "approved", "rejected", "expired"]
    summary: str
    changes: list[ProposalChange]
    proposed_context: AgentContext
    created_at: str
    expires_at: str


class AgentChatResponse(BaseModel):
    message: str
    proposal: AgentProposal | None = None
    fallback_used: bool = False


class ProposalDecisionRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=100)


class ProposalDecisionResponse(BaseModel):
    proposal: AgentProposal
    context: AgentContext | None = None

