import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import lostCurrentStreak from "../src/utils/lostCurrentStreak";
import { defaultDailyMissions } from "../src/constants/defaultDailyMissions";
import { addHours, format, isSameDay } from "date-fns";

export const currentUser = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .unique();
  },
});

export const getUserByMatricula = mutation({
  args: {
    matricula: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("matricula"), args.matricula))
      .unique();
  },
});

export const updateUserStreak = mutation({
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return;
    }
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("_id"), userId))
      .unique();
    if (user === null) {
      throw new Error("User not found");
    }
    const streak = user.streak ?? 0;
    const bestStreak = user.bestStreak ?? 0;
    const lastCompletedDate = user.lastCompletedDate ?? "";
    const practicedWeekDays = user.practicedWeekDays ?? [];

    const completionDate = new Date(); // Convex server timezone (UTC)
    const localDate = addHours(completionDate, -3).toISOString(); // UTC-3 timezone (America/Sao_Paulo)

    const lastCompletionIsToday =
      lastCompletedDate && isSameDay(new Date(lastCompletedDate), localDate);
    if (lastCompletionIsToday) return; // Do nothing if the user already completed a task today

    if (lostCurrentStreak(lastCompletedDate)) {
      const newBestStreak = Math.max(1, bestStreak);
      const formatedPracticedWeekDay = format(localDate, "iii");
      await ctx.db.patch(userId, {
        streak: 1,
        bestStreak: newBestStreak,
        lastCompletedDate: localDate,
        practicedWeekDays: [formatedPracticedWeekDay],
      });
    } else {
      const formatedPracticedWeekDay = format(localDate, "iii");
      await ctx.db.patch(userId, {
        streak: streak + 1,
        bestStreak: Math.max(streak + 1, bestStreak),
        lastCompletedDate: localDate,
        practicedWeekDays: [...practicedWeekDays, formatedPracticedWeekDay],
      });
    }
  },
});

export const resetAllUsersPracticedWeekDays = internalMutation({
  args: {},
  handler: async ctx => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.patch(user._id, {
        practicedWeekDays: [],
      });
    }
  },
});

export const resetAllUsersDailyMissionProgress = internalMutation({
  args: {},
  handler: async ctx => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const randomMissionIndex = Math.floor(
        Math.random() * defaultDailyMissions.length
      );
      const randomMissionId = defaultDailyMissions[randomMissionIndex].id;
      await ctx.db.patch(user._id, {
        currentDailyMissionId: randomMissionId,
        currentDailyMissionProgress: 0,
      });
    }
  },
});
