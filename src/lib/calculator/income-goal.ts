/** A higher rate cannot compensate for having no billable time. */
export function getIncomeGoalRate(
  requiredGross: number,
  availableBillableHours: number,
  nominalRate: number,
) {
  if (availableBillableHours <= 0) {
    return { requiredRate: null, status: "goalNoCapacity" as const };
  }

  const requiredRate = requiredGross / availableBillableHours;
  const rateRatio = nominalRate > 0 ? requiredRate / nominalRate : Infinity;
  const status = rateRatio <= 1
    ? "goalAchievable"
    : rateRatio <= 1.3
      ? "goalTight"
      : "goalExceeds";

  return { requiredRate, status };
}
