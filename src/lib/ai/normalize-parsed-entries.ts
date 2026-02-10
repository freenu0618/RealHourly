import { generateId } from "@/lib/utils/nanoid";
import { matchProject } from "./fuzzy-match";
import {
  BLOCKING_ISSUES,
  type IssueCode,
  type LLMParseResponse,
  type MatchSource,
  type ParsedEntry,
  type ParsedResponse,
  type ProjectForMatching,
} from "@/types/time-log";

/**
 * Resolve relative date expressions to YYYY-MM-DD using user timezone.
 */
function resolveDate(
  raw: string | null,
  userTimezone: string,
): { date: string; ambiguous: boolean } {
  // Get "today" in the user's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: userTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now); // YYYY-MM-DD

  if (raw === null) {
    return { date: todayStr, ambiguous: true };
  }

  const trimmed = raw.trim().toLowerCase();

  // Relative date keywords
  const relativeMap: Record<string, number> = {
    오늘: 0,
    today: 0,
    어제: -1,
    yesterday: -1,
    그제: -2,
    그저께: -2,
    내일: 1,
    tomorrow: 1,
    모레: 2,
  };

  if (trimmed in relativeMap) {
    const offset = relativeMap[trimmed];
    const d = new Date(now.getTime() + offset * 86_400_000);
    const resolved = new Intl.DateTimeFormat("en-CA", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    return { date: resolved, ambiguous: false };
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { date: trimmed, ambiguous: false };
  }

  // MM/DD or MM-DD → prepend current year
  const mdMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (mdMatch) {
    const year = now.getFullYear();
    const month = mdMatch[1].padStart(2, "0");
    const day = mdMatch[2].padStart(2, "0");
    return { date: `${year}-${month}-${day}`, ambiguous: false };
  }

  // Unrecognized → treat as ambiguous, default to today
  return { date: todayStr, ambiguous: true };
}

export function normalizeEntries(
  raw: LLMParseResponse,
  activeProjects: ProjectForMatching[],
  userTimezone: string,
  preferredProjectId?: string,
): ParsedResponse {
  const entries: ParsedEntry[] = raw.entries.map((llmEntry) => {
    const issues: IssueCode[] = [];
    let clarificationQuestion: string | null = null;

    // 1. Project matching
    const match = matchProject(llmEntry.project_name_raw, activeProjects);
    let matchedProjectId = match.projectId;
    let matchSource: MatchSource = match.source;

    if (match.candidates === 0) {
      // No match found — try preferred project fallback
      if (preferredProjectId && activeProjects.some((p) => p.id === preferredProjectId)) {
        matchedProjectId = preferredProjectId;
        matchSource = "preferred";
      } else {
        issues.push("PROJECT_UNMATCHED");
        clarificationQuestion = "프로젝트를 선택해주세요";
        matchedProjectId = null;
        matchSource = "none";
      }
    } else if (match.candidates >= 2) {
      issues.push("PROJECT_AMBIGUOUS");
      clarificationQuestion = "여러 프로젝트가 매칭되었습니다. 올바른 프로젝트를 선택해주세요";
    }

    // 2. Date normalization
    const { date, ambiguous: dateAmbiguous } = resolveDate(
      llmEntry.date,
      userTimezone,
    );
    if (dateAmbiguous) {
      issues.push("DATE_AMBIGUOUS");
    }

    // 3. Duration normalization
    let durationMinutes = llmEntry.duration_minutes;
    if (llmEntry.duration_source === "missing") {
      durationMinutes = 60;
      issues.push("DURATION_MISSING");
      if (!clarificationQuestion) {
        clarificationQuestion = "소요 시간을 입력해주세요";
      }
    } else if (llmEntry.duration_source === "ambiguous") {
      durationMinutes = durationMinutes ?? 60;
      issues.push("DURATION_AMBIGUOUS");
    }

    // 4. Intent → FUTURE_INTENT
    if (llmEntry.intent === "planned") {
      issues.push("FUTURE_INTENT");
    }

    // 5. needs_user_action
    const needsUserAction = issues.some((i) =>
      BLOCKING_ISSUES.includes(i),
    );

    return {
      id: generateId(),
      projectNameRaw: llmEntry.project_name_raw,
      matchedProjectId,
      matchSource,
      taskDescription: llmEntry.task_description,
      date,
      durationMinutes,
      category: llmEntry.category,
      intent: llmEntry.intent,
      issues,
      needsUserAction,
      clarificationQuestion,
    };
  });

  const blocking = entries.filter((e) => e.needsUserAction).length;

  // Convert LLM progress_hint (snake_case) to camelCase
  const progressHint = raw.progress_hint?.detected
    ? {
        detected: true,
        suggestedProgress: raw.progress_hint.suggested_progress,
        reason: raw.progress_hint.reason,
        projectNameRaw: raw.progress_hint.project_name_raw,
      }
    : null;

  return {
    entries,
    parseSummary: { total: entries.length, blocking },
    progressHint,
  };
}
