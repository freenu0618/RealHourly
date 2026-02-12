import {
  validateEvent,
  type WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("POLAR_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, Object.fromEntries(req.headers), webhookSecret);
  } catch (e) {
    const err = e as WebhookVerificationError;
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.type) {
      case "subscription.active": {
        const sub = event.data;
        const customerId = sub.customerId;
        const customerEmail = sub.customer?.email;

        if (customerEmail) {
          // Find user by email via Supabase auth, update profile
          await activateSubscription(customerEmail, customerId, sub.id);
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const sub = event.data;
        const customerEmail = sub.customer?.email;

        if (customerEmail) {
          await deactivateSubscription(customerEmail);
        }
        break;
      }

      case "order.paid": {
        // Handled by subscription events for recurring
        console.log(`Order paid: ${event.data.id}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

/** Activate pro plan for user by email */
async function activateSubscription(
  email: string,
  polarCustomerId: string,
  polarSubscriptionId: string,
) {
  // Look up Supabase user by email using service role
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase.auth.admin.listUsers();
  const user = data?.users?.find((u) => u.email === email);
  if (!user) {
    console.warn(`No Supabase user found for email: ${email}`);
    return;
  }

  await db
    .update(profiles)
    .set({
      planType: "pro",
      polarCustomerId,
      polarSubscriptionId,
      planExpiresAt: null, // Active subscription = no expiry
      updatedAt: sql`now()`,
    })
    .where(eq(profiles.id, user.id));

  console.log(`Activated Pro plan for user ${user.id} (${email})`);
}

/** Deactivate pro plan — set expiry to current period end */
async function deactivateSubscription(email: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase.auth.admin.listUsers();
  const user = data?.users?.find((u) => u.email === email);
  if (!user) return;

  // Set plan to free
  await db
    .update(profiles)
    .set({
      planType: "free",
      polarSubscriptionId: null,
      planExpiresAt: null,
      updatedAt: sql`now()`,
    })
    .where(eq(profiles.id, user.id));

  console.log(`Deactivated Pro plan for user ${user.id} (${email})`);
}
