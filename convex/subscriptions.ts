import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called from the Convex HTTP action in http.ts.
 * One record per user — patches existing if found, inserts if new.
 */
export const upsertSubscription = internalMutation({
  args: {
    clerkUserId: v.string(),
    revenueCatCustomerId: v.string(),
    productIdentifier: v.string(),
    entitlementId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("billing_issue")
    ),
    planType: v.union(v.literal("monthly"), v.literal("annual")),
    currentPeriodEnd: v.number(),
    revenueCatEventType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        revenueCatCustomerId: args.revenueCatCustomerId,
        productIdentifier: args.productIdentifier,
        entitlementId: args.entitlementId,
        status: args.status,
        planType: args.planType,
        currentPeriodEnd: args.currentPeriodEnd,
        revenueCatEventType: args.revenueCatEventType,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", args);
  },
});

/**
 * Returns the subscription record for the authenticated user.
 * Used on the account/subscription page.
 */
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

/**
 * Admin: list all active subscribers.
 */
export const listActiveSubscribers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(200);
  },
});
