import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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

function parseDurationToSeconds(value?: string): number {
  if (!value) return 0;

  const normalized = value.trim().toLowerCase();
  const mmss = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);

  const hhmmss = normalized.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (hhmmss) return Number(hhmmss[1]) * 3600 + Number(hhmmss[2]) * 60 + Number(hhmmss[3]);

  const min = normalized.match(/^(\d+)\s*min$/);
  if (min) return Number(min[1]) * 60;

  return 0;
}

function isElementCompleted(progress?: {
  manualCompleted?: boolean;
  autoCompleted?: boolean;
} | null): boolean {
  if (!progress) return false;
  return Boolean(progress.manualCompleted || progress.autoCompleted);
}

async function refreshEnrollmentCompletionState(
  ctx: MutationCtx,
  args: {
    tokenIdentifier: string;
    courseId: Id<"academyCourses">;
  }
) {
  const sections = await ctx.db
    .query("academyCourseSections")
    .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
    .order("asc")
    .take(500);

  const sectionElements = await Promise.all(
    sections.map((section) =>
      ctx.db
        .query("academyCourseSectionElements")
        .withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
        .order("asc")
        .take(500)
    )
  );

  const allElements = sectionElements.flat();
  const total = allElements.length;

  const progressRows = await ctx.db
    .query("academyCourseProgress")
    .withIndex("by_token_and_course", (q) =>
      q.eq("tokenIdentifier", args.tokenIdentifier).eq("courseId", args.courseId)
    )
    .take(1000);

  const progressByElementId = new Map(
    progressRows.map((row) => [String(row.elementId), row] as const)
  );
  const completed = allElements.reduce((acc, element) => {
    return acc + (isElementCompleted(progressByElementId.get(String(element._id))) ? 1 : 0);
  }, 0);
  const isCompleted = total > 0 && completed >= total;

  const enrollment = await ctx.db
    .query("academyCourseEnrollments")
    .withIndex("by_token_and_course", (q) =>
      q.eq("tokenIdentifier", args.tokenIdentifier).eq("courseId", args.courseId)
    )
    .unique();

  if (!enrollment) return;

  if (isCompleted && !enrollment.completedAt) {
    await ctx.db.patch(enrollment._id, { completedAt: Date.now() });
  } else if (!isCompleted && enrollment.completedAt) {
    await ctx.db.patch(enrollment._id, { completedAt: undefined });
  }
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
      completedAt: undefined,
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

        const sections = await ctx.db
          .query("academyCourseSections")
          .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
          .order("asc")
          .take(500);

        const sectionElements = await Promise.all(
          sections.map((section) =>
            ctx.db
              .query("academyCourseSectionElements")
              .withIndex("by_section_and_order", (q) => q.eq("sectionId", section._id))
              .order("asc")
              .take(500)
          )
        );

        const allElements = sectionElements.flat();
        const totalElements = allElements.length;

        const progressRows = await ctx.db
          .query("academyCourseProgress")
          .withIndex("by_token_and_course", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
          )
          .take(1000);

        const progressByElementId = new Map(
          progressRows.map((row) => [String(row.elementId), row] as const)
        );

        const completedElements = allElements.reduce((acc, element) => {
          return acc + (isElementCompleted(progressByElementId.get(String(element._id))) ? 1 : 0);
        }, 0);
        const progressPercent =
          totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0;
        const isCompleted = totalElements > 0 && completedElements >= totalElements;

        const playback = await ctx.db
          .query("academyCoursePlaybackState")
          .withIndex("by_token_and_course", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
          )
          .order("desc")
          .take(1);

        const hasStarted = progressRows.length > 0 || playback.length > 0;
        const continueTarget = {
          slug: toFriendlySlug(course.name),
          sectionId: playback[0]?.sectionId ?? null,
          elementId: playback[0]?.elementId ?? null,
          positionSeconds: playback[0]?.positionSeconds ?? 0,
        };

        return {
          enrollmentId: enrollment._id,
          purchasedAt: enrollment.purchasedAt,
          completedAt: enrollment.completedAt ?? null,
          courseId: course._id,
          name: course.name,
          description: course.description,
          youtubeVideoId: course.youtubeVideoId,
          slug: toFriendlySlug(course.name),
          progressPercent,
          isCompleted,
          hasStarted,
          continueTarget,
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

    const progressByElement = Object.fromEntries(
      progress.map((item) => [
        String(item.elementId),
        {
          manualCompleted: item.manualCompleted ?? false,
          autoCompleted: item.autoCompleted ?? false,
          watchedSeconds: item.watchedSeconds ?? 0,
          durationSeconds:
            item.durationSeconds ??
            parseDurationToSeconds(
              sectionsWithElements
                .flatMap((section) => section.elements)
                .find((element) => String(element._id) === String(item.elementId))
                ?.durationLabel
            ),
          lastWatchedAt: item.lastWatchedAt ?? null,
          completedAt: item.completedAt ?? null,
        },
      ])
    );

    const allElements = sectionsWithElements.flatMap((section) => section.elements);
    const totalElements = allElements.length;
    const completedElements = allElements.reduce((acc, element) => {
      return acc + (isElementCompleted(progressByElement[String(element._id)]) ? 1 : 0);
    }, 0);
    const percent = totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0;

    const lastPlayback = await ctx.db
      .query("academyCoursePlaybackState")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
      )
      .order("desc")
      .take(1);

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
      progressByElement,
      lastPlayback: lastPlayback[0]
        ? {
            sectionId: lastPlayback[0].sectionId,
            elementId: lastPlayback[0].elementId,
            positionSeconds: lastPlayback[0].positionSeconds,
            updatedAt: lastPlayback[0].updatedAt,
          }
        : null,
      courseProgress: {
        totalElements,
        completedElements,
        percent,
        isCompleted: totalElements > 0 && completedElements >= totalElements,
      },
    };
  },
});

