import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getProfile } from "@/db/queries/profiles";
import { getPolar } from "@/lib/polar/client";

export async function POST() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile?.polarCustomerId) {
    return NextResponse.json(
      { error: { code: "NO_SUBSCRIPTION", message: "No active subscription" } },
      { status: 404 },
    );
  }

  try {
    const polar = getPolar();
    const session = await polar.customerSessions.create({
      customerId: profile.polarCustomerId,
    });

    return NextResponse.json({
      data: { portalUrl: session.customerPortalUrl },
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: { code: "PORTAL_ERROR", message: "Failed to create portal session" } },
      { status: 500 },
    );
  }
}
