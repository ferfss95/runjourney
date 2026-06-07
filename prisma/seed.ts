import {
  PrismaClient,
  WorkoutStatus,
  AchievementType,
} from "@prisma/client";
import { ACHIEVEMENT_DEFINITIONS, WORKOUT_TYPE_XP } from "../src/lib/constants";
import {
  HALF_MARATHON_PLAN,
  generateHalfMarathonWorkouts,
} from "../src/lib/half-marathon-plan";
import { calculatePace, levelFromXp } from "../src/lib/utils";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
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

  const planStart = daysAgo(70);
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

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let totalXp = 0;
  let totalDistance = 0;
  let totalPaceSum = 0;
  let bestPace = Infinity;
  let longestRun = 0;
  let completedCount = 0;
  let missedCount = 0;
  let weight = 96.0;

  for (let i = 0; i < workouts.length; i++) {
    const { date, workout, plannedTime } = workouts[i];

    let status: WorkoutStatus = "SCHEDULED";
    if (date < today) {
      status = i % 11 === 0 ? "MISSED" : "COMPLETED";
    }

    const created = await prisma.workout.create({
      data: {
        planId: plan.id,
        date,
        type: workout.type,
        plannedDistance: workout.plannedDistance,
        plannedTime,
        notes: workout.notes,
        status,
      },
    });

    if (status === "COMPLETED") {
      const actualDistance = workout.plannedDistance;
      const actualTime = plannedTime;
      const pace = calculatePace(actualDistance, actualTime);
      const xp = WORKOUT_TYPE_XP[workout.type];

      await prisma.workoutExecution.create({
        data: {
          workoutId: created.id,
          actualDistance,
          actualTime,
          pace,
          weight,
          adherencePercent: 100,
          distanceDiff: 0,
          timeDiff: 0,
          xpEarned: xp,
        },
      });

      await prisma.weightRecord.create({
        data: { weight, date },
      });

      await prisma.xPHistory.create({
        data: {
          amount: xp,
          source: "workout",
          description: workout.notes,
          workoutId: created.id,
        },
      });

      totalXp += xp;
      totalDistance += actualDistance;
      totalPaceSum += pace;
      if (pace < bestPace) bestPace = pace;
      if (actualDistance > longestRun) longestRun = actualDistance;
      completedCount++;
      weight -= 0.1;
    } else if (status === "MISSED") {
      missedCount++;
    }
  }

  const achievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(
    ([type, def]) => ({
      type: type as AchievementType,
      ...def,
      unlockedAt: null as Date | null,
    })
  );

  const unlockTypes: AchievementType[] = [
    "FIRST_RUN",
    "FIVE_WORKOUTS",
    "TEN_WORKOUTS",
    "FIFTY_KM",
    "HUNDRED_KM",
    "FIRST_LONG_RUN",
    "FIRST_10K",
  ];

  for (const a of achievements) {
    await prisma.achievement.create({
      data: {
        ...a,
        unlockedAt: unlockTypes.includes(a.type) ? daysAgo(1) : null,
      },
    });
  }

  const completedDates = workouts
    .filter((_, i) => {
      const date = workouts[i].date;
      return date < today && i % 11 !== 0;
    })
    .map((w) => w.date);

  await prisma.userStats.create({
    data: {
      id: "singleton",
      totalXp,
      level: levelFromXp(totalXp),
      currentStreak: 3,
      bestStreak: 12,
      totalDistance,
      totalWorkouts: workouts.length,
      completedCount,
      missedCount,
      avgPace: completedCount > 0 ? totalPaceSum / completedCount : null,
      bestPace: bestPace === Infinity ? null : bestPace,
      longestRun,
      lastWorkoutDate: completedDates[completedDates.length - 1] ?? null,
    },
  });

  console.log("✅ Seed concluído!");
  console.log(`   Plano: ${plan.name}`);
  console.log(`   Semanas: 16 | Treinos: ${workouts.length}`);
  console.log(`   Concluídos: ${completedCount} | Perdidos: ${missedCount}`);
  console.log(`   Distância total: ${totalDistance.toFixed(1)}km`);
  console.log(`   XP: ${totalXp}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
