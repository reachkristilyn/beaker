import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode, ResearchReport } from "@/lib/types";

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