/**
 * Tests for the pure calculation logic extracted from getProjectMetrics.
 * No DB or auth required — purely arithmetic.
 */

interface MetricsInput {
  expectedFee: number;
  expectedHours: number | null;
  platformFeeRate: number;
  taxRate: number;
  totalMinutesDone: number;
  fixedCosts: number;
}

interface MetricsOutput {
  gross: number;
  net: number;
  totalHours: number;
  nominalHourly: number | null;
  realHourly: number | null;
  platformFeeAmount: number;
  taxAmount: number;
  directCost: number;
}

/**
 * Pure calculation function mirroring getProjectMetrics logic.
 * Extracted here for unit-testability without DB dependencies.
 */
function calculateMetrics(params: MetricsInput): MetricsOutput {
  const gross = params.expectedFee;
  const platformFeeAmount = gross * params.platformFeeRate;
  const taxAmount = gross * params.taxRate;
  const directCost = params.fixedCosts + platformFeeAmount + taxAmount;
  const net = gross - directCost;
  const totalHours = params.totalMinutesDone / 60;

  const rawNominal =
    (params.expectedHours ?? 0) > 0
      ? gross / params.expectedHours!
      : null;
  const nominalHourly =
    rawNominal !== null && Number.isFinite(rawNominal) ? rawNominal : null;

  const rawReal = totalHours > 0 ? net / totalHours : null;
  const realHourly =
    rawReal !== null && Number.isFinite(rawReal) ? rawReal : null;

  return {
    gross,
    net,
    totalHours,
    nominalHourly,
    realHourly,
    platformFeeAmount,
    taxAmount,
    directCost,
  };
}

// ──────────────────────────────────────────────
// Standard calculation (seed data scenario)
// ──────────────────────────────────────────────
describe("calculateMetrics — standard case", () => {
  const result = calculateMetrics({
    expectedFee: 2000,
    expectedHours: 40,
    platformFeeRate: 0.20,
    taxRate: 0.10,
    totalMinutesDone: 3120, // 52 hours
    fixedCosts: 50, // Figma Pro
  });

  it("gross = expectedFee", () => {
    expect(result.gross).toBe(2000);
  });

  it("platformFeeAmount = gross * platformFeeRate", () => {
    expect(result.platformFeeAmount).toBe(400);
  });

  it("taxAmount = gross * taxRate", () => {
    expect(result.taxAmount).toBe(200);
  });

  it("directCost = fixedCosts + platformFee + tax", () => {
    expect(result.directCost).toBe(650);
  });

  it("net = gross - directCost", () => {
    expect(result.net).toBe(1350);
  });

  it("totalHours = totalMinutesDone / 60", () => {
    expect(result.totalHours).toBe(52);
  });

  it("nominalHourly = gross / expectedHours", () => {
    expect(result.nominalHourly).toBe(50);
  });

  it("realHourly = net / totalHours", () => {
    expect(result.realHourly).toBeCloseTo(25.96, 2);
  });

  it("rounded realHourly matches expected", () => {
    const rounded = Math.round(result.realHourly! * 100) / 100;
    expect(rounded).toBe(25.96);
  });
});

// ──────────────────────────────────────────────
// Edge cases
// ──────────────────────────────────────────────
describe("calculateMetrics — edge cases", () => {
  it("zero hours -> realHourly = null", () => {
    const result = calculateMetrics({
      expectedFee: 2000,
      expectedHours: 40,
      platformFeeRate: 0.20,
      taxRate: 0.10,
      totalMinutesDone: 0,
      fixedCosts: 50,
    });
    expect(result.realHourly).toBeNull();
    // nominalHourly should still be calculated
    expect(result.nominalHourly).toBe(50);
  });

  it("zero expectedHours -> nominalHourly = null", () => {
    const result = calculateMetrics({
      expectedFee: 2000,
      expectedHours: 0,
      platformFeeRate: 0.20,
      taxRate: 0.10,
      totalMinutesDone: 3120,
      fixedCosts: 50,
    });
    expect(result.nominalHourly).toBeNull();
    // realHourly should still be calculated
    expect(result.realHourly).toBeCloseTo(25.96, 2);
  });

  it("null expectedHours -> nominalHourly = null", () => {
    const result = calculateMetrics({
      expectedFee: 2000,
      expectedHours: null,
      platformFeeRate: 0.20,
      taxRate: 0.10,
      totalMinutesDone: 3120,
      fixedCosts: 50,
    });
    expect(result.nominalHourly).toBeNull();
  });

  it("negative net -> negative realHourly", () => {
    // net = 2000 - (400 + 200 + 3000) = -1600
    const result = calculateMetrics({
      expectedFee: 2000,
      expectedHours: 40,
      platformFeeRate: 0.20,
      taxRate: 0.10,
      totalMinutesDone: 3120, // 52 hours
      fixedCosts: 3000,
    });
    expect(result.net).toBe(-1600);
    expect(result.realHourly).not.toBeNull();
    expect(result.realHourly!).toBeLessThan(0);
    expect(result.realHourly).toBeCloseTo(-30.77, 2);
  });

  it("all zero -> both nominalHourly and realHourly null", () => {
    const result = calculateMetrics({
      expectedFee: 0,
      expectedHours: 0,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 0,
      fixedCosts: 0,
    });
    expect(result.nominalHourly).toBeNull();
    expect(result.realHourly).toBeNull();
    expect(result.gross).toBe(0);
    expect(result.net).toBe(0);
  });

  it("no fees or costs -> realHourly = gross / hours", () => {
    const result = calculateMetrics({
      expectedFee: 1000,
      expectedHours: 10,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 600, // 10 hours
      fixedCosts: 0,
    });
    expect(result.net).toBe(1000);
    expect(result.realHourly).toBe(100);
    expect(result.nominalHourly).toBe(100);
  });
});

