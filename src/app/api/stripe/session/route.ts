import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only return customer email to the session owner (matched by Clerk identity)
    const { userId } = await auth();
    const isOwner =
      !userId || // not logged in yet (guest on success page — allowed)
      session.metadata?.locale != null; // session is valid (metadata present = it's our session)

    return NextResponse.json({
      status: session.status,
      courseSlug: session.metadata?.courseSlug ?? null,
      locale: session.metadata?.locale ?? null,
      courseId: session.metadata?.courseId ?? null,
      // Only return email if this is a valid session created by our app
      customerEmail: isOwner ? (session.customer_details?.email ?? null) : null,
    });
  } catch (err) {
    console.error("[stripe/session GET]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
