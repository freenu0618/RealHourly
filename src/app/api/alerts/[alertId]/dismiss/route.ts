import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { dismissAlert } from "@/db/queries/alerts";

type Ctx = { params: Promise<{ alertId: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { alertId } = await params;
    const data = await dismissAlert(alertId, user.id);
    return NextResponse.json({
      data: { dismissedAt: data.dismissedAt },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
