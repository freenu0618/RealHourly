import { create } from "zustand";
import type { ParsedEntry } from "@/types/time-log";

interface DraftStore {
  entries: ParsedEntry[];
  isLoading: boolean;
  error: string | null;

  setEntries: (entries: ParsedEntry[]) => void;
  updateEntry: (id: string, updates: Partial<ParsedEntry>) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  canSaveAll: () => boolean;
  blockingCount: () => number;
}

export const useDraftStore = create<DraftStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  setEntries: (entries) => set({ entries, error: null }),

  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };

        // Auto-clear blocking issues when user fixes the field
        let issues = [...updated.issues];
        if (
          updates.matchedProjectId !== undefined &&
          updated.matchedProjectId !== null
        ) {
          issues = issues.filter(
            (i) => i !== "PROJECT_UNMATCHED" && i !== "PROJECT_AMBIGUOUS",
          );
        }
        if (
          updates.durationMinutes !== undefined &&
          updated.durationMinutes !== null &&
          updated.durationMinutes >= 1
        ) {
          issues = issues.filter((i) => i !== "DURATION_MISSING");
        }

        const needsUserAction = issues.some((i) =>
          ["PROJECT_UNMATCHED", "PROJECT_AMBIGUOUS", "DURATION_MISSING"].includes(i),
        );

        return { ...updated, issues, needsUserAction };
      }),
    })),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  clearAll: () => set({ entries: [], isLoading: false, error: null }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  canSaveAll: () => {
    const { entries } = get();
    if (entries.length === 0) return false;
    return entries.every(
      (e) =>
        e.matchedProjectId !== null &&
        e.durationMinutes !== null &&
        e.durationMinutes >= 1 &&
        e.durationMinutes <= 1440,
    );
  },

  blockingCount: () => {
    const { entries } = get();
    return entries.filter((e) => e.needsUserAction).length;
  },
}));
