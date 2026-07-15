# Beaker

## Mission

Beaker is an AI experimentation platform for building practical, trustworthy AI software.

The goal is not to build AI demos. The goal is to build software that solves real problems and helps people make better decisions.

The first application is Grant Research.

---

## Vision

Every application built within Beaker should be capable of standing on its own as a useful product while sharing a common engineering philosophy and architecture.

Future applications may include accessibility analysis, event design and planning, resume review, robotics research, and other AI-assisted workflows.

---

## Philosophy

Build software that happens to use AI.

Do not build AI demos.

Technology should expand human capability, not replace human judgment.

Human judgment always comes before AI output.

Prefer evidence over confidence.

Prefer clarity over cleverness.

Prefer maintainability over speed.

Every feature should answer one question:

> Would someone actually use this?

---

## Engineering Principles

- Build small, composable components.
- Keep frontend and backend responsibilities separate.
- Never expose secrets to the client.
- Use strong typing whenever possible.
- Share data contracts between frontend and backend.
- Favor explicit code over hidden abstractions.
- Write production-quality software rather than tutorial code.
- Comment **why**, not **what**.

---

## AI Principles

AI should:

- distinguish facts from analysis
- communicate uncertainty
- surface missing information
- encourage verification
- assist human decision-making rather than replace it

The system should never present speculation as fact.

Confidence should always be visible.

---

## Current Architecture

Frontend

- Next.js (App Router)
- TypeScript
- TSX Components
- CSS Modules

Backend

- Server-side API Routes
- OpenAI Agents SDK
- Shared TypeScript contracts

Deployment

- GitHub
- Vercel

---

## Project Structure

```
beaker/

main.py                 # Original Python prototype

src/
    app/
    components/
    lib/

public/

requirements.txt
package.json
ARCHITECTURE.md
```

---

## Development Principles

Before adding a new feature ask:

1. Is this solving a real problem?
2. Is there a simpler solution?
3. Will I understand this six months from now?
4. Can another developer understand this quickly?
5. Does this improve the overall platform?

---

## Roadmap

### Version 1

Grant Research

### Version 2

- Multi-agent orchestration
- Confidence scoring
- Markdown export
- Better report formatting

### Version 3

Additional Beaker applications including:

- Accessibility Review
- Resume Review
- Event & Design Planning
- Research Workflows
- Robotics

---

## Definition of Done

A feature is complete when it is:

- useful
- understandable
- maintainable
- tested
- documented

---

## Long-Term Goal

Build an ecosystem of practical AI applications that demonstrate thoughtful engineering, trustworthy AI, and human-centered design.