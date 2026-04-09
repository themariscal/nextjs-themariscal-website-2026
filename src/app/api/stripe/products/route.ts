import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * POST: Create a new Stripe Product + Price and save IDs to Convex.
 * Body: { courseId: string, name: string, price: number (cents), currency: string }
 */
export async function POST(req: NextRequest) {
  const { userId, has } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = has?.({ permission: "org:admin" }) || has?.({ role: "org:admin" });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      courseId: string;
      name: string;
      price: number;
      currency: string;
    };

    const { courseId, name, price, currency } = body;

    if (!courseId || !name || typeof price !== "number" || price < 0 || !currency) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const product = await stripe.products.create({ name });

    let stripePrice;
    try {
      stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price),
        currency: currency.toLowerCase(),
      });
    } catch (priceErr) {
      // Roll back: archive the orphaned product
      await stripe.products.update(product.id, { active: false });
      throw priceErr;
    }

    await convex.mutation(api.academyCourses.updateStripeIds, {
      courseId: courseId as Id<"academyCourses">,
      stripeProductId: product.id,
      stripePriceId: stripePrice.id,
    });

    return NextResponse.json({ stripeProductId: product.id, stripePriceId: stripePrice.id });
  } catch (err) {
    console.error("[stripe/products POST]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH: Archive existing Stripe Price and create a new one.
 * Body: { courseId: string, stripeProductId: string, newPrice: number (cents), currency: string }
 */
export async function PATCH(req: NextRequest) {
  const { userId, has } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = has?.({ permission: "org:admin" }) || has?.({ role: "org:admin" });
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      courseId: string;
      stripeProductId: string;
      newPrice: number;
      currency: string;
    };

    const { courseId, stripeProductId, newPrice, currency } = body;

    if (!courseId || !stripeProductId || typeof newPrice !== "number" || newPrice < 0 || !currency) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Archive all active prices (limit: 100 covers all practical cases)
    const activePrices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
      limit: 100,
    });
    await Promise.all(activePrices.data.map((p) => stripe.prices.update(p.id, { active: false })));

    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: Math.round(newPrice),
      currency: currency.toLowerCase(),
    });

    await convex.mutation(api.academyCourses.updateStripePriceId, {
      courseId: courseId as Id<"academyCourses">,
      stripePriceId: stripePrice.id,
      price: Math.round(newPrice),
      currency: currency.toLowerCase(),
    });

    return NextResponse.json({ stripePriceId: stripePrice.id });
  } catch (err) {
    console.error("[stripe/products PATCH]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
