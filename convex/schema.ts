import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    matricula: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    streak: v.optional(v.number()),
    bestStreak: v.optional(v.number()),
    lastCompletedDate: v.optional(v.string()),
    practicedWeekDays: v.optional(v.array(v.string())),
    currentDailyMissionId: v.optional(v.string()),
    currentDailyMissionProgress: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("matricula", ["matricula"]),
  assignmentCompletions: defineTable({
    userId: v.string(),
    assignmentId: v.string(),
    subject: v.string(),
    completedAt: v.string(),
  }).index("userId", ["userId"]),
});

export default schema;
