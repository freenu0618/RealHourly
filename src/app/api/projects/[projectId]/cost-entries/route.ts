import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateCostSchema } from "@/lib/validators/costs";
import { createCostEntry, getCostEntriesByProject } from "@/db/queries/cost-entries";
import { getProjectById } from "@/db/queries/projects";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProjectById(projectId, user.id);
    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 },
      );
    }
    const data = await getCostEntriesByProject(projectId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = CreateCostSchema.parse(await req.json());
    const data = await createCostEntry(projectId, user.id, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
