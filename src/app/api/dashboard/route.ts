import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { getDashboardData } from "@/db/queries/dashboard";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getDashboardData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
