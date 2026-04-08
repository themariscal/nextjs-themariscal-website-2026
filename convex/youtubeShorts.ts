import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByPage = query({
  args: {
    page: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("youtubeShorts")
      .withIndex("byPage", (q) => q.eq("page", args.page))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    videoId: v.string(),
    title: v.string(),
    page: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("youtubeShorts", {
      videoId: args.videoId,
      title: args.title,
      page: args.page,
      order: args.order,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("youtubeShorts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
