import { formatCurrency } from "@/lib/money/currency";
import { formatFactBomb, formatHours } from "@/lib/money/format";

// ──────────────────────────────────────────────
// formatCurrency
// ──────────────────────────────────────────────
describe("formatCurrency", () => {
  describe("USD", () => {
    it("formats integer correctly", () => {
      const result = formatCurrency(50, "USD");
      expect(result).toContain("50");
      expect(result).toContain("$");
    });

    it("formats decimal correctly", () => {
      const result = formatCurrency(25.96, "USD");
      expect(result).toContain("25.96");
    });

    it("formats zero", () => {
      const result = formatCurrency(0, "USD");
      expect(result).toContain("0");
    });

    it("formats negative number", () => {
      const result = formatCurrency(-50, "USD");
      expect(result).toContain("50");
    });

    it("formats large number with comma grouping", () => {
      const result = formatCurrency(1000000, "USD");
      expect(result).toContain("1,000,000");
    });
  });

  describe("KRW", () => {
    it("formats correctly without decimals", () => {
      const result = formatCurrency(23000, "KRW");
      expect(result.includes("23,000") || result.includes("23000")).toBe(true);
      expect(result).not.toContain(".");
    });

    it("truncates decimals (no fractional won)", () => {
      const result = formatCurrency(23000.75, "KRW");
      expect(result).not.toContain(".");
    });
  });

  describe("EUR", () => {
    it("formats correctly", () => {
      const result = formatCurrency(100, "EUR");
      expect(result).toContain("100");
    });
  });

  describe("JPY", () => {
    it("formats correctly without decimals", () => {
      const result = formatCurrency(5000, "JPY");
      expect(result.includes("5,000") || result.includes("5000")).toBe(true);
      expect(result).not.toContain(".");
    });

    it("truncates decimals (no fractional yen)", () => {
      const result = formatCurrency(5000.5, "JPY");
      expect(result).not.toContain(".");
    });
  });

  describe("GBP", () => {
    it("formats correctly", () => {
      const result = formatCurrency(75, "GBP");
      expect(result).toContain("75");
    });
  });

  describe("edge cases", () => {
    it("falls back to USD for unknown currency", () => {
      const result = formatCurrency(100, "INVALID");
      // Should not throw, falls back to USD config
      expect(result).toContain("100");
    });

    it("handles very large numbers", () => {
      const result = formatCurrency(999999999, "USD");
      expect(result).toContain("999,999,999");
    });

    it("handles very small decimal", () => {
      const result = formatCurrency(0.01, "USD");
      expect(result).toContain("0.01");
    });
  });
});

// ──────────────────────────────────────────────
// formatFactBomb
// ──────────────────────────────────────────────
describe("formatFactBomb", () => {
  it("contains arrow separator", () => {
    const result = formatFactBomb(50, 25.96, "USD");
    expect(result).toContain("\u2192"); // →
  });

  it("contains nominal rate", () => {
    const result = formatFactBomb(50, 25.96, "USD");
    expect(result).toContain("50");
  });

  it("contains real rate", () => {
    const result = formatFactBomb(50, 25.96, "USD");
    expect(result).toContain("25.96");
  });

  it("formats with KRW correctly", () => {
    const result = formatFactBomb(50000, 23000, "KRW");
    expect(result).toContain("\u2192");
    expect(result).toContain("50,000");
    expect(result).toContain("23,000");
  });
});

// ──────────────────────────────────────────────
// formatHours
// ──────────────────────────────────────────────
describe("formatHours", () => {
  it("formats exact hours", () => {
    expect(formatHours(120)).toBe("2h");
  });

  it("formats hours with minutes", () => {
    expect(formatHours(90)).toBe("1h 30m");
  });

  it("formats exactly 1 hour", () => {
    expect(formatHours(60)).toBe("1h");
  });

  it("formats less than 1 hour", () => {
    expect(formatHours(45)).toBe("0h 45m");
  });

  it("formats zero minutes", () => {
    expect(formatHours(0)).toBe("0h");
  });

  it("formats large value (52 hours)", () => {
    expect(formatHours(3120)).toBe("52h");
  });

  it("formats 1 minute", () => {
    expect(formatHours(1)).toBe("0h 1m");
  });

  it("formats 59 minutes", () => {
    expect(formatHours(59)).toBe("0h 59m");
  });

  it("formats 61 minutes", () => {
    expect(formatHours(61)).toBe("1h 1m");
  });
});
