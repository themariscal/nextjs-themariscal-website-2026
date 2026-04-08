import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  youtubeShorts: defineTable({
    videoId: v.string(),
    title: v.string(),
    page: v.string(),
    order: v.optional(v.number()),
  })
    .index("byPage", ["page"])
    .index("byPageAndOrder", ["page", "order"]),

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
