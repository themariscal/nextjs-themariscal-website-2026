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

export const getCoursesNewest = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("academyCourses").order("desc").take(500);

    return await Promise.all(
      courses.map(async (course) => {
        const [language, instructor] = await Promise.all([
          ctx.db.get(course.languageId),
          ctx.db.get(course.instructorId),
        ]);

        return {
          ...course,
          languageName: language?.name ?? null,
          instructorName: instructor?.name ?? null,
        };
      })
    );
  },
});

export const getCourseById = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const [language, instructor] = await Promise.all([
      ctx.db.get(course.languageId),
      ctx.db.get(course.instructorId),
    ]);

    return {
      ...course,
      languageName: language?.name ?? null,
      instructorName: instructor?.name ?? null,
    };
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("academyCourses"),
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const [course, language, instructor] = await Promise.all([
      ctx.db.get(args.courseId),
      ctx.db.get(args.languageId),
      ctx.db.get(args.instructorId),
    ]);

    if (!course) {
      throw new Error("Curso inválido.");
    }

    if (!language) {
      throw new Error("Idioma inválido.");
    }

    if (!instructor) {
      throw new Error("Instructor inválido.");
    }

    await ctx.db.patch(args.courseId, {
      name: args.name.trim(),
      youtubeUrl: args.youtubeUrl.trim(),
      youtubeVideoId: args.youtubeVideoId.trim(),
      languageId: args.languageId,
      instructorId: args.instructorId,
      description: args.description.trim(),
    });

    return args.courseId;
  },
});

export const getCourseSections = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .take(500);
  },
});

export const addCourseSection = mutation({
  args: {
    courseId: v.id("academyCourses"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("El nombre de la sección es requerido.");
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);

    const lastOrder = sections.reduce((maxOrder, section) => {
      return Math.max(maxOrder, section.order ?? 0);
    }, 0);

    return await ctx.db.insert("academyCourseSections", {
      courseId: args.courseId,
      name: trimmedName,
      order: lastOrder + 1,
    });
  },
});
