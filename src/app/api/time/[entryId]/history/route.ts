import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { getEntryHistory } from "@/db/queries/time-entry-versions";
import { db } from "@/db";
import { timeEntries, projects } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

type Ctx = { params: Promise<{ entryId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { entryId } = await ctx.params;

    // Verify ownership
    const [entry] = await db
      .select({ projectId: timeEntries.projectId })
      .from(timeEntries)
      .where(eq(timeEntries.id, entryId));

    if (!entry) {
      throw new ApiError("NOT_FOUND", 404, "Time entry not found");
    }

    const [proj] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, entry.projectId),
          eq(projects.userId, user.id),
          isNull(projects.deletedAt),
        ),
      );

    if (!proj) {
      throw new ApiError("NOT_FOUND", 404, "Time entry not found");
    }

    const history = await getEntryHistory(entryId);
    return NextResponse.json({ data: history });
  } catch (error) {
    return handleApiError(error);
  }
}
