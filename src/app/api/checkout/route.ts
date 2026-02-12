import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getPolar } from "@/lib/polar/client";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { productId, successUrl, interval } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { error: { code: "MISSING_PRODUCT_ID", message: "Product ID required" } },
      { status: 400 },
    );
  }

  try {
    const polar = getPolar();

    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: user.email!,
      externalCustomerId: user.id,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.real-hourly.com"}/settings?upgraded=true`,
      metadata: {
        userId: user.id,
        interval: interval || "monthly",
      },
    });

    return NextResponse.json({
      data: {
        checkoutUrl: checkout.url,
        id: checkout.id,
      },
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: { code: "CHECKOUT_ERROR", message: "Failed to create checkout" } },
      { status: 500 },
    );
  }
}
