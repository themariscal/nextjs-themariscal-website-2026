import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listOfferings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptionOfferings").collect();
  },
});

export const getOffering = query({
  args: { id: v.id("subscriptionOfferings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createOffering = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    monthlyPriceUsd: v.number(),
    annualPriceUsd: v.number(),
    revenueCatProductIdMonthly: v.string(),
    revenueCatProductIdAnnual: v.string(),
    revenueCatOfferingId: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptionOfferings", args);
  },
});

export const updateOffering = mutation({
  args: {
    id: v.id("subscriptionOfferings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    monthlyPriceUsd: v.optional(v.number()),
    annualPriceUsd: v.optional(v.number()),
    revenueCatProductIdMonthly: v.optional(v.string()),
    revenueCatProductIdAnnual: v.optional(v.string()),
    revenueCatOfferingId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
  },
});
