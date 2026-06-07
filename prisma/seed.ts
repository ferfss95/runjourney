import { PrismaClient, AchievementType } from "@prisma/client";
import { ACHIEVEMENT_DEFINITIONS } from "../src/lib/constants";
import {
  HALF_MARATHON_PLAN,
  generateHalfMarathonWorkouts,
} from "../src/lib/half-marathon-plan";

const prisma = new PrismaClient();

function getNextMonday(): Date {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

async function main() {
  console.log("🌱 Seeding RunJourney...");

  await prisma.workoutExecution.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.trainingPlan.deleteMany();
  await prisma.weightRecord.deleteMany();
  await prisma.xPHistory.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userStats.deleteMany();

  const planStart = getNextMonday();
  const workouts = generateHalfMarathonWorkouts(planStart);
  const planEnd = workouts[workouts.length - 1].date;

  const plan = await prisma.trainingPlan.create({
    data: {
      name: HALF_MARATHON_PLAN.name,
      goal: HALF_MARATHON_PLAN.goal,
      description: HALF_MARATHON_PLAN.description,
      startDate: planStart,
      endDate: planEnd,
      isActive: true,
    },
  });

  for (const { date, workout, plannedTime } of workouts) {
    await prisma.workout.create({
      data: {
        planId: plan.id,
        date,
        type: workout.type,
        plannedDistance: workout.plannedDistance,
        plannedTime,
        notes: workout.notes,
        status: "SCHEDULED",
      },
    });
  }

  for (const [type, def] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    await prisma.achievement.create({
      data: {
        type: type as AchievementType,
        ...def,
        unlockedAt: null,
      },
    });
  }

  await prisma.userStats.create({
    data: {
      id: "singleton",
      totalWorkouts: workouts.length,
    },
  });

  console.log("✅ Seed concluído!");
  console.log(`   Plano: ${plan.name}`);
  console.log(`   Início: ${planStart.toLocaleDateString("pt-BR")}`);
  console.log(`   Semanas: 16 | Treinos: ${workouts.length} (todos agendados)`);
  console.log(`   Sem dados de demonstração — comece do zero!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
