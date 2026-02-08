import type { MatchSource, ProjectForMatching } from "@/types/time-log";

interface MatchResult {
  projectId: string | null;
  source: MatchSource;
  candidates: number;
}

/**
 * Simple fuzzy matching: aliases → name (includes) → client name.
 * Case-insensitive, trimmed. Supports Korean & English.
 */
export function matchProject(
  raw: string,
  projects: ProjectForMatching[],
): MatchResult {
  const needle = raw.trim().toLowerCase();
  if (!needle) return { projectId: null, source: "none", candidates: 0 };

  const matches: { id: string; source: MatchSource }[] = [];

  for (const p of projects) {
    // 1. Alias match (exact substring)
    if (p.aliases?.some((a) => a.toLowerCase().includes(needle) || needle.includes(a.toLowerCase()))) {
      matches.push({ id: p.id, source: "alias" });
      continue;
    }

    // 2. Name match (includes or startsWith)
    const pName = p.name.toLowerCase();
    if (pName.includes(needle) || needle.includes(pName)) {
      matches.push({ id: p.id, source: "name" });
      continue;
    }

    // 3. Client name match
    if (p.clientName) {
      const cName = p.clientName.toLowerCase();
      if (cName.includes(needle) || needle.includes(cName)) {
        matches.push({ id: p.id, source: "client" });
      }
    }
  }

  if (matches.length === 0) {
    return { projectId: null, source: "none", candidates: 0 };
  }

  if (matches.length === 1) {
    return {
      projectId: matches[0].id,
      source: matches[0].source,
      candidates: 1,
    };
  }

  // 2+ matches → ambiguous (return first as tentative but flag as ambiguous)
  return {
    projectId: matches[0].id,
    source: matches[0].source,
    candidates: matches.length,
  };
}
