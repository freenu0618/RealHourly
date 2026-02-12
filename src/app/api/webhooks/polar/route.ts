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

  console.log(`[Polar Webhook] type=${event.type}`);

  try {
    switch (event.type) {
      case "subscription.active": {
        const sub = event.data;
        const userId = sub.customer?.externalId;
        const customerEmail = sub.customer?.email;

        console.log(`[Polar] subscription.active — userId=${userId}, email=${customerEmail}, customerId=${sub.customerId}, subId=${sub.id}`);

        if (userId) {
          await activateSubscription(userId, sub.customerId, sub.id);
        } else if (customerEmail) {
          // Fallback: look up by email in profiles via DB
          await activateSubscriptionByEmail(customerEmail, sub.customerId, sub.id);
        } else {
          console.error("[Polar] No userId or email in subscription.active event");
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const sub = event.data;
        const userId = sub.customer?.externalId;
        const customerEmail = sub.customer?.email;

        console.log(`[Polar] ${event.type} — userId=${userId}, email=${customerEmail}`);

        if (userId) {
          await deactivateSubscription(userId);
        } else if (customerEmail) {
          await deactivateSubscriptionByEmail(customerEmail);
        }
        break;
      }

      case "order.paid": {
        console.log(`[Polar] order.paid: ${event.data.id}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Polar] Webhook handler error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

/** Activate pro plan by user ID (primary — from externalCustomerId set at checkout) */
async function activateSubscription(
  userId: string,
  polarCustomerId: string,
  polarSubscriptionId: string,
) {
  const result = await db
    .update(profiles)
    .set({
      planType: "pro",
      polarCustomerId,
      polarSubscriptionId,
      planExpiresAt: null,
      updatedAt: sql`now()`,
    })
    .where(eq(profiles.id, userId));

  console.log(`[Polar] Activated Pro for userId=${userId}`, result);
}

/** Fallback: activate by email lookup in auth (for subscriptions created outside checkout) */
async function activateSubscriptionByEmail(
  email: string,
  polarCustomerId: string,
  polarSubscriptionId: string,
) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("[Polar] Supabase admin.listUsers failed:", error.message);
    return;
  }
  const user = data?.users?.find((u) => u.email === email);
  if (!user) {
    console.warn(`[Polar] No Supabase user for email: ${email}`);
    return;
  }

  await activateSubscription(user.id, polarCustomerId, polarSubscriptionId);
}

/** Deactivate pro plan by user ID */
async function deactivateSubscription(userId: string) {
  await db
    .update(profiles)
    .set({
      planType: "free",
      polarSubscriptionId: null,
      planExpiresAt: null,
      updatedAt: sql`now()`,
    })
    .where(eq(profiles.id, userId));

  console.log(`[Polar] Deactivated Pro for userId=${userId}`);
}

/** Fallback: deactivate by email */
async function deactivateSubscriptionByEmail(email: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("[Polar] Supabase admin.listUsers failed:", error.message);
    return;
  }
  const user = data?.users?.find((u) => u.email === email);
  if (!user) return;

  await deactivateSubscription(user.id);
}
