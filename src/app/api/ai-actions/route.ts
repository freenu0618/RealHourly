import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { AiActionsQuerySchema, CreateAiActionSchema } from "@/lib/validators/ai-actions";
import {
  getAiActionsByUser,
  getPendingCount,
  createAiAction,
} from "@/db/queries/ai-actions";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const query = AiActionsQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
    });
    const [actions, pendingCount] = await Promise.all([
      getAiActionsByUser(user.id, query.status),
      getPendingCount(user.id),
    ]);
    return NextResponse.json({ data: actions, pendingCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = CreateAiActionSchema.parse(await req.json());
    const action = await createAiAction(user.id, body);
    return NextResponse.json({ data: action }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
