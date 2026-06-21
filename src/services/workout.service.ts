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

    const scheduledDate = workout.date;

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
          scheduledDate,
          completedAt: completedDate,
        },
      });

      await tx.workout.update({
        where: { id: workoutId },
        data: { status: "COMPLETED" },
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

    const newDate = new Date(dateStr + "T08:00:00");

    await workoutRepository.update(workoutId, {
      date: newDate,
      ...(workout.status !== "COMPLETED" ? { status: "SCHEDULED" as const } : {}),
    });

    await statsService.recalculateStats();
  },

  async updateCompletedWorkout(
    workoutId: string,
    data: {
      completedDate: string;
      actualDistance: number;
      actualTime: number;
      weight?: number;
      heartRate?: number;
      notes?: string;
    }
  ) {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado");
    if (workout.status !== "COMPLETED" || !workout.execution)
      throw new Error("Treino não está concluído");

    const completedDate = new Date(data.completedDate + "T08:00:00");
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

    await prisma.$transaction([
      prisma.workoutExecution.update({
        where: { workoutId },
        data: {
          actualDistance: data.actualDistance,
          actualTime: data.actualTime,
          pace,
          weight: data.weight,
          heartRate: data.heartRate,
          notes: data.notes,
          adherencePercent,
          distanceDiff,
          timeDiff,
          completedAt: completedDate,
        },
      }),
    ]);

    await statsService.recalculateStats();
    await gamificationService.syncAchievements();
  },

  async uncompleteWorkout(workoutId: string) {
    const workout = await workoutRepository.findById(workoutId);
    if (!workout) throw new Error("Treino não encontrado");
    if (workout.status !== "COMPLETED")
      throw new Error("Treino não está concluído");

    await prisma.$transaction([
      prisma.workoutExecution.delete({ where: { workoutId } }),
      prisma.workout.update({
        where: { id: workoutId },
        data: { status: "SCHEDULED" },
      }),
    ]);

    await gamificationService.revokeXpForWorkout(workoutId);
    await statsService.recalculateStats();
    await gamificationService.syncAchievements();
  },

  async markOverdueWorkouts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await workoutRepository.markOverdueBefore(today);
    await workoutRepository.migrateMissedToOverdue();
    await statsService.recalculateStats();
  },

  async getCalendarWorkouts(year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return workoutRepository.findByDateRange(start, end);
  },
};
