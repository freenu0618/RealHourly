import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import {
  CreateTimesheetSchema,
  TimesheetListQuerySchema,
} from "@/lib/validators/timesheet-schema";
import {
  createTimesheet,
  getTimesheetsByUser,
} from "@/db/queries/timesheets";
import { startOfWeek, endOfWeek } from "@/lib/date";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = CreateTimesheetSchema.parse(await req.json());

    // Calculate week boundaries (Monday-based)
    const weekStartDate = startOfWeek(new Date(body.weekStart + "T12:00:00"), {
      weekStartsOn: 1,
    });
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });

    const wsStr = weekStartDate.toISOString().slice(0, 10);
    const weStr = weekEndDate.toISOString().slice(0, 10);

    const result = await createTimesheet(user.id, body.projectId, wsStr, weStr);
    if (!result) {
      throw new ApiError("NOT_FOUND", 404, "Project not found");
    }
    if ("duplicate" in result) {
      throw new ApiError(
        "DUPLICATE",
        409,
        "A timesheet for this project and week already exists",
      );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const query = TimesheetListQuerySchema.parse({
      projectId: url.searchParams.get("projectId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });

    const data = await getTimesheetsByUser(user.id, query);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
