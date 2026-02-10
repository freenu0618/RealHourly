import { CreateShareSchema, UpdateShareSchema } from "@/lib/validators/shares";

describe("CreateShareSchema", () => {
  it("parses minimal valid input (empty object)", () => {
    const result = CreateShareSchema.parse({});
    expect(result.showTimeDetails).toBe(true);
    expect(result.showCategoryBreakdown).toBe(true);
    expect(result.showProgress).toBe(true);
    expect(result.showInvoiceDownload).toBe(false);
    expect(result.label).toBeUndefined();
    expect(result.expiresAt).toBeUndefined();
  });

  it("parses full valid input", () => {
    const result = CreateShareSchema.parse({
      label: "ABC Corp",
      expiresAt: "2026-12-31T23:59:59Z",
      showTimeDetails: false,
      showCategoryBreakdown: false,
      showProgress: false,
      showInvoiceDownload: true,
    });
    expect(result.label).toBe("ABC Corp");
    expect(result.expiresAt).toBe("2026-12-31T23:59:59Z");
    expect(result.showTimeDetails).toBe(false);
    expect(result.showInvoiceDownload).toBe(true);
  });

  it("rejects label exceeding 100 chars", () => {
    expect(() =>
      CreateShareSchema.parse({ label: "a".repeat(101) }),
    ).toThrow();
  });

  it("rejects invalid datetime format", () => {
    expect(() =>
      CreateShareSchema.parse({ expiresAt: "not-a-date" }),
    ).toThrow();
  });

  it("rejects non-boolean toggle values", () => {
    expect(() =>
      CreateShareSchema.parse({ showTimeDetails: "yes" }),
    ).toThrow();
  });
});

describe("UpdateShareSchema", () => {
  it("parses empty object (no updates)", () => {
    const result = UpdateShareSchema.parse({});
    expect(Object.keys(result).length).toBe(0);
  });

  it("allows null label (clear label)", () => {
    const result = UpdateShareSchema.parse({ label: null });
    expect(result.label).toBeNull();
  });

  it("allows null expiresAt (remove expiry)", () => {
    const result = UpdateShareSchema.parse({ expiresAt: null });
    expect(result.expiresAt).toBeNull();
  });

  it("parses partial update", () => {
    const result = UpdateShareSchema.parse({
      showProgress: false,
      showInvoiceDownload: true,
    });
    expect(result.showProgress).toBe(false);
    expect(result.showInvoiceDownload).toBe(true);
    expect(result.label).toBeUndefined();
  });

  it("rejects label exceeding 100 chars", () => {
    expect(() =>
      UpdateShareSchema.parse({ label: "b".repeat(101) }),
    ).toThrow();
  });
});
