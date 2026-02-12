import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ParseTimeSchema } from "@/lib/validators/time";
import { parseTimeLog } from "@/lib/ai/parse-time-log";
import { normalizeEntries } from "@/lib/ai/normalize-parsed-entries";
import { getActiveProjectsForMatching } from "@/db/queries/projects";
import { parseRateLimit } from "@/lib/api/rate-limit";
import { sanitizeForParse } from "@/lib/ai/sanitize-input";
import { checkQuota, trackUsage } from "@/lib/polar/feature-gate";

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // Monthly quota check (before rate limit to give better error)
    await checkQuota(user.id, "nlp_parse");

    const { success, retryAfterMs } = await parseRateLimit.check(user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
      );
    }

    const body = ParseTimeSchema.parse(await req.json());
    body.input = sanitizeForParse(body.input);

    const activeProjects = await getActiveProjectsForMatching(user.id);

    const llmResponse = await parseTimeLog(
      body.input,
      activeProjects,
      body.preferredProjectId,
      body.userTimezone,
    );

    const data = normalizeEntries(
      llmResponse,
      activeProjects,
      body.userTimezone,
      body.preferredProjectId,
    );

    // Track usage after successful parse
    await trackUsage(user.id, "nlp_parse");

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[/api/time/parse] Error:", error);
    console.error(
      "[/api/time/parse] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "[/api/time/parse] Error stack:",
      error instanceof Error ? error.stack : "no stack",
    );
    return handleApiError(error);
  }
}