export const upsertCoursePlaybackProgress = mutation({
  args: {
    courseId: v.id("academyCourses"),
    sectionId: v.id("academyCourseSections"),
    elementId: v.id("academyCourseSectionElements"),
    positionSeconds: v.number(),
    watchedSeconds: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Debes iniciar sesión para guardar el progreso.");
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

    const playbackRows = await ctx.db
      .query("academyCoursePlaybackState")
      .withIndex("by_token_and_course", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", args.courseId)
      )
      .order("desc")
      .take(10);

    const latestPlayback = playbackRows[0];
    if (latestPlayback) {
      await ctx.db.patch(latestPlayback._id, {
        sectionId: args.sectionId,
        elementId: args.elementId,
        positionSeconds: Math.max(0, Math.floor(args.positionSeconds)),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("academyCoursePlaybackState", {
        tokenIdentifier: identity.tokenIdentifier,
        courseId: args.courseId,
        sectionId: args.sectionId,
        elementId: args.elementId,
        positionSeconds: Math.max(0, Math.floor(args.positionSeconds)),
        updatedAt: Date.now(),
      });
    }

    for (const stalePlayback of playbackRows.slice(1)) {
      await ctx.db.delete(stalePlayback._id);
    }

    const progressRows = await ctx.db
      .query("academyCourseProgress")
      .withIndex("by_token_and_element", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("elementId", args.elementId)
      )
      .take(10);

    const now = Date.now();
    const durationSeconds = Math.max(0, Math.floor(args.durationSeconds));
    const watchedSeconds = Math.max(0, Math.floor(args.watchedSeconds));
    const autoCompleted =
      element.type === "video" && durationSeconds > 0
        ? watchedSeconds / durationSeconds >= 0.9
        : progressRows[0]?.autoCompleted ?? false;

    const primaryProgress = progressRows[0];
    if (primaryProgress) {
      await ctx.db.patch(primaryProgress._id, {
        courseId: args.courseId,
        sectionId: args.sectionId,
        watchedSeconds: Math.max(watchedSeconds, primaryProgress.watchedSeconds ?? 0),
        durationSeconds: durationSeconds || primaryProgress.durationSeconds || undefined,
        autoCompleted,
        completedAt:
          autoCompleted || primaryProgress.manualCompleted
            ? primaryProgress.completedAt ?? now
            : undefined,
        lastWatchedAt: now,
      });
    } else {
      await ctx.db.insert("academyCourseProgress", {
        tokenIdentifier: identity.tokenIdentifier,
        courseId: args.courseId,
        sectionId: args.sectionId,
        elementId: args.elementId,
        completedAt: autoCompleted ? now : now,
        watchedSeconds,
        durationSeconds: durationSeconds || undefined,
        manualCompleted: false,
        autoCompleted,
        lastWatchedAt: now,
      });
    }

    for (const duplicateProgress of progressRows.slice(1)) {
      await ctx.db.delete(duplicateProgress._id);
    }

    await refreshEnrollmentCompletionState(ctx, {
      tokenIdentifier: identity.tokenIdentifier,
      courseId: args.courseId,
    });

    return { ok: true as const };
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

    const existingRows = await ctx.db
      .query("academyCourseProgress")
      .withIndex("by_token_and_element", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier).eq("elementId", args.elementId)
      )
      .take(10);

    const existing = existingRows[0];
    const now = Date.now();

    if (existing) {
      const nextManualCompleted = !(existing.manualCompleted ?? false);
      const autoCompleted = existing.autoCompleted ?? false;
      const completed = nextManualCompleted || autoCompleted;

      await ctx.db.patch(existing._id, {
        manualCompleted: nextManualCompleted,
        completedAt: completed ? existing.completedAt ?? now : undefined,
        lastWatchedAt: existing.lastWatchedAt ?? now,
      });

      for (const duplicate of existingRows.slice(1)) {
        await ctx.db.delete(duplicate._id);
      }

      await refreshEnrollmentCompletionState(ctx, {
        tokenIdentifier: identity.tokenIdentifier,
        courseId: args.courseId,
      });

      return { completed };
    }

    await ctx.db.insert("academyCourseProgress", {
      tokenIdentifier: identity.tokenIdentifier,
      courseId: args.courseId,
      sectionId: args.sectionId,
      elementId: args.elementId,
      completedAt: now,
      manualCompleted: true,
      autoCompleted: false,
      watchedSeconds: 0,
      durationSeconds: parseDurationToSeconds(element.durationLabel),
      lastWatchedAt: now,
    });

    await refreshEnrollmentCompletionState(ctx, {
      tokenIdentifier: identity.tokenIdentifier,
      courseId: args.courseId,
    });

    return { completed: true as const };
  },
});

export const removeSectionByName = mutation({
  args: {
    courseId: v.id("academyCourses"),
    sectionName: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);

    const target = sections.find(
      (section) => section.name.trim().toLowerCase() === args.sectionName.trim().toLowerCase()
    );

    if (!target) {
      return { removed: false as const, removedElements: 0 };
    }

    const elements = await ctx.db
      .query("academyCourseSectionElements")
      .withIndex("by_section", (q) => q.eq("sectionId", target._id))
      .take(500);

    for (const element of elements) {
      await ctx.db.delete(element._id);
    }

    await ctx.db.delete(target._id);

    const remainingSections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .take(500);

    for (let index = 0; index < remainingSections.length; index += 1) {
      const section = remainingSections[index];
      const expectedOrder = index + 1;
      if ((section.order ?? expectedOrder) !== expectedOrder) {
        await ctx.db.patch(section._id, { order: expectedOrder });
      }
    }

    return { removed: true as const, removedElements: elements.length };
  },
});

