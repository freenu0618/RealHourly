import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { SaveTimeSchema } from "@/lib/validators/time";
import { saveTimeEntries } from "@/db/queries/time-entries";
import { getProjectsByUserId } from "@/db/queries/projects";

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
    return NextResponse.json(
      { data: { inserted: saved.length } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
