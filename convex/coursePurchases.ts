import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called from POST /api/stripe/webhook after signature verification.
 * Idempotent — safe to call multiple times with same session.
 */
export const completePurchase = mutation({
  args: {
    courseId: v.id("academyCourses"),
    email: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    amountTotal: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if already processed
    const existing = await ctx.db
      .query("coursePurchases")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
    if (existing) return existing._id;

    // Link to user account if one exists with this email
    const user = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

    return await ctx.db.insert("coursePurchases", {
      courseId: args.courseId,
      userId: user?._id,
      email: args.email,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "completed",
      amountTotal: args.amountTotal,
      currency: args.currency.toLowerCase(),
    });
  },
});

/**
 * Called directly from the browser when enrolling in a free course.
 */
export const enrollForFree = mutation({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Curso no encontrado.");
    if ((course.price ?? 0) !== 0) throw new Error("Este curso no es gratuito.");

    const identity = await ctx.auth.getUserIdentity();

    const user = identity
      ? await ctx.db
          .query("users")
          .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
          .unique()
      : null;

    const email = identity?.email ?? "";

    // Idempotency: skip if already enrolled (only check if user exists)
    if (user) {
      const existing = await ctx.db
        .query("coursePurchases")
        .withIndex("by_user_and_course", (q) =>
          q.eq("userId", user._id).eq("courseId", args.courseId)
        )
        .unique();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("coursePurchases", {
      courseId: args.courseId,
      userId: user?._id,
      email,
      stripeSessionId: `free_${args.courseId}_${Date.now()}`,
      status: "completed",
      amountTotal: 0,
      currency: "eur",
    });
  },
});

/**
 * Returns true if the authenticated user has a completed purchase for this course.
 */
export const hasPurchasedCourse = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Check by userId (requires user to exist in our users table)
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (user) {
      const byUser = await ctx.db
        .query("coursePurchases")
        .withIndex("by_user_and_course", (q) =>
          q.eq("userId", user._id).eq("courseId", args.courseId)
        )
        .first();
      if (byUser?.status === "completed") return true;
    }

    // Check by email (covers guest purchases not yet linked to an account)
    const email = identity.email;
    if (email) {
      const byEmail = await ctx.db
        .query("coursePurchases")
        .withIndex("by_email_and_course", (q) =>
          q.eq("email", email).eq("courseId", args.courseId)
        )
        .first();
      if (byEmail?.status === "completed") return true;
    }

    return false;
  },
});
