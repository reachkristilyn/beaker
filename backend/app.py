from datetime import datetime, timezone

from agents import Runner
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from backend.beaker_agents.research_agent import organization_research_agent


load_dotenv()

app = FastAPI()


class ResearchRequest(BaseModel):
    org_name: str
    website: str | None = None


@app.get("/")
def health_check():
    return {"status": "Beaker backend is running"}


@app.post("/research")
def research(request: ResearchRequest):
    prompt = (
        f"Research the nonprofit organization {request.org_name}. "
        f"Official website: {request.website or 'Not provided'}. "
        "Prepare a complete organization briefing using the required structured format."
    )

    result = Runner.run_sync(organization_research_agent, prompt)
    findings = result.final_output

    report = {
        "orgName": request.org_name,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        **findings.model_dump(),
    }

    if request.website:
        report["website"] = request.website

    return {"report": report}