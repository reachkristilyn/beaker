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


class FederalGrant(BaseModel):
    # Built in app.py from the Grants.gov API — NOT written by the agent.
    grantName: str
    agency: str
    number: str | None
    deadline: str | None      # ISO date from Grants.gov; past-deadline ones dropped in code
    award: str | None         # None for now — search2 doesn't return an amount
    sourceUrl: str


class WebGrant(BaseModel):
    # Written by the agent from web search — foundations, state/local, corporate, RFPs.
    grantName: str
    funder: str
    deadlineText: str | None  # EXACTLY as written on the page ("Rolling", "March 2026") — never parsed
    sourceUrl: str            # required — no link means the grant is omitted
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
    webGrants: list[WebGrant]
    grantSearchKeywords: list[str]
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
    - Use web search to find NON-FEDERAL grant opportunities: private and
      community foundations, corporate giving, and state or local programs.
      Do NOT list federal or Grants.gov opportunities here — those are pulled
      from a separate source.
    - Only include a web grant if you found a specific opportunity with a
      working source URL. No source link means do not include it.
    - Report the deadline exactly as written on the source page. Never convert,
      infer, or guess it. If no deadline is stated, leave it null.
    - For each, write a short rationale for why it fits this organization.
    - Provide thoughtful questions for an introductory call.
    - Add verification notes for missing, conflicting, old, or uncertain facts.
    - Never invent names, programs, financial figures, funders, or dates.
    - Use empty lists when reliable information cannot be found.
    - Also produce 2 to 4 short keyword phrases (1-3 words each) suited to
      searching a FEDERAL grants database for opportunities matching this
      organization — e.g. "reentry", "workforce development", "youth mentoring".
      Base them on the mission, population served, and programs. These are
      search terms, not grant names.
    """,
    tools=[WebSearchTool()],
    output_type=ResearchFindings,
)