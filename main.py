from dotenv import load_dotenv
from agents import Agent, Runner, WebSearchTool

load_dotenv()

agent = Agent(
    name="Grant Research Assistant",
    instructions="""
    Research nonprofit organizations using current public sources.

    Summarize:
    - mission and programs
    - leadership and geography
    - funding or financial information
    - strengths
    - unanswered questions

    Clearly distinguish sourced facts from your analysis.
    """,
    tools=[WebSearchTool()],
)

question = input("Organization or research question: ")

result = Runner.run_sync(agent, question)

print("\n" + result.final_output)