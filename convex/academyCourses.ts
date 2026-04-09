import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function toFriendlySlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export const createCourseSectionWithElements = mutation({
  args: {
    courseId: v.id("academyCourses"),
    name: v.string(),
    elements: v.array(
      v.object({
        type: v.union(
          v.literal("video"),
          v.literal("quiz"),
          v.literal("resource"),
          v.literal("note")
        ),
        title: v.string(),
        durationLabel: v.optional(v.string()),
        isPreview: v.optional(v.boolean()),
        contentUrl: v.optional(v.string()),
        contentText: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const sectionName = args.name.trim();
    if (!sectionName) {
      throw new Error("El nombre de la sección es requerido.");
    }

    if (args.elements.length === 0) {
      throw new Error("Agregá al menos un elemento en la sección.");
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);

    const lastOrder = sections.reduce((maxOrder, section) => {
      return Math.max(maxOrder, section.order ?? 0);
    }, 0);

    const sectionId = await ctx.db.insert("academyCourseSections", {
      courseId: args.courseId,
      name: sectionName,
      order: lastOrder + 1,
    });

    for (let index = 0; index < args.elements.length; index += 1) {
      const element = args.elements[index];
      const title = element.title.trim();

      if (!title) {
        throw new Error(`El elemento #${index + 1} debe tener título.`);
      }

      await ctx.db.insert("academyCourseSectionElements", {
        sectionId,
        type: element.type,
        title,
        order: index + 1,
        durationLabel: element.durationLabel?.trim() || undefined,
        isPreview: element.isPreview ?? false,
        contentUrl: element.contentUrl?.trim() || undefined,
        contentText: element.contentText?.trim() || undefined,
      });
    }

    return sectionId;
  },
});

export const getCourseSectionsWithElements = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .take(500);

    return await Promise.all(
      sections.map(async (section) => {
        const elements = await ctx.db
          .query("academyCourseSectionElements")
          .withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
          .order("asc")
          .take(500);

        return {
          ...section,
          elements,
        };
      })
    );
  },
});

export const getPublicCourseBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const requestedSlug = toFriendlySlug(args.slug);
    if (!requestedSlug) return null;

    const courses = await ctx.db.query("academyCourses").order("desc").take(500);
    const course = courses.find((item) => toFriendlySlug(item.name) === requestedSlug) ?? null;
    if (!course) return null;

    const [language, instructor] = await Promise.all([
      ctx.db.get(course.languageId),
      ctx.db.get(course.instructorId),
    ]);

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .order("asc")
      .take(500);

    const sectionsWithElements = await Promise.all(
      sections.map(async (section) => {
        const elements = await ctx.db
          .query("academyCourseSectionElements")
          .withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
          .order("asc")
          .take(500);

        return {
          ...section,
          elements,
        };
      })
    );

    return {
      ...course,
      languageName: language?.name ?? null,
      instructorName: instructor?.name ?? null,
      slug: requestedSlug,
      sections: sectionsWithElements,
    };
  },
});

export const purchaseCourse = mutation({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Debes iniciar sesión para adquirir el curso.");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const existingEnrollment = await ctx.db
      .query("academyCourseEnrollments")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", args.courseId)
      )
      .unique();

    if (existingEnrollment) {
      return { status: "already_owned" as const };
    }

    await ctx.db.insert("academyCourseEnrollments", {
      tokenIdentifier: identity.tokenIdentifier,
      courseId: args.courseId,
      purchasedAt: Date.now(),
    });

    return { status: "purchased" as const };
  },
});

export const getMyPurchasedCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const enrollments = await ctx.db
      .query("academyCourseEnrollments")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .order("desc")
      .take(500);

    const items = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        return {
          enrollmentId: enrollment._id,
          purchasedAt: enrollment.purchasedAt,
          courseId: course._id,
          name: course.name,
          description: course.description,
          youtubeVideoId: course.youtubeVideoId,
          slug: toFriendlySlug(course.name),
        };
      })
    );

    return items.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const getPurchasedCoursePlayerBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Debes iniciar sesión para ver este curso.");
    }

    const requestedSlug = toFriendlySlug(args.slug);
    if (!requestedSlug) return null;

    const courses = await ctx.db.query("academyCourses").order("desc").take(500);
    const course = courses.find((item) => toFriendlySlug(item.name) === requestedSlug) ?? null;
    if (!course) return null;

    const enrollment = await ctx.db
      .query("academyCourseEnrollments")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
      )
      .unique();

    if (!enrollment) {
      return { accessDenied: true as const };
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .order("asc")
      .take(500);

    const sectionsWithElements = await Promise.all(
      sections.map(async (section) => {
        const elements = await ctx.db
          .query("academyCourseSectionElements")
          .withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
          .order("asc")
          .take(500);

        return {
          ...section,
          elements,
        };
      })
    );

    const progress = await ctx.db
      .query("academyCourseProgress")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
      )
      .take(1000);

    return {
      accessDenied: false as const,
      course: {
        _id: course._id,
        name: course.name,
        description: course.description,
        youtubeVideoId: course.youtubeVideoId,
        youtubeUrl: course.youtubeUrl,
        slug: requestedSlug,
      },
      sections: sectionsWithElements,
      completedElementIds: progress.map((item) => item.elementId),
    };
  },
});

export const toggleCourseElementCompleted = mutation({
  args: {
    courseId: v.id("academyCourses"),
    sectionId: v.id("academyCourseSections"),
    elementId: v.id("academyCourseSectionElements"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Debes iniciar sesión para actualizar el progreso.");
    }

    const enrollment = await ctx.db
      .query("academyCourseEnrollments")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", args.courseId)
      )
      .unique();

    if (!enrollment) {
      throw new Error("No tienes acceso a este curso.");
    }

    const section = await ctx.db.get(args.sectionId);
    if (!section || section.courseId !== args.courseId) {
      throw new Error("Sección inválida.");
    }

    const element = await ctx.db.get(args.elementId);
    if (!element || element.sectionId !== args.sectionId) {
      throw new Error("Elemento inválido.");
    }

    const existing = await ctx.db
      .query("academyCourseProgress")
      .withIndex("by_token_and_element", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("elementId", args.elementId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { completed: false as const };
    }

    await ctx.db.insert("academyCourseProgress", {
      tokenIdentifier: identity.tokenIdentifier,
      courseId: args.courseId,
      sectionId: args.sectionId,
      elementId: args.elementId,
      completedAt: Date.now(),
    });

    return { completed: true as const };
  },
});
