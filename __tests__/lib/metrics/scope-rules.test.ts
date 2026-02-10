import { checkScopeCreep } from "@/lib/metrics/scope-rules";

describe("checkScopeCreep", () => {
  // ──────────────────────────────────────────────
  // Rule 1: (totalHours / expectedHours) >= 0.8 AND progressPercent < 50
  // ──────────────────────────────────────────────
  describe("Rule 1 — time ratio >= 0.8 AND progress < 50%", () => {
    it("triggers when ratio >= 0.8 and progress < 50%", () => {
      // 52h / 40h = 1.3 >= 0.8, progress 40% < 50%
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 40 },
        3120, // 52 hours in minutes
        [],
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule1");
    });

    it("does NOT trigger when ratio < 0.8", () => {
      // 20h / 40h = 0.5 < 0.8
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 40 },
        1200, // 20 hours
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      expect(hasRule1).toBe(false);
    });

    it("does NOT trigger when progress >= 50%", () => {
      // 35h / 40h = 0.875 >= 0.8, but progress 60% >= 50%
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 60 },
        2100, // 35 hours
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      expect(hasRule1).toBe(false);
    });

    it("skips when expectedHours is null", () => {
      const result = checkScopeCreep(
        { expectedHours: null, progressPercent: 30 },
        3120,
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      expect(hasRule1).toBe(false);
    });

    it("triggers at exact boundary: ratio = 0.8 and progress = 49", () => {
      // 32h / 40h = 0.8 exactly, progress 49% < 50%
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 49 },
        1920, // 32 hours
        [],
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule1");
    });

    it("does NOT trigger at exact boundary: ratio = 0.8 and progress = 50", () => {
      // 32h / 40h = 0.8, progress 50% is NOT < 50 => no trigger
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 50 },
        1920,
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      expect(hasRule1).toBe(false);
    });

    it("does NOT trigger when ratio is just below 0.8", () => {
      // 31.9h / 40h = 0.7975 < 0.8
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 30 },
        1914, // 31.9 hours
        [],
      );
      const hasRule1 = result?.triggered.includes("scope_rule1") ?? false;
      expect(hasRule1).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // Rule 2: revision minutes >= 40% of total
  // ──────────────────────────────────────────────
  describe("Rule 2 — revision minutes >= 40%", () => {
    it("triggers when revision ratio >= 40%", () => {
      // 1300 / 3120 = 41.7% >= 40%
      const entries = [
        { minutes: 1300, category: "revision" },
        { minutes: 1820, category: "development" },
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule2");
    });

    it("does NOT trigger when revision ratio < 40%", () => {
      // 1080 / 3120 = 34.6% < 40%
      const entries = [
        ...Array(5).fill({ minutes: 216, category: "revision" }),  // 1080 min
        ...Array(10).fill({ minutes: 204, category: "development" }), // 2040 min
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      const hasRule2 = result?.triggered.includes("scope_rule2") ?? false;
      expect(hasRule2).toBe(false);
    });

    it("triggers at exact boundary: revision ratio = 40%", () => {
      // 400 / 1000 = 40% exactly
      const entries = [
        { minutes: 400, category: "revision" },
        { minutes: 600, category: "development" },
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        1000,
        entries,
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule2");
    });

    it("does NOT trigger at just below 40%", () => {
      // 399 / 1000 = 39.9% < 40%
      const entries = [
        { minutes: 399, category: "revision" },
        { minutes: 601, category: "development" },
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        1000,
        entries,
      );
      const hasRule2 = result?.triggered.includes("scope_rule2") ?? false;
      expect(hasRule2).toBe(false);
    });

    it("does NOT trigger when totalMinutes is 0 (no division by zero)", () => {
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        0,
        [],
      );
      const hasRule2 = result?.triggered.includes("scope_rule2") ?? false;
      expect(hasRule2).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // Rule 3: revision entries count >= 5
  // ──────────────────────────────────────────────
  describe("Rule 3 — revision count >= 5", () => {
    it("triggers when revision count >= 5", () => {
      const entries = Array(7).fill({ minutes: 60, category: "revision" });
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        3120,
        entries,
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule3");
    });

    it("does NOT trigger when revision count < 5", () => {
      const entries = [
        ...Array(3).fill({ minutes: 60, category: "revision" }),
        ...Array(5).fill({ minutes: 60, category: "development" }),
      ];
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        480,
        entries,
      );
      const hasRule3 = result?.triggered.includes("scope_rule3") ?? false;
      expect(hasRule3).toBe(false);
    });

    it("triggers at exact boundary: revision count = 5", () => {
      const entries = Array(5).fill({ minutes: 60, category: "revision" });
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        300,
        entries,
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule3");
    });

    it("does NOT trigger at count = 4", () => {
      const entries = Array(4).fill({ minutes: 60, category: "revision" });
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        240,
        entries,
      );
      const hasRule3 = result?.triggered.includes("scope_rule3") ?? false;
      expect(hasRule3).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // No rules triggered → null
  // ──────────────────────────────────────────────
  describe("No rules triggered", () => {
    it("returns null when no rules trigger", () => {
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        600, // 10 hours < 0.8 * 100
        [{ minutes: 600, category: "development" }],
      );
      expect(result).toBeNull();
    });

    it("returns null when entries are empty and no rule1 trigger", () => {
      const result = checkScopeCreep(
        { expectedHours: 100, progressPercent: 80 },
        600,
        [],
      );
      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // Multiple rules triggered simultaneously
  // ──────────────────────────────────────────────
  describe("Multiple rules can trigger together", () => {
    it("triggers rule1 + rule2 + rule3 simultaneously", () => {
      // Rule1: 80h / 40h = 2.0 >= 0.8, progress 20% < 50%
      // Rule2: 2400 revision / 4800 total = 50% >= 40%
      // Rule3: 6 revision entries >= 5
      const entries = [
        ...Array(6).fill({ minutes: 400, category: "revision" }), // 2400 min
        ...Array(6).fill({ minutes: 400, category: "development" }), // 2400 min
      ];
      const result = checkScopeCreep(
        { expectedHours: 40, progressPercent: 20 },
        4800,
        entries,
      );
      expect(result).not.toBeNull();
      expect(result!.triggered).toContain("scope_rule1");
      expect(result!.triggered).toContain("scope_rule2");
      expect(result!.triggered).toContain("scope_rule3");
      expect(result!.triggered).toHaveLength(3);
    });
  });
});
