import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { getProjectMetrics } from "@/lib/metrics/get-project-metrics";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const data = await getProjectMetrics(projectId, user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
