import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { getFlagsByProject } from "@/db/queries/entry-flags";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      throw new ApiError("VALIDATION_ERROR", 422, "projectId is required");
    }

    const flags = await getFlagsByProject(user.id, projectId);
    return NextResponse.json({ data: flags });
  } catch (error) {
    return handleApiError(error);
  }
}
