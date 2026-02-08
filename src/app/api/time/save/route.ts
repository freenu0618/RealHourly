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

    // Verify each project belongs to user
    const userProjects = await getProjectsByUserId(user.id);
    const userProjectIds = new Set(userProjects.map((p) => p.id));

    for (const entry of body.entries) {
      if (!userProjectIds.has(entry.projectId)) {
        throw new ApiError(
          "FORBIDDEN",
          403,
          `Project ${entry.projectId} does not belong to user`,
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
