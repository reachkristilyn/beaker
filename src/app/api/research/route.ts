import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode, ResearchReport } from "@/lib/types";

/**
 * POST /api/research
 *
 * Currently returns mock data shaped exactly like the eventual real
 * response. OPENAI_API_KEY is available via process.env in this file only —
 * this route runs exclusively on the server and nothing here is ever
 * bundled for the client. The real OpenAI call will replace
 * buildMockReport() without changing the ResearchReport contract.
 */

// ── DEV ONLY ─────────────────────────────────────────────────────────────
// Simulated latency so the loading state can be exercised locally.
// Remove this constant and its `await` below before wiring the real call.
const DEV_MOCK_DELAY_MS = 1500;
// ─────────────────────────────────────────────────────────────────────────

function errorResponse(status: number, code: ApiErrorCode, message: string) {
  const body: ApiErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400, "INVALID_REQUEST", "Request body must be valid JSON.");
  }

  const { orgName, website } = (payload ?? {}) as Record<string, unknown>;

  if (typeof orgName !== "string" || orgName.trim().length === 0) {
    return errorResponse(400, "INVALID_REQUEST", "Organization name is required.");
  }
  if (website !== undefined && typeof website !== "string") {
    return errorResponse(400, "INVALID_REQUEST", "Website must be text when provided.");
  }

  const name = orgName.trim();
  const site = website?.trim() || undefined;

  const backendUrl = process.env.PYTHON_BACKEND_URL ?? "http://127.0.0.1:8000";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${backendUrl}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_name: name, website: site ?? null }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "Could not reach the research backend. Confirm it is running and try again."
    );
  }

  if (!backendResponse.ok) {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      `The research backend returned an error (status ${backendResponse.status}).`
    );
  }

  let backendPayload: unknown;
  try {
    backendPayload = await backendResponse.json();
  } catch {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "The research backend returned a response that could not be read."
    );
  }

  const reportText = (backendPayload as { report?: unknown })?.report;
  if (typeof reportText !== "string" || reportText.trim().length === 0) {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "The research backend returned no report content."
    );
  }

  // TEMPORARY SHAPE ADAPTER: the Python backend currently returns one
  // unstructured string. Until it returns structured JSON, the full text
  // is placed in executiveSummary and the section fields are left empty
  // so the existing ResearchReport contract and frontend keep working.
  const report: ResearchReport = {
    orgName: name,
    website: site,
    generatedAt: new Date().toISOString(),
    executiveSummary: reportText.trim(),
    mission: "",
    programs: [],
    leadership: [],
    financialSnapshot: [],
    existingFunders: [],
    grantFits: [],
    introCallQuestions: [],
    verificationNotes: [
      {
        confidence: "low",
        note: "This report arrived as unstructured text from the research backend. Section-level breakdown and confidence grading are unavailable until the backend returns structured output.",
      },
    ],
  };

  return NextResponse.json(report);
}

  const name = orgName.trim();
  const site = typeof website === "string" ? website.trim() : "";

  try {
    const backendUrl =
      process.env.PYTHON_BACKEND_URL ?? "http://127.0.0.1:8000";

    const response = await fetch(`${backendUrl}/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        org_name: name,
        website: site || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}`);
    }

    const data = (await response.json()) as { report: string };

    const report: ResearchReport = {
      orgName: name,
      website: site || undefined,
      generatedAt: new Date().toISOString(),
      executiveSummary: data.report,
      mission: "Included in the research report above.",
      programs: [],
      leadership: [],
      financialSnapshot: [],
      existingFunders: [],
      grantFits: [],
      introCallQuestions: [],
      verificationNotes: [
        {
          confidence: "medium",
          note: "This report was generated from current web research and requires human verification.",
        },
      ],
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);

    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "The Python research service could not be reached."
    );
  }
}

  const name = orgName.trim();
  const site = website?.trim() || undefined;

  // ── DEV ONLY: simulated latency ──────────────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, DEV_MOCK_DELAY_MS));
  // ─────────────────────────────────────────────────────────────────────

  // ── DEV ONLY: error trigger ──────────────────────────────────────────
  // Submitting the organization name "error" (case-insensitive) exercises
  // the UI's error state. Remove this block before production.
  if (name.toLowerCase() === "error") {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "Research could not be completed for this organization. Try again, or adjust the name and website."
    );
  }
  // ─────────────────────────────────────────────────────────────────────

  return NextResponse.json(buildMockReport(name, site));
}

/**
 * MOCK DATA — placeholder content only. Every value below is invented for
 * interface development and describes no real organization.
 */
function buildMockReport(orgName: string, website?: string): ResearchReport {
  return {
    orgName,
    website,
    generatedAt: new Date().toISOString(),
    executiveSummary: `${orgName} presents as a community-rooted nonprofit with a focused program model and early signs of institutional funding readiness. Its public materials emphasize direct service outcomes, but several claims — budget size, program reach, and staffing — could not be independently verified from this mock dataset and are flagged below.`,
    mission: `${orgName} works to expand access and opportunity for the community it serves, pairing direct programming with partnerships that extend its reach.`,
    programs: [
      "Core direct-service program operating year-round at two community sites",
      "Seasonal cohort program serving roughly 120 participants per cycle",
      "Volunteer training pipeline that supplies program staff and community ambassadors",
    ],
    leadership: [
      {
        name: "Jordan Reyes",
        role: "Executive Director",
        note: "Founder; background in community organizing.",
      },
      {
        name: "Amara Okafor",
        role: "Board Chair",
        note: "Corporate finance background; joined the board in 2023.",
      },
      {
        name: "Sam Whitfield",
        role: "Program Director",
        note: "Oversees both program sites.",
      },
    ],
    financialSnapshot: [
      { label: "Most recent annual budget", value: "$850,000", note: "Self-reported; no 990 reviewed." },
      { label: "Revenue mix", value: "60% foundation grants, 25% individual giving, 15% events" },
      { label: "Year-over-year growth", value: "+18%", note: "Directional estimate." },
      { label: "Staff size", value: "7 full-time, 12 part-time" },
    ],
    existingFunders: [
      "Local community foundation (general operating)",
      "Two family foundations (program-restricted)",
      "One corporate giving program (event sponsorship)",
    ],
    grantFits: [
      {
        funder: "Regional Health & Opportunity Fund",
        program: "Community Capacity grants",
        rationale: "Funds direct-service organizations at this budget size; priorities align with the core program model.",
      },
      {
        funder: "Statewide Youth Futures Foundation",
        rationale: "Multi-year general operating support for organizations moving from founder-led to institutional fundraising.",
      },
      {
        funder: "Metro Corporate Responsibility Council",
        program: "Employee-engagement partnerships",
        rationale: "The volunteer pipeline is a natural fit for corporate volunteer-hour commitments paired with funding.",
      },
    ],
    introCallQuestions: [
      "What does the current grant pipeline look like, and who owns it day to day?",
      "Is the $850K budget figure current, and is a recent 990 or audit available?",
      "Which program outcomes are measured, and how are they reported to funders?",
      "What is the board's role in fundraising today?",
      "Are there capacity constraints that new funding would need to address first?",
    ],
    verificationNotes: [
      { confidence: "high", note: "Program model and sites are consistently described across public materials." },
      { confidence: "medium", note: "Budget and revenue mix are self-reported; verify against the most recent Form 990." },
      { confidence: "low", note: "Growth figure is directional only — no financial documents were reviewed for this mock report." },
    ],
  };
}
