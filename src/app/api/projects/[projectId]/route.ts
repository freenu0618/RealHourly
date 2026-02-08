import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { UpdateProjectSchema } from "@/lib/validators/projects";
import {
  getProjectById,
  updateProject,
  softDeleteProject,
} from "@/db/queries/projects";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const data = await getProjectById(projectId, user.id);
    if (!data) throw new ApiError("NOT_FOUND", 404, "Project not found");
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = UpdateProjectSchema.parse(await req.json());
    const data = await updateProject(projectId, user.id, body);
    if (!data) throw new ApiError("NOT_FOUND", 404, "Project not found");
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const deleted = await softDeleteProject(projectId, user.id);
    if (!deleted) throw new ApiError("NOT_FOUND", 404, "Project not found");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
