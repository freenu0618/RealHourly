import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateCostSchema } from "@/lib/validators/costs";
import { createCostEntry } from "@/db/queries/cost-entries";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = CreateCostSchema.parse(await req.json());
    const data = await createCostEntry(projectId, user.id, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
