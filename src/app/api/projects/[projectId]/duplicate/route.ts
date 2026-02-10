import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { getProjectById } from "@/db/queries/projects";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectToDTO } from "@/db/queries/dto";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const source = await getProjectById(projectId, user.id);
    if (!source) {
      throw new ApiError("NOT_FOUND", 404, "Project not found");
    }

    const [row] = await db
      .insert(projects)
      .values({
        userId: user.id,
        clientId: source.clientId,
        name: `${source.name} (Copy)`,
        aliases: source.aliases ?? [],
        expectedFee: String(source.expectedFee ?? 0),
        expectedHours: String(source.expectedHours ?? 0),
        currency: source.currency as typeof projects.$inferInsert.currency,
        platformFeeRate: String(source.platformFeeRate ?? 0),
        taxRate: String(source.taxRate ?? 0),
      })
      .returning();

    return NextResponse.json({ data: projectToDTO(row) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
