import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * POST: Create a Stripe Checkout Session and return the session URL.
 * Body: { courseId: string, courseSlug: string, locale: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { courseId, courseSlug, locale } = (await req.json()) as {
      courseId: string;
      courseSlug: string;
      locale: string;
    };

    const course = await convex.query(api.academyCourses.getCourseById, {
      courseId: courseId as Id<"academyCourses">,
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    if (!course.stripePriceId) {
      return NextResponse.json(
        { error: "Este curso no tiene precio configurado en Stripe" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: course.stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/${locale}/academy/courses/${courseSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/academy/courses/${courseSlug}`,
      metadata: {
        courseId,
        courseSlug,
        locale,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a session URL" }, { status: 500 });
    }

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error("[stripe/checkout POST]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
