import { describe, expect, it } from "vitest";
import { getCalculatorParam } from "@/lib/calculator/share-params";

describe("shared calculator parameters", () => {
  it.each([null, "", "   ", "invalid", "NaN", "Infinity", "-Infinity", "1e999"])(
    "uses the default for missing or non-finite value %s",
    (value) => expect(getCalculatorParam(value, 20, 1, 31)).toBe(20),
  );

  it("preserves valid shared values, including fractional hours and zero costs", () => {
    expect(getCalculatorParam("1.5", 6, 1, 24)).toBe(1.5);
    expect(getCalculatorParam("0", 50, 0)).toBe(0);
    expect(getCalculatorParam("3000", 1000, 0)).toBe(3000);
  });

  it("prevents negative costs and non-positive working time", () => {
    expect(getCalculatorParam("-100", 50, 0)).toBe(0);
    expect(getCalculatorParam("0", 40, 1)).toBe(1);
    expect(getCalculatorParam("-5", 20, 1, 31)).toBe(1);
  });

  it("keeps percentages and monthly capacity within their control limits", () => {
    expect(getCalculatorParam("100", 10, 0, 30)).toBe(30);
    expect(getCalculatorParam("100", 10, 0, 50)).toBe(50);
    expect(getCalculatorParam("100", 15, 0, 60)).toBe(60);
    expect(getCalculatorParam("99", 20, 1, 31)).toBe(31);
    expect(getCalculatorParam("99", 6, 1, 24)).toBe(24);
  });

  it("caps extreme finite values before arithmetic can overflow", () => {
    expect(getCalculatorParam("1e308", 3000, 0)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
