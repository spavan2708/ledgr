import re
from datetime import UTC, datetime, timedelta
from threading import Lock
from uuid import uuid4

from fastapi import HTTPException

from app.agents.provider import OpenAICompatibleProvider
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentContext, AgentProposal, ProposalChange
from app.schemas.goals import GoalSimulationRequest
from app.services.financial_profile import analyze_financial_profile
from app.services.goal_simulator import simulate_goals

_proposals: dict[str, AgentProposal] = {}
_lock = Lock()
_TTL_MINUTES = 30


def _now() -> datetime:
    return datetime.now(UTC)


def _money(text: str, pattern: str) -> float | None:
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return None
    return float(match.group(1).replace(",", ""))


def _suggested_strategy(context: AgentContext) -> str:
    analysis = context.profile_analysis
    if not analysis:
        return "the current strategy"
    metrics = analysis.metrics
    if metrics.emergency_fund_coverage_months is None or metrics.emergency_fund_coverage_months < 3 or (metrics.debt_service_ratio or 0) > .30 or metrics.net_worth < 0:
        return "Safety First"
    if metrics.emergency_fund_coverage_months >= 6 and (metrics.debt_service_ratio is None or metrics.debt_service_ratio <= .20) and analysis.profile.income_stability >= 4 and analysis.profile.investment_horizon_years >= 10 and analysis.profile.volatility_comfort >= 4:
        return "Growth Focused"
    return "Balanced Progress"


def _strategy_explanation(context: AgentContext) -> str:
    analysis = context.profile_analysis
    if not analysis:
        return "Complete your financial profile first so I can explain the suggested strategy from your actual figures."
    m = analysis.metrics
    coverage = "unavailable" if m.emergency_fund_coverage_months is None else f"{m.emergency_fund_coverage_months:g} months"
    debt = "unavailable" if m.debt_service_ratio is None else f"{m.debt_service_ratio * 100:.1f}%"
    return (f"{_suggested_strategy(context)} was suggested from your actual profile: emergency coverage is {coverage}, "
            f"debt service is {debt}, net worth is ₹{m.net_worth:,.0f}, and deterministically estimated monthly capacity is ₹{m.estimated_monthly_investment_capacity:,.0f}. "
            "Emergency coverage below three months makes resilience the first priority." if (m.emergency_fund_coverage_months or 0) < 3 else
            f"{_suggested_strategy(context)} was suggested from your actual profile: emergency coverage is {coverage}, debt service is {debt}, net worth is ₹{m.net_worth:,.0f}, and deterministically estimated monthly capacity is ₹{m.estimated_monthly_investment_capacity:,.0f}.")


def _proposal(session_id: str, kind: str, summary: str, changes: list[ProposalChange], context: AgentContext) -> AgentProposal:
    created = _now()
    proposal = AgentProposal(id=str(uuid4()), session_id=session_id, kind=kind, status="pending", summary=summary, changes=changes, proposed_context=context, created_at=created.isoformat(), expires_at=(created + timedelta(minutes=_TTL_MINUTES)).isoformat())
    with _lock:
        _proposals[proposal.id] = proposal
    return proposal


def _profile_change(request: AgentChatRequest) -> AgentChatResponse | None:
    context = request.context
    profile = context.profile_input
    if not profile:
        return None
    text = request.message
    income = _money(text, r"(?:salary|income)[^\d₹-]*₹?\s*(-?[\d,]+)")
    capacity = _money(text, r"(?:invest|capacity)[^\d₹-]*₹?\s*(-?[\d,]+)")
    if income is None and capacity is None:
        return None
    if (income is not None and income < 0) or (capacity is not None and capacity < 0):
        return AgentChatResponse(message="Financial amounts cannot be negative. No proposal was created.")
    changes: list[ProposalChange] = []
    updated_profile = profile.model_copy(deep=True)
    if income is not None and income != profile.monthly_income:
        changes.append(ProposalChange(field="profile.monthly_income", label="Monthly income", format="currency", old_value=profile.monthly_income, new_value=income))
        updated_profile.monthly_income = income
    current_declared = context.declared_monthly_capacity
    if capacity is not None and capacity != current_declared:
        changes.append(ProposalChange(field="declared_monthly_capacity", label="Declared monthly capacity", format="currency", old_value=current_declared, new_value=capacity))
    if not changes:
        return AgentChatResponse(message="Those values are already applied to this session. No proposal was created.")
    updated = context.model_copy(deep=True)
    updated.profile_input = updated_profile
    updated.profile_analysis = analyze_financial_profile(updated_profile)
    updated.declared_monthly_capacity = capacity if capacity is not None else current_declared
    if updated.goals:
        simulation_capacity = updated.declared_monthly_capacity if updated.declared_monthly_capacity is not None else updated.profile_analysis.metrics.estimated_monthly_investment_capacity
        updated.goal_simulation = simulate_goals(GoalSimulationRequest(estimated_monthly_capacity=simulation_capacity, goals=updated.goals))
    proposal = _proposal(request.session_id, "profile_update", "Update profile and recalculate dependent metrics", changes, updated)
    return AgentChatResponse(message="I prepared one combined change for review. Nothing has been applied yet. Declared capacity is your stated limit; estimated capacity is recalculated independently from the profile formula.", proposal=proposal)


