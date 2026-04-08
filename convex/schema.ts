import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  youtubeShorts: defineTable({
    videoId: v.string(),
    title: v.string(),
    // `section` is the new canonical field.
    // `page` remains optional for backward compatibility with existing routes/data.
    section: v.optional(v.string()),
    page: v.optional(v.string()),
    order: v.optional(v.number()),
  })
    .index("bySection", ["section"])
    .index("bySectionAndOrder", ["section", "order"])
    .index("byPage", ["page"])
    .index("byPageAndOrder", ["page", "order"]),

  shortSections: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  courseLanguages: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  courseInstructors: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  academyCourses: defineTable({
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
  })
    .index("by_language", ["languageId"])
    .index("by_instructor", ["instructorId"]),

  academyCourseSections: defineTable({
    courseId: v.id("academyCourses"),
    name: v.string(),
    order: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_and_order", ["courseId", "order"]),

  shortReactions: defineTable({
    tokenIdentifier: v.string(),
    videoId: v.string(),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  })
    .index("by_token_and_video", ["tokenIdentifier", "videoId"])
    .index("by_video", ["videoId"]),

  shortComments: defineTable({
    videoId: v.string(),
    tokenIdentifier: v.string(),
    text: v.string(),
    authorName: v.optional(v.string()),
    authorImage: v.optional(v.string()),
    parentId: v.optional(v.id("shortComments")),
  })
    .index("by_video", ["videoId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_parent", ["parentId"]),

  users: defineTable({
    externalId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  })
    .index("byExternalId", ["externalId"])
    .index("byEmail", ["email"])
    .index("byUsername", ["username"]),
});
