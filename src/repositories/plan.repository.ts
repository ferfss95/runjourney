import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const planRepository = {
  findAll() {
    return prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { workouts: true } },
        workouts: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        workouts: { orderBy: { date: "asc" } },
      },
    });
  },

  findActive() {
    return prisma.trainingPlan.findFirst({
      where: { isActive: true },
      include: {
        workouts: {
          orderBy: { date: "asc" },
          include: { execution: true },
        },
      },
    });
  },

  create(data: Prisma.TrainingPlanCreateInput) {
    return prisma.trainingPlan.create({ data });
  },

  update(id: string, data: Prisma.TrainingPlanUpdateInput) {
    return prisma.trainingPlan.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.trainingPlan.delete({ where: { id } });
  },

  async setActive(id: string) {
    await prisma.$transaction([
      prisma.trainingPlan.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.trainingPlan.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);
  },
};
