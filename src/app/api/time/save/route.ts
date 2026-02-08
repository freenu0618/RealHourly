import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { SaveTimeSchema } from "@/lib/validators/time";
import { saveTimeEntries } from "@/db/queries/time-entries";

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = SaveTimeSchema.parse(await req.json());
    const saved = await saveTimeEntries(body.entries);
    return NextResponse.json(
      { data: { inserted: saved.length } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
