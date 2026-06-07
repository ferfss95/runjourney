import { prisma } from "@/lib/db";
import type { Prisma, WorkoutStatus, WorkoutType } from "@prisma/client";

export const workoutRepository = {
  findById(id: string) {
    return prisma.workout.findUnique({
      where: { id },
      include: { execution: true, plan: true },
    });
  },

  findByPlan(planId: string) {
    return prisma.workout.findMany({
      where: { planId },
      orderBy: { date: "asc" },
      include: { execution: true },
    });
  },

  findByDateRange(start: Date, end: Date) {
    return prisma.workout.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
      include: { execution: true, plan: true },
    });
  },

  findNextScheduled(planId?: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return prisma.workout.findFirst({
      where: {
        status: "SCHEDULED",
        date: { gte: new Date() },
        ...(planId ? { planId } : {}),
      },
      orderBy: { date: "asc" },
      include: { plan: true },
    });
  },

  findTodayWorkout() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return prisma.workout.findFirst({
      where: { date: { gte: start, lte: end } },
      include: { execution: true, plan: true },
    });
  },

  create(data: Prisma.WorkoutCreateInput) {
    return prisma.workout.create({ data });
  },

  update(id: string, data: Prisma.WorkoutUpdateInput) {
    return prisma.workout.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.workout.delete({ where: { id } });
  },

  markMissedBefore(date: Date) {
    return prisma.workout.updateMany({
      where: {
        status: "SCHEDULED",
        date: { lt: date },
      },
      data: { status: "MISSED" },
    });
  },

  getCompletedWithExecutions() {
    return prisma.workout.findMany({
      where: { status: "COMPLETED" },
      include: { execution: true, plan: true },
      orderBy: { date: "asc" },
    });
  },

  bulkCreate(
    workouts: {
      planId: string;
      date: Date;
      type: WorkoutType;
      plannedDistance: number;
      plannedTime?: number;
      notes?: string;
      status?: WorkoutStatus;
    }[]
  ) {
    return prisma.workout.createMany({ data: workouts });
  },
};
