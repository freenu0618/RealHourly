import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { UpdateShareSchema } from "@/lib/validators/shares";
import { updateShare, revokeShare } from "@/db/queries/project-shares";
import { ApiError } from "@/lib/api/errors";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const user = await requireUser();
    const { shareId } = await params;
    const body = UpdateShareSchema.parse(await req.json());

    const share = await updateShare(shareId, user.id, body);
    if (!share) throw new ApiError("NOT_FOUND", 404, "Share not found");

    return NextResponse.json({ data: share });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const user = await requireUser();
    const { shareId } = await params;

    const share = await revokeShare(shareId, user.id);
    if (!share) throw new ApiError("NOT_FOUND", 404, "Share not found");

    return NextResponse.json({ data: { revokedAt: new Date().toISOString() } });
  } catch (error) {
    return handleApiError(error);
  }
}
