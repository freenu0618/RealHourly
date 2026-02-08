import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ParseTimeSchema } from "@/lib/validators/time";
import { mockParseTimeInput } from "@/lib/ai/mock-parse";

// STUB — will be replaced with real LLM parsing in STEP 5
export async function POST(req: Request) {
  try {
    await requireUser();
    const body = ParseTimeSchema.parse(await req.json());

    const data = mockParseTimeInput(body.input);

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
