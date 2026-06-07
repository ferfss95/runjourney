import { ACHIEVEMENT_DEFINITIONS, WORKOUT_TYPE_XP } from "@/lib/constants";
import { levelFromXp } from "@/lib/utils";
import { statsRepository } from "@/repositories/stats.repository";
import type { AchievementType, WorkoutType } from "@prisma/client";

export const gamificationService = {
  async initialize() {
    await statsRepository.ensureUserStats();
    await statsRepository.ensureAchievements(
      Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => ({
        type: type as AchievementType,
        ...def,
      }))
    );
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

  async getGamificationData() {
    await this.initialize();
    const [stats, achievements, xpHistory] = await Promise.all([
      statsRepository.getUserStats(),
      statsRepository.getAchievements(),
      statsRepository.getXpHistory(10),
    ]);
    return { stats, achievements, xpHistory };
  },
};