export const randomizeVideoPreviews = mutation({
  args: {
    courseId: v.id("academyCourses"),
    previewCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);

    const elements = (
      await Promise.all(
        sections.map((section) =>
          ctx.db
            .query("academyCourseSectionElements")
            .withIndex("by_section", (q) => q.eq("sectionId", section._id))
            .take(500)
        )
      )
    ).flat();

    const videoElements = elements.filter((element) => element.type === "video");
    if (videoElements.length === 0) {
      return { updated: 0, previewIds: [] as string[] };
    }

    const requestedCount = args.previewCount ?? 6;
    const count = Math.max(1, Math.min(videoElements.length, Math.floor(requestedCount)));

    const shuffled = [...videoElements];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedIds = new Set(shuffled.slice(0, count).map((element) => String(element._id)));

    let updated = 0;
    for (const element of videoElements) {
      const nextPreview = selectedIds.has(String(element._id));
      if ((element.isPreview ?? false) !== nextPreview) {
        await ctx.db.patch(element._id, { isPreview: nextPreview });
        updated += 1;
      }
    }

    return {
      updated,
      previewIds: [...selectedIds],
    };
  },
});

export const renumberSectionTitles = mutation({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Curso inválido.");
    }

    const sections = await ctx.db
      .query("academyCourseSections")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .take(500);

    let updated = 0;

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const nextOrder = index + 1;

      const currentName = section.name.trim();
      const rest = currentName.replace(/^section\s+\d+\s*:\s*/i, "");
      const nextName = /^section\s+\d+\s*:/i.test(currentName)
        ? `Section ${nextOrder}: ${rest}`
        : currentName;

      const patch: {
        order?: number;
        name?: string;
      } = {};

      if ((section.order ?? nextOrder) !== nextOrder) {
        patch.order = nextOrder;
      }

      if (nextName !== section.name) {
        patch.name = nextName;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(section._id, patch);
        updated += 1;
      }
    }

    return { updated, total: sections.length };
  },
});

export const removeCourseElementById = mutation({
  args: {
    elementId: v.id("academyCourseSectionElements"),
  },
  handler: async (ctx, args) => {
    const element = await ctx.db.get(args.elementId);
    if (!element) {
      return { removed: false as const };
    }

    const sectionId = element.sectionId;
    await ctx.db.delete(args.elementId);

    const remaining = await ctx.db
      .query("academyCourseSectionElements")
      .withIndex("by_section_and_order", (q) => q.eq("sectionId", sectionId))
      .order("asc")
      .take(500);

    for (let index = 0; index < remaining.length; index += 1) {
      const item = remaining[index];
      const nextOrder = index + 1;
      if ((item.order ?? nextOrder) !== nextOrder) {
        await ctx.db.patch(item._id, { order: nextOrder });
      }
    }

    return { removed: true as const, sectionId };
  },
});
