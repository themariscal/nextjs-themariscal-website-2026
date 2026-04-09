import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const getShortSection = (short: { section?: string; page?: string }) =>
  short.section ?? short.page ?? "home";

export const getByPage = query({
  args: {
    page: v.string(),
  },
  handler: async (ctx, args) => {
    const bySection = await ctx.db
      .query("youtubeShorts")
      .withIndex("bySectionAndOrder", (q) => q.eq("section", args.page))
      .order("asc")
      .collect();

    if (bySection.length > 0) return bySection;

    return await ctx.db
      .query("youtubeShorts")
      .withIndex("byPageAndOrder", (q) => q.eq("page", args.page))
      .order("asc")
      .collect();
  },
});

export const getByPagePaginated = query({
  args: {
    page: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const hasSectionRows = await ctx.db
      .query("youtubeShorts")
      .withIndex("bySectionAndOrder", (q) => q.eq("section", args.page))
      .order("asc")
      .take(1);

    if (hasSectionRows.length > 0) {
      return await ctx.db
        .query("youtubeShorts")
        .withIndex("bySectionAndOrder", (q) => q.eq("section", args.page))
        .order("asc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("youtubeShorts")
      .withIndex("byPageAndOrder", (q) => q.eq("page", args.page))
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const getAllPaginated = query({
  args: {
    section: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.section) {
      const hasSectionRows = await ctx.db
        .query("youtubeShorts")
        .withIndex("bySectionAndOrder", (q) => q.eq("section", args.section!))
        .order("asc")
        .take(1);

      if (hasSectionRows.length > 0) {
        return await ctx.db
          .query("youtubeShorts")
          .withIndex("bySectionAndOrder", (q) => q.eq("section", args.section!))
          .order("asc")
          .paginate(args.paginationOpts);
      }

      return await ctx.db
        .query("youtubeShorts")
        .withIndex("byPageAndOrder", (q) => q.eq("page", args.section!))
        .order("asc")
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
    return Array.from(new Set(rows.map((row) => getShortSection(row)))).sort((a, b) =>
      a.localeCompare(b)
    );
  },
});

export const getSections = query({
  args: {},
  handler: async (ctx) => {
    const [sectionsRows, shortsRows] = await Promise.all([
      ctx.db.query("shortSections").order("desc").take(500),
      ctx.db.query("youtubeShorts").order("desc").take(500),
    ]);

    return Array.from(
      new Set([
        ...sectionsRows.map((row) => row.name),
        ...shortsRows.map((row) => getShortSection(row)),
      ])
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  },
});

export const addSection = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.trim().toLowerCase();
    if (!normalizedName) return null;

    const existing = await ctx.db
      .query("shortSections")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (existing) return existing._id;
    return await ctx.db.insert("shortSections", { name: normalizedName });
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

export const getBySectionForOrdering = query({
  args: {
    section: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.section.trim()) return [];

    const [bySection, byPage] = await Promise.all([
      ctx.db
        .query("youtubeShorts")
        .withIndex("bySectionAndOrder", (q) => q.eq("section", args.section))
        .order("asc")
        .collect(),
      ctx.db
        .query("youtubeShorts")
        .withIndex("byPageAndOrder", (q) => q.eq("page", args.section))
        .order("asc")
        .collect(),
    ]);

    // Merge and deduplicate (docs with both section+page appear in both lists)
    const seen = new Set<string>();
    const merged: typeof bySection = [];
    for (const doc of [...bySection, ...byPage]) {
      if (!seen.has(doc._id)) {
        seen.add(doc._id);
        merged.push(doc);
      }
    }

    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const create = mutation({
  args: {
    videoId: v.string(),
    title: v.string(),
    section: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalizedSection = args.section.trim().toLowerCase();
    return await ctx.db.insert("youtubeShorts", {
      videoId: args.videoId,
      title: args.title,
      section: normalizedSection,
      // Backward compatibility with existing routes/data usage.
      page: normalizedSection,
      order: args.order,
    });
  },
});

export const bulkUpdateOrder = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("youtubeShorts"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const doc = await ctx.db.get(item.id);
      const patch: { order: number; section?: string } = { order: item.order };
      // Migrate page → section for legacy docs
      if (doc && !doc.section && doc.page) {
        patch.section = doc.page;
      }
      await ctx.db.patch(item.id, patch);
    }
    return { updated: args.items.length };
  },
});

export const update = mutation({
  args: {
    id: v.id("youtubeShorts"),
    title: v.optional(v.string()),
    section: v.optional(v.string()),
    videoId: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Partial<{
      title: string;
      section: string;
      page: string;
      videoId: string;
      order: number;
    }> = {};
    if (fields.title !== undefined) patch.title = fields.title;
    if (fields.section !== undefined) {
      const normalizedSection = fields.section.trim().toLowerCase();
      patch.section = normalizedSection;
      patch.page = normalizedSection;
    }
    if (fields.videoId !== undefined) patch.videoId = fields.videoId;
    if (fields.order !== undefined) patch.order = fields.order;
    await ctx.db.patch(id, patch);
  },
});

export const migratePageToSection = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("youtubeShorts").collect();
    let count = 0;
    for (const doc of docs) {
      if (!doc.section && doc.page) {
        await ctx.db.patch(doc._id, { section: doc.page });
        count++;
      }
    }
    return { migrated: count };
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
