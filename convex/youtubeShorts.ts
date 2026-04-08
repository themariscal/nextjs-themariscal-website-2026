import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getByPage = query({
  args: {
    page: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("youtubeShorts")
      .withIndex("byPage", (q) => q.eq("page", args.page))
      .order("desc")
      .collect();
  },
});

export const getByPagePaginated = query({
  args: {
    page: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("youtubeShorts")
      .withIndex("byPage", (q) => q.eq("page", args.page))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getAllPaginated = query({
  args: {
    page: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.page) {
      return await ctx.db
        .query("youtubeShorts")
        .withIndex("byPage", (q) => q.eq("page", args.page!))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("youtubeShorts")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getPages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("youtubeShorts").order("desc").take(500);
    return Array.from(new Set(rows.map((row) => row.page))).sort((a, b) =>
      a.localeCompare(b)
    );
  },
});

export const getByVideoId = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("youtubeShorts")
      .filter((q) => q.eq(q.field("videoId"), args.videoId))
      .first();
    return results ?? null;
  },
});

export const getById = query({
  args: {
    id: v.id("youtubeShorts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

export const update = mutation({
  args: {
    id: v.id("youtubeShorts"),
    title: v.optional(v.string()),
    page: v.optional(v.string()),
    videoId: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Partial<{
      title: string;
      page: string;
      videoId: string;
      order: number;
    }> = {};
    if (fields.title !== undefined) patch.title = fields.title;
    if (fields.page !== undefined) patch.page = fields.page;
    if (fields.videoId !== undefined) patch.videoId = fields.videoId;
    if (fields.order !== undefined) patch.order = fields.order;
    await ctx.db.patch(id, patch);
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

export const toggleReaction = mutation({
  args: {
    videoId: v.string(),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const tokenIdentifier = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("shortReactions")
      .withIndex("by_token_and_video", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier).eq("videoId", args.videoId)
      )
      .unique();

    if (existing !== null) {
      if (existing.reaction === args.reaction) {
        // Toggle off: same reaction clicked again
        await ctx.db.delete(existing._id);
        return null;
      } else {
        // Switch reaction
        await ctx.db.patch(existing._id, { reaction: args.reaction });
        return args.reaction;
      }
    }

    await ctx.db.insert("shortReactions", {
      tokenIdentifier,
      videoId: args.videoId,
      reaction: args.reaction,
    });
    return args.reaction;
  },
});

export const getMyReaction = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const reaction = await ctx.db
      .query("shortReactions")
      .withIndex("by_token_and_video", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("videoId", args.videoId)
      )
      .unique();

    return reaction?.reaction ?? null;
  },
});

export const getReactionCounts = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("shortReactions")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .take(1000);

    let likes = 0;
    let dislikes = 0;
    for (const r of reactions) {
      if (r.reaction === "like") likes++;
      else dislikes++;
    }

    return { likes, dislikes };
  },
});
