import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { getComparisonData } from "@/db/queries/analytics";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getComparisonData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
