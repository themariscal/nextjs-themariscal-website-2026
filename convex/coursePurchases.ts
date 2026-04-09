import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called from POST /api/stripe/webhook after signature verification.
 * Idempotent — safe to call multiple times with same session.
 */
export const completePurchase = internalMutation({
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
    if (!identity) throw new Error("Debes iniciar sesión para inscribirte.");

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
      stripeSessionId: `free_${args.courseId}_${user?._id ?? email}`,
      status: "completed",
      amountTotal: 0,
      currency: (course.currency ?? "eur").toLowerCase(),
    });
  },
});

/**
 * Returns true if the authenticated user has access to this course.
 * Access = individual purchase OR (active premium sub AND course.includedInPremium).
 */
export const hasPurchasedCourse = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Check individual purchase by userId
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

    // Check by email (guest purchases not yet linked to account)
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

    // Check premium subscription + course flag
    const course = await ctx.db.get(args.courseId);
    if (course?.includedInPremium) {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
        .unique();
      if (subscription?.status === "active") return true;
    }

    return false;
  },
});
