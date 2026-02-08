import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { getProjectById } from "@/db/queries/projects";

type Ctx = { params: Promise<{ projectId: string }> };

// STUB — will be replaced with real getProjectMetrics in STEP 3
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProjectById(projectId, user.id);
    if (!project) throw new ApiError("NOT_FOUND", 404, "Project not found");

    return NextResponse.json({
      data: {
        metrics: {
          gross: project.expectedFee,
          net: null,
          totalHours: 0,
          nominalHourly: null,
          realHourly: null,
          costBreakdown: [],
        },
        pendingAlert: null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
