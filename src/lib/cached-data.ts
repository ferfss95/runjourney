import { cache } from "react";
import { planRepository } from "@/repositories/plan.repository";
import { workoutRepository } from "@/repositories/workout.repository";
import { statsRepository } from "@/repositories/stats.repository";

/** Deduplica queries Prisma dentro do mesmo request React */
export const getActivePlan = cache(() => planRepository.findActive());

export const getCompletedWorkouts = cache(() =>
  workoutRepository.getCompletedWithExecutions()
);

export const getUserStats = cache(() => statsRepository.getUserStats());

export const getWeightRecords = cache(() => statsRepository.getWeightRecords());

export const getAchievements = cache(() => statsRepository.getAchievements());

export const getXpHistory = cache((limit = 10) =>
  statsRepository.getXpHistory(limit)
);

export const getCalendarWorkouts = cache((startIso: string, endIso: string) =>
  workoutRepository.findByDateRange(new Date(startIso), new Date(endIso))
);
