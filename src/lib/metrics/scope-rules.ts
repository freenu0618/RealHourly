type AlertType = "scope_rule1" | "scope_rule2" | "scope_rule3" | "scope_rule4";

interface ProjectInfo {
  expectedHours: number | null;
  progressPercent: number;
  agreedRevisionCount?: number | null;
}

interface TimeEntryInfo {
  minutes: number;
  category: string;
}

interface ScopeCheckResult {
  triggered: AlertType[];
  metadata: Record<string, unknown>;
}

export function checkScopeCreep(
  project: ProjectInfo,
  totalMinutes: number,
  timeEntries: TimeEntryInfo[],
): ScopeCheckResult | null {
  const triggered: AlertType[] = [];
  const metadata: Record<string, unknown> = {};

  const totalHours = totalMinutes / 60;
  const expectedHours = project.expectedHours ?? 0;

  // Rule 1: time ratio >= 0.8 AND progress < 50%
  if (expectedHours > 0) {
    const timeRatio = totalHours / expectedHours;
    if (timeRatio >= 0.8 && project.progressPercent < 50) {
      triggered.push("scope_rule1");
      metadata.rule1 = {
        timeRatio: Math.round(timeRatio * 100) / 100,
        threshold: 0.8,
        progressPercent: project.progressPercent,
        totalHours: Math.round(totalHours * 10) / 10,
        expectedHours,
      };
    }
  }

  // Rule 2: revision minutes >= 40% of total
  if (totalMinutes > 0) {
    const revisionMinutes = timeEntries
      .filter((e) => e.category === "revision")
      .reduce((sum, e) => sum + e.minutes, 0);
    const revisionRatio = revisionMinutes / totalMinutes;
    if (revisionRatio >= 0.4) {
      triggered.push("scope_rule2");
      metadata.rule2 = {
        revisionRatio: Math.round(revisionRatio * 100) / 100,
        threshold: 0.4,
        revisionMinutes,
        totalMinutes,
      };
    }
  }

  // Rule 3: revision entries count >= 5
  const revisionCount = timeEntries.filter(
    (e) => e.category === "revision",
  ).length;
  if (revisionCount >= 5) {
    triggered.push("scope_rule3");
    metadata.rule3 = {
      revisionCount,
      threshold: 5,
    };
  }

  // Rule 4: actual revision entries exceed agreed revision count
  if (
    project.agreedRevisionCount != null &&
    project.agreedRevisionCount > 0
  ) {
    const revisionEntryCount = timeEntries.filter(
      (e) => e.category === "revision",
    ).length;
    if (revisionEntryCount > project.agreedRevisionCount) {
      triggered.push("scope_rule4");
      metadata.rule4 = {
        actualRevisionCount: revisionEntryCount,
        agreedRevisionCount: project.agreedRevisionCount,
        excessCount: revisionEntryCount - project.agreedRevisionCount,
      };
    }
  }

  return triggered.length > 0 ? { triggered, metadata } : null;
}
