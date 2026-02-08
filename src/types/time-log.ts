export const CATEGORIES = [
  "planning",
  "design",
  "development",
  "meeting",
  "revision",
  "admin",
  "email",
  "research",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Intent = "done" | "planned";

export type MatchSource = "alias" | "name" | "client" | "none";

export type IssueCode =
  | "PROJECT_UNMATCHED"
  | "PROJECT_AMBIGUOUS"
  | "DURATION_MISSING"
  | "DATE_AMBIGUOUS"
  | "DURATION_AMBIGUOUS"
  | "CATEGORY_AMBIGUOUS"
  | "FUTURE_INTENT";

export const BLOCKING_ISSUES: IssueCode[] = [
  "PROJECT_UNMATCHED",
  "PROJECT_AMBIGUOUS",
  "DURATION_MISSING",
];

export const WARNING_ISSUES: IssueCode[] = [
  "DATE_AMBIGUOUS",
  "DURATION_AMBIGUOUS",
  "CATEGORY_AMBIGUOUS",
];

export interface ParsedEntry {
  id: string;
  projectNameRaw: string;
  matchedProjectId: string | null;
  matchSource: MatchSource;
  taskDescription: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number | null;
  category: Category;
  intent: Intent;
  issues: IssueCode[];
  needsUserAction: boolean;
  clarificationQuestion: string | null;
}

export interface ParseSummary {
  total: number;
  blocking: number;
}

export interface ParsedResponse {
  entries: ParsedEntry[];
  parseSummary: ParseSummary;
}
