import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { GenerateMessagesSchema } from "@/lib/validators/messages";
import { createMessages } from "@/db/queries/generated-messages";

// STUB — will be replaced with real LLM generation in Feature 3
export async function POST(req: Request) {
  try {
    await requireUser();
    const body = GenerateMessagesSchema.parse(await req.json());

    // Mock messages for development
    const stubMessages = body.tones.map((tone) => ({
      tone: tone as "polite" | "neutral" | "firm",
      subject: `[${tone}] Additional billing request`,
      body: `This is a stub ${tone} message. Real LLM generation will be implemented.`,
    }));

    const data = await createMessages(body.alertId, stubMessages);
    return NextResponse.json({ data: { messages: data } });
  } catch (error) {
    return handleApiError(error);
  }
}
