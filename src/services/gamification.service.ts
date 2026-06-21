import { ACHIEVEMENT_DEFINITIONS, WORKOUT_TYPE_XP } from "@/lib/constants";
import { levelFromXp } from "@/lib/utils";
import {
  getAchievements,
  getUserStats,
  getXpHistory,
} from "@/lib/cached-data";
import { statsRepository } from "@/repositories/stats.repository";
import { workoutRepository } from "@/repositories/workout.repository";
import type { AchievementType, WorkoutType } from "@prisma/client";

const ACHIEVEMENT_COUNT = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
let initialized = false;

export const gamificationService = {
  async initializeIfNeeded() {
    if (initialized) return;
    await statsRepository.ensureUserStats();
    const existing = await statsRepository.getAchievements();
    if (existing.length < ACHIEVEMENT_COUNT) {
      await statsRepository.ensureAchievements(
        Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => ({
          type: type as AchievementType,
          ...def,
        }))
      );
    }
    initialized = true;
  },

  /** @deprecated use initializeIfNeeded */
  async initialize() {
    return this.initializeIfNeeded();
  },

  getXpForWorkout(type: WorkoutType): number {
    return WORKOUT_TYPE_XP[type];
  },

  async awardXp(
    type: WorkoutType,
    workoutId: string,
    workoutLabel: string
  ): Promise<number> {
    const xp = this.getXpForWorkout(type);
    await statsRepository.addXp(xp, "workout", workoutLabel, workoutId);
    const stats = await statsRepository.getUserStats();
    const newTotal = (stats?.totalXp ?? 0) + xp;
    const newLevel = levelFromXp(newTotal);
    await statsRepository.updateUserStats({
      totalXp: newTotal,
      level: newLevel,
    });
    return xp;
  },

  async checkAchievements(data: {
    completedCount: number;
    totalDistance: number;
    longestRun: number;
    lastRunDistance: number;
    hasLongRun: boolean;
  }) {
    const checks: { type: AchievementType; condition: boolean }[] = [
      { type: "FIRST_RUN", condition: data.completedCount >= 1 },
      { type: "FIVE_WORKOUTS", condition: data.completedCount >= 5 },
      { type: "TEN_WORKOUTS", condition: data.completedCount >= 10 },
      { type: "TWENTY_FIVE_WORKOUTS", condition: data.completedCount >= 25 },
      { type: "FIFTY_KM", condition: data.totalDistance >= 50 },
      { type: "HUNDRED_KM", condition: data.totalDistance >= 100 },
      { type: "FIRST_LONG_RUN", condition: data.hasLongRun },
      { type: "FIRST_10K", condition: data.lastRunDistance >= 10 },
      {
        type: "FIRST_HALF_MARATHON",
        condition: data.lastRunDistance >= 21.1,
      },
    ];

    const achievements = await statsRepository.getAchievements();
    const unlocked: AchievementType[] = [];

    for (const check of checks) {
      const achievement = achievements.find((a) => a.type === check.type);
      if (achievement && !achievement.unlockedAt && check.condition) {
        await statsRepository.unlockAchievement(check.type);
        unlocked.push(check.type);
      }
    }

    return unlocked;
  },

  async revokeXpForWorkout(workoutId: string) {
    await statsRepository.removeXpByWorkoutId(workoutId);
    const total = await statsRepository.getTotalXp();
    const totalXp = total._sum.amount ?? 0;
    await statsRepository.updateUserStats({
      totalXp,
      level: levelFromXp(totalXp),
    });
  },

  async syncAchievements() {
    const completed = await workoutRepository.getCompletedWithExecutions();

    const completedCount = completed.length;
    const totalDistance = completed.reduce(
      (s, w) => s + (w.execution?.actualDistance ?? 0),
      0
    );
    const hasLongRun = completed.some((w) => w.type === "LONG_RUN");
    const maxSingleRun = completed.reduce(
      (max, w) => Math.max(max, w.execution?.actualDistance ?? 0),
      0
    );

    const checks: { type: AchievementType; condition: boolean }[] = [
      { type: "FIRST_RUN", condition: completedCount >= 1 },
      { type: "FIVE_WORKOUTS", condition: completedCount >= 5 },
      { type: "TEN_WORKOUTS", condition: completedCount >= 10 },
      { type: "TWENTY_FIVE_WORKOUTS", condition: completedCount >= 25 },
      { type: "FIFTY_KM", condition: totalDistance >= 50 },
      { type: "HUNDRED_KM", condition: totalDistance >= 100 },
      { type: "FIRST_LONG_RUN", condition: hasLongRun },
      { type: "FIRST_10K", condition: maxSingleRun >= 10 },
      { type: "FIRST_HALF_MARATHON", condition: maxSingleRun >= 21.1 },
    ];

    for (const check of checks) {
      if (check.condition) {
        await statsRepository.unlockAchievement(check.type);
      } else {
        await statsRepository.lockAchievement(check.type);
      }
    }
  },

  async getGamificationData() {
    await this.initializeIfNeeded();
    const [stats, achievements, xpHistory] = await Promise.all([
      getUserStats(),
      getAchievements(),
      getXpHistory(10),
    ]);
    return { stats, achievements, xpHistory };
  },
};
