import { getProjectById } from "@/db/queries/projects";
import { getSumMinutesByProject, getTimeEntriesByProject } from "@/db/queries/time-entries";
import { getSumFixedCostsByProject } from "@/db/queries/cost-entries";
import { getActiveAlertByProject, createAlert } from "@/db/queries/alerts";
import { ApiError } from "@/lib/api/errors";
import { checkScopeCreep } from "./scope-rules";

export interface CostBreakdownItem {
  type: "platform_fee" | "tax" | "fixed";
  amount: number;
}

export interface ProjectMetricsDTO {
  gross: number;
  net: number;
  totalHours: number;
  nominalHourly: number | null;
  realHourly: number | null;
  costBreakdown: CostBreakdownItem[];
  progressPercent: number;
  currency: string;
}

export async function getProjectMetrics(
  projectId: string,
  userId: string,
): Promise<{
  metrics: ProjectMetricsDTO;
  pendingAlert: Awaited<ReturnType<typeof getActiveAlertByProject>> | null;
}> {
  const project = await getProjectById(projectId, userId);
  if (!project) throw new ApiError("NOT_FOUND", 404, "Project not found");

  const [totalMinutes, fixedCosts, timeEntries] = await Promise.all([
    getSumMinutesByProject(projectId, "done"),
    getSumFixedCostsByProject(projectId),
    getTimeEntriesByProject(projectId, { intent: "done" }),
  ]);

  const gross = project.expectedFee ?? 0;
  const platformFeeAmount = gross * (project.platformFeeRate ?? 0);
  const taxAmount = gross * (project.taxRate ?? 0);
  const directCost = fixedCosts + platformFeeAmount + taxAmount;
  const net = gross - directCost;
  const totalHours = totalMinutes / 60;

  const rawNominal =
    (project.expectedHours ?? 0) > 0
      ? gross / project.expectedHours!
      : null;
  const nominalHourly = rawNominal !== null && Number.isFinite(rawNominal) ? rawNominal : null;

  const rawReal = totalHours > 0 ? net / totalHours : null;
  const realHourly = rawReal !== null && Number.isFinite(rawReal) ? rawReal : null;

  const costBreakdown: CostBreakdownItem[] = [
    { type: "platform_fee", amount: platformFeeAmount },
    { type: "tax", amount: taxAmount },
    { type: "fixed", amount: fixedCosts },
  ];

  // Scope creep detection
  const scopeResult = checkScopeCreep(
    {
      expectedHours: project.expectedHours,
      progressPercent: project.progressPercent,
    },
    totalMinutes,
    timeEntries.map((e) => ({ minutes: e.minutes, category: e.category })),
  );

  let pendingAlert = await getActiveAlertByProject(projectId);

  // Create new alert if triggered and no active alert exists
  if (scopeResult && !pendingAlert) {
    const firstRule = scopeResult.triggered[0];
    pendingAlert = await createAlert(
      projectId,
      firstRule,
      scopeResult.metadata,
    );
  }

  return {
    metrics: {
      gross,
      net,
      totalHours: Math.round(totalHours * 10) / 10,
      nominalHourly: nominalHourly !== null ? Math.round(nominalHourly * 100) / 100 : null,
      realHourly: realHourly !== null ? Math.round(realHourly * 100) / 100 : null,
      costBreakdown,
      progressPercent: project.progressPercent,
      currency: project.currency,
    },
    pendingAlert,
  };
}

