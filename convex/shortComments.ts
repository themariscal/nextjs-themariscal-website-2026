import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    videoId: v.string(),
    text: v.string(),
    parentId: v.optional(v.id("shortComments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Debes iniciar sesión para comentar");

    const text = args.text.trim();
    if (text.length === 0) throw new Error("El comentario no puede estar vacío");
    if (text.length > 500) throw new Error("El comentario no puede superar 500 caracteres");

    await ctx.db.insert("shortComments", {
      videoId: args.videoId,
      tokenIdentifier: identity.tokenIdentifier,
      text,
      authorName: identity.nickname ?? identity.name ?? "Usuario",
      authorImage: identity.pictureUrl,
      parentId: args.parentId,
    });
  },
});

export const getComments = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shortComments")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .order("asc")
      .take(200);
  },
});
