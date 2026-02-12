import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { submitTimesheet } from "@/db/queries/timesheets";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const result = await submitTimesheet(id, user.id);
    if (!result) {
      throw new ApiError(
        "INVALID_STATE",
        400,
        "Timesheet not found or not in draft status",
      );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
