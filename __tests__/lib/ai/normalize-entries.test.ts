import { normalizeEntries } from "@/lib/ai/normalize-parsed-entries";
import type { LLMParseResponse, ProjectForMatching } from "@/types/time-log";

// ── Fixtures ──
const projects: ProjectForMatching[] = [
  { id: "proj-1", name: "ABC \uB9AC\uBE0C\uB79C\uB529", aliases: ["ABC"], clientName: null },
  { id: "proj-2", name: "XYZ \uC6F9\uC0AC\uC774\uD2B8", aliases: null, clientName: null },
];

const TIMEZONE = "Asia/Seoul";

/** Helper to build a single-entry LLMParseResponse */
function makeLLM(
  overrides: Partial<LLMParseResponse["entries"][0]>,
): LLMParseResponse {
  return {
    entries: [
      {
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uC791\uC5C5",
        date: "2026-02-08",
        duration_minutes: 120,
        duration_source: "explicit",
        category: "development",
        intent: "done",
        ...overrides,
      },
    ],
    progress_hint: null,
  };
}

// ──────────────────────────────────────────────
// Issue Code Logic
// ──────────────────────────────────────────────
describe("normalizeEntries — issue code assignment", () => {
  it("null date -> DATE_AMBIGUOUS (warning, not blocking)", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uB514\uC790\uC778",
        date: null,
        duration_minutes: 120,
        duration_source: "explicit",
        category: "design",
        intent: "done",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("DATE_AMBIGUOUS");
    expect(entry.needsUserAction).toBe(false);
  });

  it("duration_source=missing -> DURATION_MISSING (blocking, default 60)", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uD68C\uC758",
        date: "2026-02-08",
        duration_minutes: null,
        duration_source: "missing",
        category: "meeting",
        intent: "done",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("DURATION_MISSING");
    expect(entry.durationMinutes).toBe(60);
    expect(entry.needsUserAction).toBe(true);
  });

  it("duration_source=ambiguous -> DURATION_AMBIGUOUS (warning, keeps LLM value)", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uAC1C\uBC1C",
        date: "2026-02-08",
        duration_minutes: 90,
        duration_source: "ambiguous",
        category: "development",
        intent: "done",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("DURATION_AMBIGUOUS");
    expect(entry.durationMinutes).toBe(90);
    expect(entry.needsUserAction).toBe(false);
  });

  it("duration_source=ambiguous with null minutes defaults to 60", () => {
    const result = normalizeEntries(
      makeLLM({
        duration_minutes: null,
        duration_source: "ambiguous",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("DURATION_AMBIGUOUS");
    expect(entry.durationMinutes).toBe(60);
  });

  it("intent=planned -> FUTURE_INTENT (warning, not blocking)", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uB0B4\uC77C \uD560 \uC77C",
        date: "2026-02-09",
        duration_minutes: 120,
        duration_source: "explicit",
        category: "development",
        intent: "planned",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("FUTURE_INTENT");
    expect(entry.needsUserAction).toBe(false);
  });

  it("unmatched project -> PROJECT_UNMATCHED (blocking)", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "\uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uD504\uB85C\uC81D\uD2B8",
        task_description: "\uC791\uC5C5",
        date: "2026-02-08",
        duration_minutes: 60,
        duration_source: "explicit",
        category: "development",
        intent: "done",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("PROJECT_UNMATCHED");
    expect(entry.matchedProjectId).toBeNull();
    expect(entry.needsUserAction).toBe(true);
  });

  it("normal match -> no issues", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
        task_description: "\uB85C\uACE0 \uC791\uC5C5",
        date: "2026-02-08",
        duration_minutes: 120,
        duration_source: "explicit",
        category: "design",
        intent: "done",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toHaveLength(0);
    expect(entry.matchedProjectId).toBe("proj-1");
    expect(entry.needsUserAction).toBe(false);
  });

  it("matches project by alias", () => {
    const result = normalizeEntries(
      makeLLM({
        project_name_raw: "ABC",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.matchedProjectId).toBe("proj-1");
    expect(entry.matchSource).toBe("alias");
    expect(entry.issues).toHaveLength(0);
  });

  it("multiple issues can coexist", () => {
    // null date + planned intent = DATE_AMBIGUOUS + FUTURE_INTENT
    const result = normalizeEntries(
      makeLLM({
        date: null,
        intent: "planned",
      }),
      projects,
      TIMEZONE,
    );
    const entry = result.entries[0];
    expect(entry.issues).toContain("DATE_AMBIGUOUS");
    expect(entry.issues).toContain("FUTURE_INTENT");
    // Both are warnings, so not blocking
    expect(entry.needsUserAction).toBe(false);
  });
});

