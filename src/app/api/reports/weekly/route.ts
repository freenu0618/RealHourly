import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import {
  getWeeklyReport,
  getWeeklyReports,
} from "@/db/queries/weekly-reports";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const weekStart = searchParams.get("weekStart");

    if (weekStart) {
      const report = await getWeeklyReport(user.id, weekStart);
      return NextResponse.json({ data: report });
    }

    const reports = await getWeeklyReports(user.id, 12);
    return NextResponse.json({ data: reports });
  } catch (error) {
    return handleApiError(error);
  }
}
