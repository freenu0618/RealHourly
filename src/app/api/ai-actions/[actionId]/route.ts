import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { UpdateAiActionSchema } from "@/lib/validators/ai-actions";
import { updateAiActionStatus } from "@/db/queries/ai-actions";

type Ctx = { params: Promise<{ actionId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { actionId } = await params;
    const body = UpdateAiActionSchema.parse(await req.json());
    const action = await updateAiActionStatus(actionId, user.id, body.status);
    if (!action) {
      throw new ApiError("NOT_FOUND", 404, "Action not found");
    }
    return NextResponse.json({ data: action });
  } catch (error) {
    return handleApiError(error);
  }
}
