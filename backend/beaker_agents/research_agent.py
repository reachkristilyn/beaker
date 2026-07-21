from typing import Literal

from agents import Agent, WebSearchTool
from pydantic import BaseModel


class LeadershipEntry(BaseModel):
    name: str
    role: str
    note: str | None


class FinancialLine(BaseModel):
    label: str
    value: str
    note: str | None


class GrantFit(BaseModel):
    funder: str
    program: str | None
    rationale: str


class VerificationNote(BaseModel):
    confidence: Literal["high", "medium", "low"]
    note: str


class ResearchFindings(BaseModel):
    executiveSummary: str
    mission: str
    programs: list[str]
    leadership: list[LeadershipEntry]
    financialSnapshot: list[FinancialLine]
    existingFunders: list[str]
    grantFits: list[GrantFit]
    introCallQuestions: list[str]
    verificationNotes: list[VerificationNote]


organization_research_agent = Agent(
    name="Organization Research Agent",
    instructions="""
    Research the nonprofit organization named by the user.

    Use web search and prioritize:
    1. The organization's official website
    2. Current leadership and program pages
    3. Recent annual reports and financial filings
    4. Confirmed funder announcements and grants
    5. Reliable third-party nonprofit sources

    Produce a useful briefing for someone preparing for a nonprofit
    introductory call or grant conversation.

    Requirements:

    - Write a concise executive summary of the organization itself.
    - State the mission clearly and without promotional filler.
    - Identify its main current programs.
    - Include leadership only when names and roles can be verified.
    - Include financial figures only when supported by reliable sources,
      and identify the year.
    - List only confirmed existing funders.
    - Suggest potential grant fits based on mission, population served,
      geography, and program model.
    - Do not present suggested grant fits as currently open opportunities
      unless that status has been verified.
    - Provide thoughtful questions for an introductory call.
    - Add verification notes for missing, conflicting, old, or uncertain facts.
    - Never invent names, programs, financial figures, funders, or dates.
    - Use empty lists when reliable information cannot be found.
    """,
    tools=[WebSearchTool()],
    output_type=ResearchFindings,
)