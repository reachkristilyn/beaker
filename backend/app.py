from datetime import datetime, timezone

from agents import Runner
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from backend.beaker_agents.research_agent import organization_research_agent
from backend.beaker_agents.grants_gov import search_grants


load_dotenv()

app = FastAPI()


class ResearchRequest(BaseModel):
    org_name: str
    website: str | None = None


@app.get("/")
def health_check():
    return {"status": "Beaker backend is running"}


def _federal_grants_from_keywords(keywords: list[str], limit: int = 12) -> list[dict]:
    """
    Query Grants.gov for each agent-suggested keyword, dedupe, and shape the
    results to the FederalGrant schema. search_grants already drops anything
    past its close date, so this list is date-guaranteed.
    """
    seen: set[str] = set()
    federal: list[dict] = []

    for kw in keywords[:4]:  # cap to keep latency sane — each keyword is a network call
        for g in search_grants(kw):
            key = g.number or g.grant_name
            if key in seen:
                continue
            seen.add(key)
            federal.append(
                {
                    "grantName": g.grant_name,
                    "agency": g.agency,
                    "number": g.number or None,
                    "deadline": g.deadline,
                    "award": None,  # search2 doesn't return an amount
                    "sourceUrl": g.source_url,
                }
            )

    federal.sort(key=lambda x: (x["deadline"] is None, x["deadline"] or ""))
    return federal[:limit]


@app.post("/research")
def research(request: ResearchRequest):
    prompt = (
        f"Research the nonprofit organization {request.org_name}. "
        f"Official website: {request.website or 'Not provided'}. "
        "Prepare a complete organization briefing using the required structured format."
    )

    result = Runner.run_sync(organization_research_agent, prompt)
    findings = result.final_output.model_dump()

    # Pull the agent's federal-search keywords out of the report body.
    keywords = findings.pop("grantSearchKeywords", []) or []

    # Federal grants come from Grants.gov (structured, date-guarded) — not the agent.
    federal_grants = _federal_grants_from_keywords(keywords)

    report = {
        "orgName": request.org_name,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "federalGrants": federal_grants,
        **findings,  # includes webGrants + all the org sections
    }

    if request.website:
        report["website"] = request.website

    return {"report": report}