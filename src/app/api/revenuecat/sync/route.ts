import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscriber } from "@/lib/revenuecat";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let subscriber;
  try {
    subscriber = await getSubscriber(userId);
  } catch (err) {
    console.error("[rc/sync] getSubscriber failed", err);
    return NextResponse.json({ error: "Failed to fetch subscriber" }, { status: 502 });
  }

  // Find first active entitlement
  const now = Date.now();
  const activeEntitlement = Object.entries(subscriber.entitlements).find(([, e]) => {
    return e.expires_date === null || new Date(e.expires_date).getTime() > now;
  });

  if (!activeEntitlement) {
    return NextResponse.json({ synced: false, reason: "no_active_entitlement" });
  }

  const [entitlementId, entitlement] = activeEntitlement;
  const productId = entitlement.product_identifier;
  const sub = subscriber.subscriptions[productId];

  const isActive = true;
  const status = sub?.billing_issues_detected_at
    ? ("billing_issue" as const)
    : sub?.unsubscribe_detected_at
      ? ("cancelled" as const)
      : ("active" as const);

  const planType: "monthly" | "annual" =
    productId.toLowerCase().includes("annual") || productId.toLowerCase().includes("yearly")
      ? "annual"
      : "monthly";

  const expiresDate = entitlement.expires_date;
  const currentPeriodEnd = expiresDate
    ? Math.floor(new Date(expiresDate).getTime() / 1000)
    : Math.floor(now / 1000) + 60 * 60 * 24 * 30;

  // Update Convex with Clerk JWT for auth validation
  const token = await getToken({ template: "convex" });
  if (token) {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);
    await convex.mutation(api.subscriptions.syncSubscriptionFromRC, {
      revenueCatCustomerId: userId,
      productIdentifier: productId,
      entitlementId,
      status,
      planType,
      currentPeriodEnd,
      revenueCatEventType: "MANUAL_SYNC",
    });
  }

  // Update Clerk publicMetadata
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (clerkSecretKey) {
    await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_metadata: { isPremium: isActive } }),
    });
  }

  return NextResponse.json({ synced: true, status, planType });
}
