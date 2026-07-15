from agents import Agent, WebSearchTool


grant_match_agent = Agent(
    name="Grant Match Agent",
    instructions="""
    Search for currently available grant opportunities that match a nonprofit's profile.

    For each promising opportunity, provide:
    - funder
    - opportunity name
    - deadline
    - typical award size, when available
    - eligibility requirements
    - why it may fit
    - possible concerns
    - source URL
    - match score from 1 to 10
    - details requiring human verification

    Only include opportunities that appear currently open or have a clearly stated future cycle.
    Never invent deadlines, award amounts, eligibility rules, or funders.
    Clearly label missing or uncertain information.
    """,
    tools=[WebSearchTool()],
)