import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ParseTimeSchema } from "@/lib/validators/time";
import { generateId } from "@/lib/utils/nanoid";

// STUB — will be replaced with real LLM parsing in Feature 1 implementation
export async function POST(req: Request) {
  try {
    await requireUser();
    const body = ParseTimeSchema.parse(await req.json());

    // Mock parsed response for development
    const stubEntry = {
      id: generateId(),
      projectNameRaw: "Sample Project",
      matchedProjectId: null,
      matchSource: "none" as const,
      taskDescription: body.input,
      date: new Date().toISOString().split("T")[0],
      durationMinutes: 60,
      category: "development" as const,
      intent: "done" as const,
      issues: ["PROJECT_UNMATCHED"],
      needsUserAction: true,
      clarificationQuestion: "프로젝트를 선택해주세요",
    };

    return NextResponse.json({
      data: {
        entries: [stubEntry],
        parseSummary: { total: 1, blocking: 1 },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
