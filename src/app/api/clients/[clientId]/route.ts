import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { UpdateClientSchema } from "@/lib/validators/clients";
import { updateClient, softDeleteClient } from "@/db/queries/clients";

type Ctx = { params: Promise<{ clientId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { clientId } = await params;
    const body = UpdateClientSchema.parse(await req.json());
    const data = await updateClient(clientId, user.id, body);
    if (!data) throw new ApiError("NOT_FOUND", 404, "Client not found");
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { clientId } = await params;
    const deleted = await softDeleteClient(clientId, user.id);
    if (!deleted) throw new ApiError("NOT_FOUND", 404, "Client not found");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
