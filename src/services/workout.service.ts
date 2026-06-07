import { calculatePace } from "@/lib/utils";
import { workoutRepository } from "@/repositories/workout.repository";
import { statsRepository } from "@/repositories/stats.repository";
import { gamificationService } from "./gamification.service";
import { statsService } from "./stats.service";
import { prisma } from "@/lib/db";
export const workoutService = {
  async completeWorkout(
    workoutId: string,
    data: {
      completedDate?: string;
      actualDistance: number;
      actualTime: number;
      weight?: number;
      heartRate?: number;
      notes?: string;
    }
  ) {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado");
    if (workout.status === "COMPLETED")
      throw new Error("Treino já foi concluído");

    const completedDate = data.completedDate
      ? new Date(data.completedDate + "T08:00:00")
      : new Date();

    const pace = calculatePace(data.actualDistance, data.actualTime);
    const distanceDiff = data.actualDistance - workout.plannedDistance;
    const timeDiff = data.actualTime - (workout.plannedTime ?? 0);
    const adherencePercent =
      workout.plannedDistance > 0
        ? Math.min(
            100,
            Math.round((data.actualDistance / workout.plannedDistance) * 100)
          )
        : 100;

    const xpEarned = gamificationService.getXpForWorkout(workout.type);

    const execution = await prisma.$transaction(async (tx) => {
      const exec = await tx.workoutExecution.create({
        data: {
          workoutId,
          actualDistance: data.actualDistance,
          actualTime: data.actualTime,
          pace,
          weight: data.weight,
          heartRate: data.heartRate,
          notes: data.notes,
          adherencePercent,
          distanceDiff,
          timeDiff,
          xpEarned,
        },
      });

      await tx.workout.update({
        where: { id: workoutId },
        data: { status: "COMPLETED", date: completedDate },
      });

      if (data.weight) {
        await tx.weightRecord.create({
          data: { weight: data.weight, date: completedDate },
        });
      }

      return exec;
    });

    await gamificationService.awardXp(
      workout.type,
      workoutId,
      `Treino: ${workout.type}`
    );

    await statsService.recalculateStats();

    const stats = await statsRepository.getUserStats();
    const hasLongRun = workout.type === "LONG_RUN";
    const unlocked = await gamificationService.checkAchievements({
      completedCount: stats?.completedCount ?? 1,
      totalDistance: stats?.totalDistance ?? data.actualDistance,
      longestRun: stats?.longestRun ?? data.actualDistance,
      lastRunDistance: data.actualDistance,
      hasLongRun,
    });

    return { execution, unlocked };
  },

  async rescheduleWorkout(workoutId: string, dateStr: string) {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado");
    if (workout.status === "COMPLETED")
      throw new Error("Treino já concluído não pode ser reagendado");

    const newDate = new Date(dateStr + "T08:00:00");

    await workoutRepository.update(workoutId, {
      date: newDate,
      status: "SCHEDULED",
    });

    await statsService.recalculateStats();
  },

  async markMissedWorkouts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await workoutRepository.markMissedBefore(today);
    await statsService.recalculateStats();
  },

  async getCalendarWorkouts(year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return workoutRepository.findByDateRange(start, end);
  },
};
