/**
 * Rule-based post-log suggestions (no LLM).
 * Called after time entries are saved to provide contextual feedback.
 */

export type SuggestionType =
  | "profitability_warning"
  | "scope_creep_warning"
  | "daily_summary"
  | "progress_update";

export type SuggestionSeverity = "high" | "info" | "low";

export interface PostLogSuggestion {
  type: SuggestionType;
  severity: SuggestionSeverity;
  projectName?: string;
  data: Record<string, unknown>;
}

export interface ProjectSuggestionContext {
  projectId: string;
  projectName: string;
  realHourly: number | null;
  nominalHourly: number | null;
  currency: string;
  progressPercent: number;
  savedCategories: string[];
  recentCategories: string[]; // newest first (includes just-saved entries)
}

export interface DailySuggestionContext {
  date: string;
  totalMinutes: number;
}

export function computePostLogSuggestions(
  projects: ProjectSuggestionContext[],
  dailyContexts: DailySuggestionContext[],
): PostLogSuggestion[] {
  const suggestions: PostLogSuggestion[] = [];

  for (const ctx of projects) {
    // Rule A: Profitability warning — realHourly < nominalHourly * 0.5
    if (
      ctx.realHourly !== null &&
      ctx.nominalHourly !== null &&
      ctx.nominalHourly > 0 &&
      ctx.realHourly < ctx.nominalHourly * 0.5
    ) {
      suggestions.push({
        type: "profitability_warning",
        severity: "high",
        projectName: ctx.projectName,
        data: {
          realHourly: ctx.realHourly,
          nominalHourly: ctx.nominalHourly,
          currency: ctx.currency,
          ratio: Math.round((ctx.realHourly / ctx.nominalHourly) * 100),
        },
      });
    }

    // Rule B: Scope creep — 3+ consecutive revision entries (newest first)
    let consecutiveRevisions = 0;
    for (const cat of ctx.recentCategories) {
      if (cat === "revision") consecutiveRevisions++;
      else break;
    }
    if (consecutiveRevisions >= 3) {
      suggestions.push({
        type: "scope_creep_warning",
        severity: "high",
        projectName: ctx.projectName,
        data: { consecutiveRevisions },
      });
    }

    // Rule D: Progress update — dev/design category saved + progress < 100
    const hasDevOrDesign = ctx.savedCategories.some(
      (c) => c === "development" || c === "design",
    );
    if (hasDevOrDesign && ctx.progressPercent < 100) {
      suggestions.push({
        type: "progress_update",
        severity: "low",
        projectName: ctx.projectName,
        data: {
          currentProgress: ctx.progressPercent,
          projectId: ctx.projectId,
        },
      });
    }
  }

  // Rule C: Daily summary — any date with >= 6 hours
  for (const daily of dailyContexts) {
    if (daily.totalMinutes >= 360) {
      suggestions.push({
        type: "daily_summary",
        severity: "info",
        data: {
          date: daily.date,
          totalMinutes: daily.totalMinutes,
          totalHours: Math.round((daily.totalMinutes / 60) * 10) / 10,
        },
      });
      break; // only one daily summary
    }
  }

  return suggestions;
}
