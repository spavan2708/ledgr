from fastapi import APIRouter, Header

from app.agents.service import chat, decide, get_proposal
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentProposal, ProposalDecisionRequest, ProposalDecisionResponse

router = APIRouter(prefix="/agent", tags=["agent companion"])


@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(request: AgentChatRequest) -> AgentChatResponse:
    return chat(request)


@router.get("/proposals/{proposal_id}", response_model=AgentProposal)
def proposal(proposal_id: str, x_finsync_session_id: str | None = Header(default=None)) -> AgentProposal:
    return get_proposal(proposal_id, x_finsync_session_id)


@router.post("/proposals/{proposal_id}/approve", response_model=ProposalDecisionResponse)
def approve(proposal_id: str, request: ProposalDecisionRequest) -> ProposalDecisionResponse:
    item = decide(proposal_id, request.session_id, True)
    return ProposalDecisionResponse(proposal=item, context=item.proposed_context)


@router.post("/proposals/{proposal_id}/reject", response_model=ProposalDecisionResponse)
def reject(proposal_id: str, request: ProposalDecisionRequest) -> ProposalDecisionResponse:
    item = decide(proposal_id, request.session_id, False)
    return ProposalDecisionResponse(proposal=item)

