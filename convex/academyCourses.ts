import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLanguages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courseLanguages").order("asc").take(500);
  },
});

export const addLanguage = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.trim().toLowerCase();
    if (!normalizedName) return null;

    const existing = await ctx.db
      .query("courseLanguages")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (existing) return existing._id;
    return await ctx.db.insert("courseLanguages", { name: normalizedName });
  },
});

export const getInstructors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courseInstructors").order("asc").take(500);
  },
});

export const addInstructor = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.trim();
    if (!normalizedName) return null;

    const existing = await ctx.db
      .query("courseInstructors")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .unique();

    if (existing) return existing._id;
    return await ctx.db.insert("courseInstructors", { name: normalizedName });
  },
});

export const createCourse = mutation({
  args: {
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const [language, instructor] = await Promise.all([
      ctx.db.get(args.languageId),
      ctx.db.get(args.instructorId),
    ]);

    if (!language) {
      throw new Error("Idioma inválido.");
    }

    if (!instructor) {
      throw new Error("Instructor inválido.");
    }

    return await ctx.db.insert("academyCourses", {
      name: args.name.trim(),
      youtubeUrl: args.youtubeUrl.trim(),
      youtubeVideoId: args.youtubeVideoId.trim(),
      languageId: args.languageId,
      instructorId: args.instructorId,
      description: args.description.trim(),
    });
  },
});

