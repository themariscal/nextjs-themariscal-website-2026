import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST: Create a new Stripe Product + Price and save IDs to Convex.
 * Called when admin creates a new paid course or turns a free course into paid.
 *
 * Body: { courseId: string, name: string, price: number (cents), currency: string }
 */
export async function POST(req: NextRequest) {
  const { courseId, name, price, currency } = (await req.json()) as {
    courseId: string;
    name: string;
    price: number;
    currency: string;
  };

  const product = await stripe.products.create({ name });

  const stripePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price),
    currency: currency.toLowerCase(),
  });

  await convex.mutation(api.academyCourses.updateStripeIds, {
    courseId: courseId as Id<"academyCourses">,
    stripeProductId: product.id,
    stripePriceId: stripePrice.id,
  });

  return NextResponse.json({ stripeProductId: product.id, stripePriceId: stripePrice.id });
}

/**
 * PATCH: Archive existing Stripe Price and create a new one (price update).
 * Stripe does not allow editing a Price — you must create a new one.
 *
 * Body: { courseId: string, stripeProductId: string, newPrice: number (cents), currency: string }
 */
export async function PATCH(req: NextRequest) {
  const { courseId, stripeProductId, newPrice, currency } = (await req.json()) as {
    courseId: string;
    stripeProductId: string;
    newPrice: number;
    currency: string;
  };

  // Archive all active prices on this product
  const activePrices = await stripe.prices.list({ product: stripeProductId, active: true });
  await Promise.all(activePrices.data.map((p) => stripe.prices.update(p.id, { active: false })));

  // Create new price
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
}
