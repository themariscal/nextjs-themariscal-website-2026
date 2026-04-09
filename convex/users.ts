import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(),
  },
  async handler(ctx, { data }) {
    const email = (
      data.email_addresses as Array<{ email_address: string }>
    )[0]?.email_address as string | undefined;

    const userAttributes = {
      externalId: data.id as string,
      email: email ?? "",
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      username: data.username ?? undefined,
      imageUrl: data.image_url ?? undefined,
    };

    const existing = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", data.id))
      .unique();

    if (existing === null) {
      const userId = await ctx.db.insert("users", userAttributes);

      // Link any guest course purchases to this new user account
      if (email) {
        const guestPurchases = await ctx.db
          .query("coursePurchases")
          .withIndex("by_email", (q) => q.eq("email", email))
          .collect();

        for (const purchase of guestPurchases) {
          if (purchase.userId === undefined) {
            await ctx.db.patch(purchase._id, { userId });
          }
        }
      }
    } else {
      await ctx.db.patch(existing._id, userAttributes);
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
