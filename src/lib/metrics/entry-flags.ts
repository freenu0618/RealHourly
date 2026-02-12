import "server-only";

type FlagResult = {
  flagType: "weekend_work" | "late_night" | "long_session" | "backdated" | "round_number";
  severity: "info" | "warning";
  metadata?: Record<string, unknown>;
};

type EntryForFlag = {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  category: string;
  createdAt: string | null;
};

/**
 * Detect abnormal patterns for a single time entry.
 * These flags are non-blocking — entries are always saved,
 * flags are shown during timesheet review.
 */
export function detectFlags(entry: EntryForFlag): FlagResult[] {
  const flags: FlagResult[] = [];
  const entryDate = new Date(entry.date + "T12:00:00Z");
  const dayOfWeek = entryDate.getUTCDay(); // 0=Sun, 6=Sat

  // Weekend work
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    flags.push({
      flagType: "weekend_work",
      severity: "info",
      metadata: { dayOfWeek: dayOfWeek === 0 ? "sunday" : "saturday" },
    });
  }

  // Long session (>= 480 minutes = 8 hours)
  if (entry.minutes >= 480) {
    flags.push({
      flagType: "long_session",
      severity: "warning",
      metadata: { minutes: entry.minutes, hours: Math.round(entry.minutes / 60 * 10) / 10 },
    });
  }

  // Backdated (entry date is 7+ days before created date)
  if (entry.createdAt) {
    const created = new Date(entry.createdAt);
    const diff = created.getTime() - entryDate.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (daysDiff >= 7) {
      flags.push({
        flagType: "backdated",
        severity: "warning",
        metadata: { daysBack: daysDiff },
      });
    }
  }

  return flags;
}

/**
 * Detect round_number pattern across multiple entries.
 * If 5+ consecutive entries have exactly 60 or 120 minutes → flag all of them.
 */
export function detectRoundNumberPattern(
  entries: EntryForFlag[],
): Map<string, FlagResult> {
  const flagMap = new Map<string, FlagResult>();

  // Sort by date then createdAt
  const sorted = [...entries].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
  });

  let streak: string[] = [];
  for (const entry of sorted) {
    if (entry.minutes === 60 || entry.minutes === 120) {
      streak.push(entry.id);
    } else {
      if (streak.length >= 5) {
        for (const id of streak) {
          flagMap.set(id, {
            flagType: "round_number",
            severity: "info",
            metadata: { streakLength: streak.length, minutes: entry.minutes },
          });
        }
      }
      streak = [];
    }
  }

  // Check final streak
  if (streak.length >= 5) {
    for (const id of streak) {
      flagMap.set(id, {
        flagType: "round_number",
        severity: "info",
        metadata: { streakLength: streak.length },
      });
    }
  }

  return flagMap;
}
