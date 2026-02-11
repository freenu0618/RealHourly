import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { SaveTimeSchema } from "@/lib/validators/time";
import {
  saveTimeEntries,
  getSumMinutesByProject,
  getRecentCategoriesByProject,
  getDayTotalMinutes,
} from "@/db/queries/time-entries";
import { getProjectsByUserId } from "@/db/queries/projects";
import { getSumFixedCostsByProject } from "@/db/queries/cost-entries";
import {
  computePostLogSuggestions,
  type PostLogSuggestion,
  type ProjectSuggestionContext,
  type DailySuggestionContext,
} from "@/lib/metrics/post-log-suggestions";

interface ProjectFeedback {
  projectName: string;
  realHourly: number | null;
  currency: string;
  budgetUsedPercent: number | null;
}

interface ProjectProgress {
  projectId: string;
  projectName: string;
  currentProgress: number;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = SaveTimeSchema.parse(await req.json());

    // Verify each project belongs to user and is active
    const userProjects = await getProjectsByUserId(user.id);
    const projectMap = new Map(userProjects.map((p) => [p.id, p]));

    for (const entry of body.entries) {
      const project = projectMap.get(entry.projectId);
      if (!project) {
        throw new ApiError(
          "FORBIDDEN",
          403,
          `Project ${entry.projectId} does not belong to user`,
        );
      }
      if (project.status !== "active") {
        throw new ApiError(
          "PROJECT_NOT_ACTIVE",
          400,
          `Cannot log time to ${project.status} project "${project.name}"`,
        );
      }
    }

    const saved = await saveTimeEntries(body.entries);

    // Compute profitability feedback for affected projects
    const affectedProjectIds = [...new Set(body.entries.map((e) => e.projectId))];
    const feedback: ProjectFeedback[] = [];

    try {
      await Promise.all(
        affectedProjectIds.map(async (pid) => {
          const project = projectMap.get(pid);
          if (!project) return;

          const [totalMinutes, fixedCosts] = await Promise.all([
            getSumMinutesByProject(pid, "done"),
            getSumFixedCostsByProject(pid),
          ]);

          const gross = Number(project.expectedFee) || 0;
          const platformFee = gross * (Number(project.platformFeeRate) || 0);
          const tax = gross * (Number(project.taxRate) || 0);
          const net = gross - fixedCosts - platformFee - tax;
          const totalHours = totalMinutes / 60;
          const realHourly = totalHours > 0 ? Math.round((net / totalHours) * 100) / 100 : null;
          const expectedHours = Number(project.expectedHours) || 0;
          const budgetUsedPercent = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : null;

          feedback.push({
            projectName: project.name,
            realHourly,
            currency: project.currency,
            budgetUsedPercent,
          });
        }),
      );
    } catch {
      // Feedback is non-critical; don't fail the save
    }

    // Collect progress info for projects that aren't complete yet
    const projectProgress: ProjectProgress[] = affectedProjectIds
      .map((pid) => {
        const project = projectMap.get(pid);
        if (!project) return null;
        if (project.progressPercent >= 100) return null;
        return {
          projectId: pid,
          projectName: project.name,
          currentProgress: project.progressPercent ?? 0,
        };
      })
      .filter((p): p is ProjectProgress => p !== null);

    // Compute post-log suggestions (non-critical)
    let suggestions: PostLogSuggestion[] = [];
    try {
      const projectCtxs: ProjectSuggestionContext[] = await Promise.all(
        affectedProjectIds.map(async (pid) => {
          const project = projectMap.get(pid)!;
          const savedCats = body.entries
            .filter((e) => e.projectId === pid)
            .map((e) => e.category);
          const recentCats = await getRecentCategoriesByProject(pid, 10);
          const expectedHours = Number(project.expectedHours) || 0;
          const gross = Number(project.expectedFee) || 0;
          const nominalHourly =
            expectedHours > 0
              ? Math.round((gross / expectedHours) * 100) / 100
              : null;
          const fb = feedback.find((f) => f.projectName === project.name);

          return {
            projectId: pid,
            projectName: project.name,
            realHourly: fb?.realHourly ?? null,
            nominalHourly,
            currency: project.currency,
            progressPercent: project.progressPercent ?? 0,
            savedCategories: savedCats,
            recentCategories: recentCats,
          };
        }),
      );

      const allProjectIds = userProjects.map((p) => p.id);
      const savedDates = [...new Set(body.entries.map((e) => e.date))];
      const dailyCtxs: DailySuggestionContext[] = await Promise.all(
        savedDates.map(async (date) => ({
          date,
          totalMinutes: await getDayTotalMinutes(allProjectIds, date),
        })),
      );

      suggestions = computePostLogSuggestions(projectCtxs, dailyCtxs);
    } catch {
      // Suggestions are non-critical
    }

    return NextResponse.json(
      { data: { inserted: saved.length, feedback, projectProgress, suggestions } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
