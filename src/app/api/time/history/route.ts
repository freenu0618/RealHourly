import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { TimeHistoryQuerySchema } from "@/lib/validators/time";
import { getTimeHistory } from "@/db/queries/time-entries";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);

    const query = TimeHistoryQuerySchema.parse({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      projectId: url.searchParams.get("projectId") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
    });

    const data = await getTimeHistory(user.id, query);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
