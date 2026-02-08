import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateClientSchema } from "@/lib/validators/clients";
import { getClientsByUserId, createClient } from "@/db/queries/clients";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getClientsByUserId(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = CreateClientSchema.parse(await req.json());
    const data = await createClient(user.id, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
