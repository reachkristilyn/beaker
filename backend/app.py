from fastapi import FastAPI
from pydantic import BaseModel
from agents import Runner

from backend.beaker_agents.grant_agents import grant_match_agent

from dotenv import load_dotenv

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
        f"Research {request.org_name}. "
        f"Website: {request.website or 'Not provided'}. "
        "Find currently available or clearly upcoming grant opportunities."
    )

    result = Runner.run_sync(grant_match_agent, prompt)

    return {"report": result.final_output}