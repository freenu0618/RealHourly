import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { dismissFlag } from "@/db/queries/entry-flags";

type Ctx = { params: Promise<{ flagId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { flagId } = await ctx.params;

    const dismissed = await dismissFlag(flagId, user.id);
    if (!dismissed) {
      throw new ApiError("NOT_FOUND", 404, "Flag not found");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
