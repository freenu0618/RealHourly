import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { UpdateCostSchema } from "@/lib/validators/costs";
import { updateCostEntry, softDeleteCostEntry } from "@/db/queries/cost-entries";

type Ctx = { params: Promise<{ costEntryId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { costEntryId } = await params;
    const body = UpdateCostSchema.parse(await req.json());
    const data = await updateCostEntry(costEntryId, user.id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { costEntryId } = await params;
    await softDeleteCostEntry(costEntryId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
