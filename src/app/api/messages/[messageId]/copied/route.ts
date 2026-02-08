import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { markMessageCopied } from "@/db/queries/generated-messages";

type Ctx = { params: Promise<{ messageId: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { messageId } = await params;
    const data = await markMessageCopied(messageId, user.id);
    return NextResponse.json({ data: { copiedAt: data.copiedAt } });
  } catch (error) {
    return handleApiError(error);
  }
}
