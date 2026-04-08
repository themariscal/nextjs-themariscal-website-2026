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

  shortReactions: defineTable({
    tokenIdentifier: v.string(),
    videoId: v.string(),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  })
    .index("by_token_and_video", ["tokenIdentifier", "videoId"])
    .index("by_video", ["videoId"]),

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
