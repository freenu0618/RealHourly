import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { CreateProjectSchema } from "@/lib/validators/projects";
import { getProjectsByUserId, createProject } from "@/db/queries/projects";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const activeParam = searchParams.get("active");
    const opts =
      activeParam !== null ? { active: activeParam === "true" } : undefined;
    const data = await getProjectsByUserId(user.id, opts);
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = CreateProjectSchema.parse(await req.json());
    const data = await createProject(user.id, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
