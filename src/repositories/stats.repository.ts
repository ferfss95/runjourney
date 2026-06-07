import { prisma } from "@/lib/db";
import type { AchievementType } from "@prisma/client";

export const statsRepository = {
  getUserStats() {
    return prisma.userStats.findUnique({ where: { id: "singleton" } });
  },

  async ensureUserStats() {
    return prisma.userStats.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
  },

  updateUserStats(data: {
    totalXp?: number;
    level?: number;
    currentStreak?: number;
    bestStreak?: number;
    totalDistance?: number;
    totalWorkouts?: number;
    completedCount?: number;
    missedCount?: number;
    avgPace?: number | null;
    bestPace?: number | null;
    longestRun?: number;
    lastWorkoutDate?: Date | null;
  }) {
    return prisma.userStats.update({
      where: { id: "singleton" },
      data,
    });
  },

  getAchievements() {
    return prisma.achievement.findMany({ orderBy: { createdAt: "asc" } });
  },

  unlockAchievement(type: AchievementType) {
    return prisma.achievement.update({
      where: { type },
      data: { unlockedAt: new Date() },
    });
  },

  lockAchievement(type: AchievementType) {
    return prisma.achievement.update({
      where: { type },
      data: { unlockedAt: null },
    });
  },

  removeXpByWorkoutId(workoutId: string) {
    return prisma.xPHistory.deleteMany({ where: { workoutId } });
  },

  getTotalXp() {
    return prisma.xPHistory.aggregate({ _sum: { amount: true } });
  },

  ensureAchievements(
    achievements: {
      type: AchievementType;
      title: string;
      description: string;
      icon: string;
    }[]
  ) {
    return Promise.all(
      achievements.map((a) =>
        prisma.achievement.upsert({
          where: { type: a.type },
          create: a,
          update: {},
        })
      )
    );
  },

  addXp(amount: number, source: string, description?: string, workoutId?: string) {
    return prisma.xPHistory.create({
      data: { amount, source, description, workoutId },
    });
  },

  getXpHistory(limit = 20) {
    return prisma.xPHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  getWeightRecords() {
    return prisma.weightRecord.findMany({ orderBy: { date: "asc" } });
  },

  addWeightRecord(weight: number, date: Date, notes?: string) {
    return prisma.weightRecord.create({
      data: { weight, date, notes },
    });
  },
};
