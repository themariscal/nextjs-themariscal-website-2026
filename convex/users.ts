import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(),
  },
  async handler(ctx, { data }) {
    const userAttributes = {
      externalId: data.id as string,
      email: data.email_addresses[0]?.email_address as string,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      username: data.username ?? undefined,
      imageUrl: data.image_url ?? undefined,
    };

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", data.id))
      .unique();

    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", clerkUserId))
      .unique();

    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});

export const current = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }
    return ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
  },
});

export const userByExternalId = query({
  args: { externalId: v.string() },
  async handler(ctx, { externalId }) {
    return ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
      .unique();
  },
});
