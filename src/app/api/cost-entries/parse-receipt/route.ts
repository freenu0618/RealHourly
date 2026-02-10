import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { ParseReceiptRequestSchema } from "@/lib/validators/receipt";
import { parseReceipt } from "@/lib/ai/parse-receipt";
import { getProjectById } from "@/db/queries/projects";
import { rateLimit } from "@/lib/api/rate-limit";

const receiptRateLimit = rateLimit({ limit: 10, windowMs: 60_000 });

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const { success, retryAfterMs } = await receiptRateLimit.check(user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
      );
    }

    const body = ParseReceiptRequestSchema.parse(await req.json());

    // Check image size (base64 is ~4/3 of original)
    const imageBytes = Math.ceil(body.image.length * 0.75);
    if (imageBytes > MAX_IMAGE_SIZE) {
      throw new ApiError("IMAGE_TOO_LARGE", 400, "Image exceeds 5MB limit");
    }

    // Verify project belongs to user
    const project = await getProjectById(body.projectId, user.id);
    if (!project) {
      throw new ApiError("NOT_FOUND", 404, "Project not found");
    }

    const data = await parseReceipt(body.image, body.userCurrency);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[/api/cost-entries/parse-receipt] Error:", error);
    return handleApiError(error);
  }
}
