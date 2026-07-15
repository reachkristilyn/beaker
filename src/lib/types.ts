/**
 * Shared contract between the /api/research route and the UI.
 *
 * When the mock route is replaced with the real OpenAI call, the route's
 * internals change but this contract should not. The frontend renders
 * whatever satisfies ResearchReport.
 */

export interface ResearchRequest {
  orgName: string;
  website?: string;
}

export interface LeadershipEntry {
  name: string;
  role: string;
  note?: string;
}

export interface FinancialLine {
  label: string;
  value: string;
  note?: string;
}

export interface GrantFit {
  funder: string;
  program?: string;
  rationale: string;
}

export type Confidence = "high" | "medium" | "low";

export interface VerificationNote {
  confidence: Confidence;
  note: string;
}

export interface ResearchReport {
  orgName: string;
  website?: string;
  /** ISO 8601 timestamp set by the server when the report was produced. */
  generatedAt: string;
  executiveSummary: string;
  mission: string;
  programs: string[];
  leadership: LeadershipEntry[];
  financialSnapshot: FinancialLine[];
  existingFunders: string[];
  grantFits: GrantFit[];
  introCallQuestions: string[];
  verificationNotes: VerificationNote[];
}

export type ApiErrorCode = "INVALID_REQUEST" | "RESEARCH_FAILED";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
