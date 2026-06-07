import { planRepository } from "@/repositories/plan.repository";
import { statsRepository } from "@/repositories/stats.repository";
import { workoutRepository } from "@/repositories/workout.repository";
import { differenceInCalendarDays, subDays } from "date-fns";

export const statsService = {
  async recalculateStats() {
    const completed = await workoutRepository.getCompletedWithExecutions();
    const allWorkouts = await prismaGetAllWorkouts();

    let totalDistance = 0;
    let totalPaceSum = 0;
    let bestPace = Infinity;
    let longestRun = 0;

    for (const w of completed) {
      if (!w.execution) continue;
      totalDistance += w.execution.actualDistance;
      totalPaceSum += w.execution.pace;
      if (w.execution.pace < bestPace) bestPace = w.execution.pace;
      if (w.execution.actualDistance > longestRun)
        longestRun = w.execution.actualDistance;
    }

    const completedCount = completed.length;
    const missedCount = allWorkouts.filter(
      (w) => w.status === "OVERDUE" || w.status === "MISSED"
    ).length;
    const avgPace = completedCount > 0 ? totalPaceSum / completedCount : null;

    const { currentStreak, bestStreak } = calculateStreaks(completed);

    const lastWorkout = completed[completed.length - 1];

    await statsRepository.ensureUserStats();
    await statsRepository.updateUserStats({
      totalDistance,
      totalWorkouts: allWorkouts.length,
      completedCount,
      missedCount,
      avgPace,
      bestPace: bestPace === Infinity ? null : bestPace,
      longestRun,
      currentStreak,
      bestStreak,
      lastWorkoutDate: lastWorkout?.date ?? null,
    });
  },

  async getDashboardStats() {
    const activePlan = await planRepository.findActive();
    const stats = await statsRepository.getUserStats();
    const todayWorkout = await workoutRepository.findTodayWorkout();
    const nextWorkout = await workoutRepository.findNextScheduled(
      activePlan?.id
    );

    let planProgress = {
      total: 0,
      completed: 0,
      percent: 0,
      longestInPlan: 0,
    };

    if (activePlan) {
      const total = activePlan.workouts.length;
      const completed = activePlan.workouts.filter(
        (w) => w.status === "COMPLETED"
      ).length;
      const longestInPlan = activePlan.workouts
        .filter((w) => w.execution)
        .reduce(
          (max, w) => Math.max(max, w.execution?.actualDistance ?? 0),
          0
        );
      planProgress = {
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        longestInPlan,
      };
    }

    return {
      activePlan,
      stats,
      todayWorkout,
      nextWorkout,
      planProgress,
    };
  },

  async getChartData() {
    const completed = await workoutRepository.getCompletedWithExecutions();
    const weights = await statsRepository.getWeightRecords();

    const weeklyDistance = aggregateByWeek(completed);
    const monthlyDistance = aggregateByMonth(completed);
    const paceEvolution = completed
      .filter((w) => w.execution)
      .map((w) => ({
        date: w.date.toISOString().split("T")[0],
        pace: w.execution!.pace,
        distance: w.execution!.actualDistance,
        type: w.type,
      }));

    const longRuns = completed
      .filter((w) => w.type === "LONG_RUN" && w.execution)
      .map((w) => ({
        date: w.date.toISOString().split("T")[0],
        distance: w.execution!.actualDistance,
        pace: w.execution!.pace,
      }));

    const weightEvolution = weights.map((w) => ({
      date: w.date.toISOString().split("T")[0],
      weight: w.weight,
    }));

    return { weeklyDistance, monthlyDistance, paceEvolution, longRuns, weightEvolution };
  },

  async generateInsights() {
    const completed = await workoutRepository.getCompletedWithExecutions();
    const activePlan = await planRepository.findActive();
    const stats = await statsRepository.getUserStats();
    const insights: string[] = [];

    if (completed.length === 0) {
      insights.push("Comece sua jornada! Seu primeiro treino está esperando.");
      return insights;
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const recent = completed.filter((w) => w.date >= thirtyDaysAgo);
    const previous = completed.filter(
      (w) => w.date >= sixtyDaysAgo && w.date < thirtyDaysAgo
    );

    if (recent.length > 0 && previous.length > 0) {
      const recentAvgPace =
        recent.reduce((s, w) => s + (w.execution?.pace ?? 0), 0) /
        recent.length;
      const prevAvgPace =
        previous.reduce((s, w) => s + (w.execution?.pace ?? 0), 0) /
        previous.length;
      if (prevAvgPace > 0) {
        const improvement = ((prevAvgPace - recentAvgPace) / prevAvgPace) * 100;
        if (improvement > 0) {
          insights.push(
            `Seu pace melhorou ${improvement.toFixed(0)}% nos últimos 30 dias.`
          );
        }
      }

      const recentDist = recent.reduce(
        (s, w) => s + (w.execution?.actualDistance ?? 0),
        0
      );
      const prevDist = previous.reduce(
        (s, w) => s + (w.execution?.actualDistance ?? 0),
        0
      );
      const diff = recentDist - prevDist;
      if (diff > 0) {
        insights.push(
          `Você correu ${diff.toFixed(0)}km a mais que no mês anterior.`
        );
      }
    }

    if (stats?.longestRun && stats.longestRun > 0) {
      insights.push(`Seu maior longão foi de ${stats.longestRun.toFixed(1)}km.`);
    }

    if (activePlan) {
      const remaining = activePlan.workouts.filter(
        (w) =>
          w.status === "SCHEDULED" ||
          w.status === "OVERDUE" ||
          w.status === "MISSED"
      ).length;
      if (remaining > 0) {
        insights.push(
          `Faltam apenas ${remaining} treinos para concluir seu plano.`
        );
      }
      const total = activePlan.workouts.length;
      const done = activePlan.workouts.filter(
        (w) => w.status === "COMPLETED"
      ).length;
      if (total > 0) {
        insights.push(
          `Você está a ${Math.round((done / total) * 100)}% do objetivo.`
        );
      }
    }

    if (stats?.currentStreak && stats.currentStreak >= 3) {
      insights.push(
        `🔥 Sequência de ${stats.currentStreak} dias! Continue assim!`
      );
    }

    return insights.slice(0, 5);
  },
};

async function prismaGetAllWorkouts() {
  const { prisma } = await import("@/lib/db");
  return prisma.workout.findMany();
}

function calculateStreaks(
  completed: { date: Date }[]
): { currentStreak: number; bestStreak: number } {
  if (completed.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const uniqueDays = [
    ...new Set(
      completed.map((w) => w.date.toISOString().split("T")[0])
    ),
  ].sort();

  let bestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = differenceInCalendarDays(
      new Date(uniqueDays[i]),
      new Date(uniqueDays[i - 1])
    );
    if (diff === 1) {
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = subDays(new Date(), 1).toISOString().split("T")[0];
  const lastDay = uniqueDays[uniqueDays.length - 1];

  let currentStreak = 0;
  if (lastDay === today || lastDay === yesterday) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
      const diff = differenceInCalendarDays(
        new Date(uniqueDays[i + 1]),
        new Date(uniqueDays[i])
      );
      if (diff === 1) currentStreak++;
      else break;
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

function aggregateByWeek(
  workouts: {
    date: Date;
    execution: { actualDistance: number } | null;
  }[]
) {
  const map = new Map<string, number>();
  for (const w of workouts) {
    if (!w.execution) continue;
    const d = new Date(w.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    map.set(key, (map.get(key) ?? 0) + w.execution.actualDistance);
  }
  return Array.from(map.entries())
    .map(([week, distance]) => ({ week, distance: Math.round(distance * 10) / 10 }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function aggregateByMonth(
  workouts: {
    date: Date;
    execution: { actualDistance: number } | null;
  }[]
) {
  const map = new Map<string, number>();
  for (const w of workouts) {
    if (!w.execution) continue;
    const key = w.date.toISOString().slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + w.execution.actualDistance);
  }
  return Array.from(map.entries())
    .map(([month, distance]) => ({ month, distance: Math.round(distance * 10) / 10 }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
