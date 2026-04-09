import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

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
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
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

      if (courseId && email) {
        await ctx.runMutation(internal.coursePurchases.completePurchase, {
          courseId: courseId as unknown as import("./_generated/dataModel").Id<"academyCourses">,
          email,
          stripeSessionId: session.id as string,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          amountTotal: (session.amount_total as number) ?? 0,
          currency: (session.currency as string) ?? "eur",
        });
      }
    }

    return new Response(null, { status: 200 });
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
): Promise<boolean> {
  try {
    const parts = signature.split(",");
    const tPart = parts.find((p) => p.startsWith("t="));
    const v1Part = parts.find((p) => p.startsWith("v1="));

    if (!tPart || !v1Part) return false;

    const timestamp = tPart.slice(2);
    const expectedHash = v1Part.slice(3);
    const signedPayload = `${timestamp}.${body}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature_bytes = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const computedHash = Array.from(new Uint8Array(signature_bytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedHash === expectedHash;
  } catch {
    return false;
  }
}

export default http;