def _duration_months(text: str) -> int | None:
    match = re.search(r"(?:delay|extend).*?\b(\d+)\s*(years?|months?)", text, re.I)
    if not match:
        words = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}
        match_words = re.search(r"(?:delay|extend).*?\b(one|two|three|four|five)\s*(years?|months?)", text, re.I)
        if not match_words:
            return None
        value, unit = words[match_words.group(1).lower()], match_words.group(2).lower()
    else:
        value, unit = int(match.group(1)), match.group(2).lower()
    return value * 12 if unit.startswith("year") else value


def _goal_change(request: AgentChatRequest) -> AgentChatResponse | None:
    months = _duration_months(request.message)
    if months is None:
        return None
    matches = [g for g in request.context.goals if g.name.lower() in request.message.lower() or g.category.lower().replace("_", " ") in request.message.lower()]
    if len(matches) != 1:
        return AgentChatResponse(message="Please name exactly one matching goal to delay; I found none or more than one.")
    target = matches[0]
    old = target.horizon_months
    if old is None:
        return AgentChatResponse(message="This goal uses a target date. Please provide the new date so the change is unambiguous.")
    updated = request.context.model_copy(deep=True)
    for goal in updated.goals:
        if goal.id == target.id:
            goal.horizon_months = old + months
    capacity = updated.declared_monthly_capacity
    if capacity is None and updated.profile_analysis:
        capacity = updated.profile_analysis.metrics.estimated_monthly_investment_capacity
    capacity = capacity or 0
    old_result = next((g for g in (request.context.goal_simulation.goals if request.context.goal_simulation else []) if g.id == target.id), None)
    updated.goal_simulation = simulate_goals(GoalSimulationRequest(estimated_monthly_capacity=capacity, goals=updated.goals))
    new_result = next(g for g in updated.goal_simulation.goals if g.id == target.id)
    changes = [ProposalChange(field=f"goals.{target.id}.horizon_months", label=f"{target.name} timeline", format="months", old_value=old, new_value=old + months)]
    changes.append(ProposalChange(field=f"goals.{target.id}.required_monthly_contribution", label="Required contribution", format="currency", old_value=old_result.required_monthly_contribution if old_result else None, new_value=new_result.required_monthly_contribution))
    changes.append(ProposalChange(field=f"goals.{target.id}.capacity_status", label="Combined-capacity status", format="status", old_value=old_result.capacity_status if old_result else None, new_value=new_result.capacity_status))
    return AgentChatResponse(message="I recalculated the delayed goal for review. Nothing has been applied yet.", proposal=_proposal(request.session_id, "goal_update", f"Delay {target.name} by {months} months", changes, updated))


def chat(request: AgentChatRequest) -> AgentChatResponse:
    lowered = request.message.lower()
    # Strategy intent must precede generic score/profile explanation intents.
    if ("why" in lowered or "explain" in lowered) and any(name in lowered for name in ("safety first", "balanced progress", "growth focused", "strategy")):
        return AgentChatResponse(message=_strategy_explanation(request.context))
    changed = _profile_change(request) or _goal_change(request)
    if changed:
        return changed
    if os_mode() == "llm":
        try:
            safe = {"has_profile": request.context.profile_analysis is not None, "goal_names": [g.name for g in request.context.goals], "suggested_strategy": _suggested_strategy(request.context)}
            return AgentChatResponse(message=OpenAICompatibleProvider().complete(request.message, safe).content)
        except Exception:
            return AgentChatResponse(message="The language provider is unavailable, so I stayed in the safe deterministic companion mode. I can explain your current profile or prepare supported profile and goal changes.", fallback_used=True)
    return AgentChatResponse(message="I can explain the suggested strategy, prepare a salary/capacity update, or delay one of your current goals. Changes always require explicit approval.")


def os_mode() -> str:
    import os
    return os.getenv("AGENT_MODE", "demo").lower()


def get_proposal(proposal_id: str, session_id: str | None = None) -> AgentProposal:
    proposal = _proposals.get(proposal_id)
    if not proposal or (session_id is not None and proposal.session_id != session_id):
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status == "pending" and _now() >= datetime.fromisoformat(proposal.expires_at):
        proposal.status = "expired"
    return proposal


def decide(proposal_id: str, session_id: str, approve: bool) -> AgentProposal:
    with _lock:
        proposal = get_proposal(proposal_id, session_id)
        if proposal.status != "pending":
            raise HTTPException(status_code=409, detail=f"Proposal is {proposal.status} and cannot be changed")
        proposal.status = "approved" if approve else "rejected"
        return proposal

