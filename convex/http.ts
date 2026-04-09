import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    };

    const wh = new Webhook(webhookSecret);
    let event: { type: string; data: Record<string, unknown> };

    try {
      event = wh.verify(payload, svixHeaders) as typeof event;
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: event.data.id as string,
        });
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await request.text();

    // Verify Stripe webhook signature using HMAC-SHA256
    // We implement this manually since the Stripe SDK is not available in Convex HTTP actions
    const { valid } = await verifyStripeSignature(body, signature, webhookSecret);
    if (!valid) {
      return new Response("Invalid signature", { status: 400 });
    }

    let event: { type: string; data: { object: Record<string, unknown> } };
    try {
      event = JSON.parse(body) as typeof event;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata as Record<string, string> | null;
      const courseId = metadata?.courseId;
      const customerDetails = session.customer_details as { email?: string } | null;
      const email = customerDetails?.email ?? "";

      if (!courseId || !email) {
        console.error("stripe-webhook: checkout.session.completed missing required fields", {
          sessionId: session.id,
          hasCourseId: !!courseId,
          hasEmail: !!email,
        });
        return new Response(null, { status: 200 });
      }

      await ctx.runMutation(internal.coursePurchases.completePurchase, {
        courseId: courseId as Id<"academyCourses">,
        email,
        stripeSessionId: session.id as string,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        amountTotal: (session.amount_total as number) ?? 0,
        currency: (session.currency as string) ?? "eur",
      });
    }

    return new Response(null, { status: 200 });
  }),
});

const ACTIVATE_EVENTS = new Set(["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"]);
const DEACTIVATE_EVENTS = new Set(["CANCELLATION", "EXPIRATION", "BILLING_ISSUE"]);

http.route({
  path: "/api/webhooks/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify RC webhook secret
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    let event: {
      type: string;
      app_user_id: string;
      product_id: string;
      expiration_at_ms?: number;
      entitlement_ids?: string[];
    };
    try {
      const payload = await request.json() as { event: typeof event };
      event = payload.event;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { type: eventType, app_user_id: clerkUserId, product_id } = event;

    if (!ACTIVATE_EVENTS.has(eventType) && !DEACTIVATE_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const isActive = ACTIVATE_EVENTS.has(eventType);
    const status = isActive
      ? "active"
      : eventType === "CANCELLATION"
        ? "cancelled"
        : eventType === "BILLING_ISSUE"
          ? "billing_issue"
          : "expired";

    const planType: "monthly" | "annual" = product_id.includes("annual") ? "annual" : "monthly";
    const currentPeriodEnd = event.expiration_at_ms
      ? Math.floor(event.expiration_at_ms / 1000)
      : 0;
    const entitlementId = event.entitlement_ids?.[0] ?? "premium";

    try {
      await ctx.runMutation(internal.subscriptions.upsertSubscription, {
        clerkUserId,
        revenueCatCustomerId: clerkUserId,
        productIdentifier: product_id,
        entitlementId,
        status: status as "active" | "expired" | "cancelled" | "billing_issue",
        planType,
        currentPeriodEnd,
        revenueCatEventType: eventType,
      });

      // Update Clerk publicMetadata
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (clerkSecretKey) {
        await fetch(`https://api.clerk.com/v1/users/${clerkUserId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_metadata: { isPremium: isActive } }),
        });
      }
    } catch (err) {
      console.error("[rc-webhook]", err);
      return new Response("Internal error", { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

/**
 * Verifies a Stripe webhook signature using HMAC-SHA256.
 * The Stripe SDK is not available in Convex HTTP actions (V8 runtime),
 * so we verify manually using the Web Crypto API.
 *
 * Stripe signature format: "t=TIMESTAMP,v1=HASH"
 * Signed payload format: "TIMESTAMP.BODY"
 */
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<{ valid: boolean; timestamp: string }> {
  const parts = signature.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) return { valid: false, timestamp: "" };

  const timestamp = tPart.slice(2);
  const expectedHash = v1Part.slice(3);
  const signedPayload = `${timestamp}.${body}`;

  // Replay attack protection: reject events older than 5 minutes
  const timestampSeconds = parseInt(timestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > 300) {
    return { valid: false, timestamp };
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Decode hex expectedHash to bytes for constant-time comparison
  const expectedBytes = new Uint8Array(
    expectedHash.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );

  const isValid = await crypto.subtle.verify("HMAC", cryptoKey, expectedBytes, messageData);
  return { valid: isValid, timestamp };
}

export default http;
