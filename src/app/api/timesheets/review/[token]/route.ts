import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { ReviewTimesheetSchema } from "@/lib/validators/timesheet-schema";
import {
  getTimesheetByReviewToken,
  approveTimesheet,
  rejectTimesheet,
} from "@/db/queries/timesheets";
import { getFlagsByEntryIds } from "@/db/queries/entry-flags";

type Ctx = { params: Promise<{ token: string }> };

// PUBLIC — no auth required (magic link token)
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { token } = await ctx.params;

    const data = await getTimesheetByReviewToken(token);
    if (!data) {
      throw new ApiError("NOT_FOUND", 404, "Review link is invalid or expired");
    }

    // Attach flags
    const entryIds = data.entries.map((e) => e.id);
    const flags = await getFlagsByEntryIds(entryIds);
    const flagMap = new Map<string, typeof flags>();
    for (const f of flags) {
      const arr = flagMap.get(f.timeEntryId) ?? [];
      arr.push(f);
      flagMap.set(f.timeEntryId, arr);
    }

    const entriesWithFlags = data.entries.map((e) => ({
      ...e,
      flags: flagMap.get(e.id) ?? [],
    }));

    return NextResponse.json({
      data: { ...data, entries: entriesWithFlags },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUBLIC — approve or reject
export async function POST(req: Request, ctx: Ctx) {
  try {
    const { token } = await ctx.params;
    const body = ReviewTimesheetSchema.parse(await req.json());

    let result;
    if (body.action === "approved") {
      result = await approveTimesheet(token, body.note, body.reviewerEmail);
    } else {
      result = await rejectTimesheet(token, body.note, body.reviewerEmail);
    }

    if (!result) {
      throw new ApiError(
        "INVALID_STATE",
        400,
        "Timesheet not found or not in submitted status",
      );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
