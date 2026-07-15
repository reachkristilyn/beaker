from dotenv import load_dotenv
from agents import Runner
from beaker_agents.grant_agents import grant_match_agent

load_dotenv()

question = input("Describe the nonprofit and funding need: ")

result = Runner.run_sync(grant_match_agent, question)

print("\n" + result.final_output)