import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { SaveTimeSchema } from "@/lib/validators/time";
import { saveTimeEntries, getSumMinutesByProject } from "@/db/queries/time-entries";
import { getProjectsByUserId } from "@/db/queries/projects";
import { getSumFixedCostsByProject } from "@/db/queries/cost-entries";

interface ProjectFeedback {
  projectName: string;
  realHourly: number | null;
  currency: string;
  budgetUsedPercent: number | null;
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

    return NextResponse.json(
      { data: { inserted: saved.length, feedback } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
