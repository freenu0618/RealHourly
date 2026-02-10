import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { UpdatePreferencesSchema } from "@/lib/validators/settings";
import { getProfile, updateProfile } from "@/db/queries/profiles";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getProfile(user.id);
    return NextResponse.json({
      data: {
        defaultCurrency: profile?.defaultCurrency ?? "USD",
        hourlyGoal: profile?.hourlyGoal ?? null,
        timezone: profile?.timezone ?? "Asia/Seoul",
        locale: profile?.locale ?? "en",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = UpdatePreferencesSchema.parse(await req.json());
    const updated = await updateProfile(user.id, body);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