// ──────────────────────────────────────────────
// parseSummary
// ──────────────────────────────────────────────
describe("normalizeEntries — parseSummary", () => {
  it("reports total and blocking counts", () => {
    const raw: LLMParseResponse = {
      entries: [
        {
          project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
          task_description: "\uC791\uC5C5 1",
          date: "2026-02-08",
          duration_minutes: 60,
          duration_source: "explicit",
          category: "development",
          intent: "done",
        },
        {
          project_name_raw: "\uC5C6\uB294 \uD504\uB85C\uC81D\uD2B8",
          task_description: "\uC791\uC5C5 2",
          date: "2026-02-08",
          duration_minutes: 60,
          duration_source: "explicit",
          category: "development",
          intent: "done",
        },
      ],
      progress_hint: null,
    };
    const result = normalizeEntries(raw, projects, TIMEZONE);
    expect(result.parseSummary.total).toBe(2);
    expect(result.parseSummary.blocking).toBe(1); // second entry unmatched
  });
});

// ──────────────────────────────────────────────
// progressHint conversion
// ──────────────────────────────────────────────
describe("normalizeEntries — progressHint", () => {
  it("converts snake_case progress_hint to camelCase", () => {
    const raw: LLMParseResponse = {
      entries: [
        {
          project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
          task_description: "\uC791\uC5C5",
          date: "2026-02-08",
          duration_minutes: 60,
          duration_source: "explicit",
          category: "development",
          intent: "done",
        },
      ],
      progress_hint: {
        detected: true,
        suggested_progress: 75,
        reason: "Almost done",
        project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
      },
    };
    const result = normalizeEntries(raw, projects, TIMEZONE);
    expect(result.progressHint).not.toBeNull();
    expect(result.progressHint!.detected).toBe(true);
    expect(result.progressHint!.suggestedProgress).toBe(75);
    expect(result.progressHint!.reason).toBe("Almost done");
    expect(result.progressHint!.projectNameRaw).toBe("ABC \uB9AC\uBE0C\uB79C\uB529");
  });

  it("returns null when progress_hint is null", () => {
    const result = normalizeEntries(
      makeLLM({}),
      projects,
      TIMEZONE,
    );
    expect(result.progressHint).toBeNull();
  });

  it("returns null when progress_hint.detected is false", () => {
    const raw: LLMParseResponse = {
      entries: [
        {
          project_name_raw: "ABC \uB9AC\uBE0C\uB79C\uB529",
          task_description: "\uC791\uC5C5",
          date: "2026-02-08",
          duration_minutes: 60,
          duration_source: "explicit",
          category: "development",
          intent: "done",
        },
      ],
      progress_hint: {
        detected: false,
        suggested_progress: null,
        reason: "",
        project_name_raw: null,
      },
    };
    const result = normalizeEntries(raw, projects, TIMEZONE);
    expect(result.progressHint).toBeNull();
  });
});

// ──────────────────────────────────────────────
// canSaveAll logic (pure function reproduction)
// ──────────────────────────────────────────────
describe("canSaveAll logic", () => {
  /**
   * Reproduces the canSaveAll validation logic from the draft store.
   * A set of entries can be saved only if all have a matched project
   * and valid minutes (1..1440).
   */
  function canSaveAll(
    entries: { matchedProjectId: string | null; durationMinutes: number | null }[],
  ): boolean {
    if (entries.length === 0) return false;
    return entries.every(
      (e) =>
        e.matchedProjectId !== null &&
        e.durationMinutes !== null &&
        e.durationMinutes >= 1 &&
        e.durationMinutes <= 1440,
    );
  }

  it("returns true when all entries are valid", () => {
    expect(
      canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 60 },
        { matchedProjectId: "p2", durationMinutes: 120 },
      ]),
    ).toBe(true);
  });

  it("returns false when a projectId is null", () => {
    expect(
      canSaveAll([
        { matchedProjectId: "p1", durationMinutes: 60 },
        { matchedProjectId: null, durationMinutes: 120 },
      ]),
    ).toBe(false);
  });

  it("returns false when minutes = 0", () => {
    expect(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 0 }]),
    ).toBe(false);
  });

  it("returns false when minutes = null", () => {
    expect(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: null }]),
    ).toBe(false);
  });

  it("returns false when minutes > 1440", () => {
    expect(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 1441 }]),
    ).toBe(false);
  });

  it("returns false for empty entries", () => {
    expect(canSaveAll([])).toBe(false);
  });

  it("returns true at minimum boundary: minutes = 1", () => {
    expect(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 1 }]),
    ).toBe(true);
  });

  it("returns true at maximum boundary: minutes = 1440", () => {
    expect(
      canSaveAll([{ matchedProjectId: "p1", durationMinutes: 1440 }]),
    ).toBe(true);
  });
});
