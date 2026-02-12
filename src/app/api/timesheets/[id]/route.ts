import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { getTimesheetById } from "@/db/queries/timesheets";
import { getFlagsByEntryIds } from "@/db/queries/entry-flags";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    const ts = await getTimesheetById(id, user.id);
    if (!ts) {
      throw new ApiError("NOT_FOUND", 404, "Timesheet not found");
    }

    // Attach flags to entries
    const entryIds = ts.entries.map((e) => e.id);
    const flags = await getFlagsByEntryIds(entryIds);
    const flagMap = new Map<string, typeof flags>();
    for (const f of flags) {
      const arr = flagMap.get(f.timeEntryId) ?? [];
      arr.push(f);
      flagMap.set(f.timeEntryId, arr);
    }

    const entriesWithFlags = ts.entries.map((e) => ({
      ...e,
      flags: flagMap.get(e.id) ?? [],
    }));

    return NextResponse.json({
      data: { ...ts, entries: entriesWithFlags },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
