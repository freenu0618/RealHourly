import { describe, expect, it } from "vitest";
import { getIncomeGoalRate } from "@/lib/calculator/income-goal";

describe("income goal rate", () => {
  it.each([0, -10])("does not promise a zero-dollar rate with %s billable hours", (hours) => {
    expect(getIncomeGoalRate(6000, hours, 75)).toEqual({
      requiredRate: null,
      status: "goalNoCapacity",
    });
  });

  it("handles a shared calculator scenario where admin time consumes capacity", () => {
    const capacity = Math.max(0, (1 * 1 - (3 + 2) * 4.33) / 1.15);
    expect(getIncomeGoalRate(7562.5, capacity, 75).status).toBe("goalNoCapacity");
  });

  it.each([
    [6000, "goalAchievable"],
    [7800, "goalTight"],
    [7801, "goalExceeds"],
  ] as const)("preserves the rate threshold for %s gross income", (gross, status) => {
    expect(getIncomeGoalRate(gross, 100, 60)).toEqual({
      requiredRate: gross / 100,
      status,
    });
  });

  it("does not mark a positive target achievable at a zero current rate", () => {
    expect(getIncomeGoalRate(6000, 100, 0).status).toBe("goalExceeds");
  });
});
