import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ParseTimeSchema } from "@/lib/validators/time";
import { parseTimeLog } from "@/lib/ai/parse-time-log";
import { normalizeEntries } from "@/lib/ai/normalize-parsed-entries";
import { getActiveProjectsForMatching } from "@/db/queries/projects";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = ParseTimeSchema.parse(await req.json());

    const activeProjects = await getActiveProjectsForMatching(user.id);

    const llmResponse = await parseTimeLog(
      body.input,
      activeProjects,
      undefined, // preferredProjectId — will be passed from frontend in future
      body.userTimezone,
    );

    const data = normalizeEntries(
      llmResponse,
      activeProjects,
      body.userTimezone,
    );

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