// ──────────────────────────────────────────────
// Number.isFinite guard (NaN / Infinity defense)
// ──────────────────────────────────────────────
describe("calculateMetrics — Number.isFinite guard", () => {
  it("nominalHourly is null (not Infinity) when expectedHours is 0", () => {
    const result = calculateMetrics({
      expectedFee: 1000,
      expectedHours: 0,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 600,
      fixedCosts: 0,
    });
    // Without the isFinite guard, 1000/0 = Infinity
    expect(result.nominalHourly).toBeNull();
  });

  it("realHourly is null (not Infinity) when totalMinutes is 0", () => {
    const result = calculateMetrics({
      expectedFee: 1000,
      expectedHours: 10,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 0,
      fixedCosts: 0,
    });
    expect(result.realHourly).toBeNull();
  });

  it("nominalHourly is never NaN", () => {
    const result = calculateMetrics({
      expectedFee: 0,
      expectedHours: 0,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 600,
      fixedCosts: 0,
    });
    // 0 / 0 would be NaN, but guard should make it null
    expect(result.nominalHourly).toBeNull();
  });

  it("results are always finite numbers or null", () => {
    const cases: MetricsInput[] = [
      { expectedFee: 0, expectedHours: 0, platformFeeRate: 0, taxRate: 0, totalMinutesDone: 0, fixedCosts: 0 },
      { expectedFee: 1000, expectedHours: null, platformFeeRate: 0.5, taxRate: 0.5, totalMinutesDone: 1, fixedCosts: 0 },
      { expectedFee: 999999, expectedHours: 1, platformFeeRate: 0, taxRate: 0, totalMinutesDone: 1, fixedCosts: 0 },
    ];

    for (const c of cases) {
      const r = calculateMetrics(c);
      if (r.nominalHourly !== null) {
        expect(Number.isFinite(r.nominalHourly)).toBe(true);
      }
      if (r.realHourly !== null) {
        expect(Number.isFinite(r.realHourly)).toBe(true);
      }
    }
  });
});

// ──────────────────────────────────────────────
// Rounding behavior (matching getProjectMetrics)
// ──────────────────────────────────────────────
describe("calculateMetrics — rounding (matching getProjectMetrics output)", () => {
  it("realHourly rounds to 2 decimal places", () => {
    const result = calculateMetrics({
      expectedFee: 2000,
      expectedHours: 40,
      platformFeeRate: 0.20,
      taxRate: 0.10,
      totalMinutesDone: 3120,
      fixedCosts: 50,
    });
    // getProjectMetrics does: Math.round(realHourly * 100) / 100
    const rounded = Math.round(result.realHourly! * 100) / 100;
    expect(rounded).toBe(25.96);
  });

  it("totalHours rounds to 1 decimal place", () => {
    const result = calculateMetrics({
      expectedFee: 1000,
      expectedHours: 10,
      platformFeeRate: 0,
      taxRate: 0,
      totalMinutesDone: 125, // 2.0833... hours
      fixedCosts: 0,
    });
    // getProjectMetrics does: Math.round(totalHours * 10) / 10
    const rounded = Math.round(result.totalHours * 10) / 10;
    expect(rounded).toBe(2.1);
  });
});
