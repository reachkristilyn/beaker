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

  const report = (backendPayload as { report?: unknown })?.report;

  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return errorResponse(
      502,
      "RESEARCH_FAILED",
      "The research backend returned an invalid report."
    );
  }

  return NextResponse.json(report as ResearchReport);
}