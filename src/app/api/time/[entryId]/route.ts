import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { UpdateTimeEntrySchema } from "@/lib/validators/time";
import { updateTimeEntry, softDeleteTimeEntry } from "@/db/queries/time-entries";

type Ctx = { params: Promise<{ entryId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { entryId } = await ctx.params;
    const body = UpdateTimeEntrySchema.parse(await req.json());

    const updated = await updateTimeEntry(entryId, user.id, body);
    if (!updated) {
      throw new ApiError("NOT_FOUND", 404, "Time entry not found");
    }
    if ("locked" in updated) {
      throw new ApiError("ENTRY_LOCKED", 403, "This entry has been approved and is locked");
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { entryId } = await ctx.params;

    const result = await softDeleteTimeEntry(entryId, user.id);
    if (result === "locked") {
      throw new ApiError("ENTRY_LOCKED", 403, "This entry has been approved and is locked");
    }
    if (!result) {
      throw new ApiError("NOT_FOUND", 404, "Time entry not found");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
