import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createWebBillingCheckout } from "@/lib/revenuecat";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";

export async function POST(req: NextRequest) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planType, locale } = (await req.json()) as {
    planType: "monthly" | "annual";
    locale: string;
  };

  if (planType !== "monthly" && planType !== "annual") {
    return NextResponse.json({ error: "Invalid planType" }, { status: 400 });
  }

  const offerings = await convex.query(api.subscriptionOfferings.listOfferings);
  const activeOffering = offerings.find((o) => o.isActive);

  if (!activeOffering) {
    return NextResponse.json(
      { error: "No active subscription offering found" },
      { status: 404 }
    );
  }

  const productId =
    planType === "monthly"
      ? activeOffering.revenueCatProductIdMonthly
      : activeOffering.revenueCatProductIdAnnual;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  try {
    const checkoutUrl = await createWebBillingCheckout({
      appUserId: userId,
      productId,
      successUrl: `${baseUrl}/${locale}/account/subscription?success=true`,
      cancelUrl: `${baseUrl}/${locale}/account/subscription`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[rc/checkout POST]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
