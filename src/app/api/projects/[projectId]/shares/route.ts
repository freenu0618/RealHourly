import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateShareSchema } from "@/lib/validators/shares";
import {
  createShare,
  getSharesByProject,
} from "@/db/queries/project-shares";
import { ApiError } from "@/lib/api/errors";
import { requireFeature } from "@/lib/polar/feature-gate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const shares = await getSharesByProject(projectId, user.id);
    if (!shares) throw new ApiError("NOT_FOUND", 404, "Project not found");

    return NextResponse.json({ data: shares });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const user = await requireUser();
    await requireFeature(user.id, "shareLinks");
    const { projectId } = await params;
    const body = CreateShareSchema.parse(await req.json());

    const share = await createShare(projectId, user.id, body);
    if (!share) throw new ApiError("NOT_FOUND", 404, "Project not found");

    return NextResponse.json({ data: share }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
