import {
  getWorkoutSessionKey,
  getSessionTitle,
  SESSION_ORDER,
  type WorkoutSessionKey,
} from "@/lib/workout-session";
import {
  getActivePlan,
  getCompletedWorkouts,
  getUserStats,
  getWeightRecords,
} from "@/lib/cached-data";
import { statsRepository } from "@/repositories/stats.repository";
import { workoutRepository } from "@/repositories/workout.repository";
import { startOfDay, subDays } from "date-fns";

export type SessionMetrics = {
  key: WorkoutSessionKey;
  title: string;
  totalDistance: number;
  avgPace: number | null;
  bestPace: number | null;
  avgHeartRate: number | null;
  lastHeartRate: number | null;
  completedCount: number;
  totalCount: number;
  overdueCount: number;
  longestDistance: number;
};

export type HeartRatePoint = {
  date: string;
  bpm: number;
  session: WorkoutSessionKey;
};

export type HeartRateSummary = {
  avgBpm: number | null;
  lastBpm: number | null;
  lastDate: string | null;
  minBpm: number | null;
  maxBpm: number | null;
  count: number;
};

type SessionDistancePoint = {
  week?: string;
  month?: string;
  A: number;
  B: number;
  C: number;
};

export type OverallMetrics = {
  title: string;
  totalDistance: number;
  avgPace: number | null;
  bestPace: number | null;
  avgHeartRate: number | null;
  lastHeartRate: number | null;
  completedCount: number;
  totalCount: number;
  overdueCount: number;
  longestDistance: number;
};

type PlanWorkout = Awaited<
  ReturnType<typeof getActivePlan>
> extends infer P
  ? P extends { workouts: (infer W)[] }
    ? W
    : never
  : never;

function computeWorkoutMetrics(
  planWorkouts: PlanWorkout[],
  title: string,
  key?: WorkoutSessionKey
): SessionMetrics | OverallMetrics {
  const completed = planWorkouts.filter(
    (w) => w.status === "COMPLETED" && w.execution
  );

  let totalDistance = 0;
  let paceDistSum = 0;
  let bestPace = Infinity;
  let longestDistance = 0;
  let heartRateSum = 0;
  let heartRateCount = 0;
  let lastHeartRate: number | null = null;
  let lastHeartRateDate: Date | null = null;

  for (const w of completed) {
    const ex = w.execution!;
    totalDistance += ex.actualDistance;
    paceDistSum += ex.pace * ex.actualDistance;
    if (ex.pace < bestPace) bestPace = ex.pace;
    if (ex.actualDistance > longestDistance) longestDistance = ex.actualDistance;
    if (ex.heartRate != null) {
      heartRateSum += ex.heartRate;
      heartRateCount++;
      const completedAt = ex.completedAt;
      if (!lastHeartRateDate || completedAt > lastHeartRateDate) {
        lastHeartRateDate = completedAt;
        lastHeartRate = ex.heartRate;
      }
    }
  }

  const base = {
    title,
    totalDistance,
    avgPace: totalDistance > 0 ? paceDistSum / totalDistance : null,
    bestPace: bestPace === Infinity ? null : bestPace,
    avgHeartRate:
      heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : null,
    lastHeartRate,
    completedCount: completed.length,
    totalCount: planWorkouts.length,
    overdueCount: planWorkouts.filter(
      (w) => w.status === "OVERDUE" || w.status === "MISSED"
    ).length,
    longestDistance,
  };

  if (key) return { key, ...base };
  return base;
}

type ActivePlan = Awaited<ReturnType<typeof getActivePlan>>;
type CompletedWorkout = Awaited<ReturnType<typeof getCompletedWorkouts>>[number];
type UserStats = Awaited<ReturnType<typeof getUserStats>>;

function deriveTodayWorkout(activePlan: ActivePlan) {
  if (!activePlan) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return (
    activePlan.workouts.find((w) => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    }) ?? null
  );
}

function deriveNextScheduled(activePlan: ActivePlan) {
  if (!activePlan) return null;
  const workouts = activePlan.workouts;
  const overdue = workouts
    .filter((w) => w.status === "OVERDUE" || w.status === "MISSED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (overdue.length > 0) return overdue[0];
  const scheduled = workouts
    .filter((w) => w.status === "SCHEDULED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return scheduled[0] ?? null;
}

function computePlanProgress(activePlan: ActivePlan) {
  if (!activePlan) {
    return { total: 0, completed: 0, percent: 0, longestInPlan: 0 };
  }
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
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    longestInPlan,
  };
}

function buildChartDataFromCompleted(
  completed: CompletedWorkout[],
  weights: Awaited<ReturnType<typeof getWeightRecords>>
) {
  const weeklyDistance = aggregateByWeekAndSession(completed);
  const monthlyDistance = aggregateByMonthAndSession(completed);
  const paceEvolution = completed
    .filter((w) => w.execution)
    .map((w) => ({
      date: getCompletionDate(w).toISOString().split("T")[0],
      pace: w.execution!.pace,
      distance: w.execution!.actualDistance,
      session: getWorkoutSessionKey(w.notes, w.type),
    }));

  const heartRateEvolution: HeartRatePoint[] = completed
    .filter((w) => w.execution?.heartRate != null)
    .map((w) => ({
      date: getCompletionDate(w).toISOString().split("T")[0],
      bpm: w.execution!.heartRate!,
      session: getWorkoutSessionKey(w.notes, w.type),
    }));

  const longRuns = completed
    .filter((w) => w.type === "LONG_RUN" && w.execution)
    .map((w) => ({
      date: getCompletionDate(w).toISOString().split("T")[0],
      distance: w.execution!.actualDistance,
      pace: w.execution!.pace,
    }));

  const weightEvolution = weights.map((w) => ({
    date: w.date.toISOString().split("T")[0],
    weight: w.weight,
  }));

  return {
    weeklyDistance,
    monthlyDistance,
    paceEvolution,
    heartRateEvolution,
    longRuns,
    weightEvolution,
  };
}

function buildHeartRateSummaryFromCompleted(
  completed: CompletedWorkout[]
): HeartRateSummary {
  const withBpm = completed.filter((w) => w.execution?.heartRate != null);

  if (withBpm.length === 0) {
    return {
      avgBpm: null,
      lastBpm: null,
      lastDate: null,
      minBpm: null,
      maxBpm: null,
      count: 0,
    };
  }

  const bpms = withBpm.map((w) => w.execution!.heartRate!);
  const last = [...withBpm].sort(
    (a, b) =>
      getCompletionDate(b).getTime() - getCompletionDate(a).getTime()
  )[0];

  return {
    avgBpm: Math.round(bpms.reduce((s, v) => s + v, 0) / bpms.length),
    lastBpm: last.execution!.heartRate,
    lastDate: getCompletionDate(last).toISOString().split("T")[0],
    minBpm: Math.min(...bpms),
    maxBpm: Math.max(...bpms),
    count: bpms.length,
  };
}

function buildInsightsFromData(
  completed: CompletedWorkout[],
  activePlan: ActivePlan,
  stats: UserStats
) {
  const insights: string[] = [];

  if (completed.length === 0) {
    insights.push("Comece sua jornada! Seu primeiro treino está esperando.");
    return insights;
  }

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  const recent = completed.filter(
    (w) => getCompletionDate(w) >= thirtyDaysAgo
  );
  const previous = completed.filter((w) => {
    const completedAt = getCompletionDate(w);
    return completedAt >= sixtyDaysAgo && completedAt < thirtyDaysAgo;
  });

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
      `🔥 ${stats.currentStreak} treinos seguidos no prazo! Continue assim!`
    );
  }

  return insights.slice(0, 5);
}

export const statsService = {
  /** Uma única rodada de queries para todo o dashboard */
  async getDashboardPageData() {
    const [activePlan, stats, completed, weights] = await Promise.all([
      getActivePlan(),
      getUserStats(),
      getCompletedWorkouts(),
      getWeightRecords(),
    ]);

    const todayWorkout = deriveTodayWorkout(activePlan);
    const nextWorkout = deriveNextScheduled(activePlan);
    const planProgress = computePlanProgress(activePlan);
    const planWorkouts = activePlan?.workouts ?? [];

    const sessionMetrics = SESSION_ORDER.map((key) => {
      const ofSession = planWorkouts.filter(
        (w) => getWorkoutSessionKey(w.notes, w.type) === key
      );
      return computeWorkoutMetrics(
        ofSession,
        getSessionTitle(key),
        key
      ) as SessionMetrics;
    });

    const overallMetrics = computeWorkoutMetrics(
      planWorkouts,
      "Todos os treinos — A, B e C"
    ) as OverallMetrics;

    return {
      activePlan,
      stats,
      todayWorkout,
      nextWorkout,
      planProgress,
      chartData: buildChartDataFromCompleted(completed, weights),
      sessionMetrics,
      overallMetrics,
      heartRateSummary: buildHeartRateSummaryFromCompleted(completed),
      insights: buildInsightsFromData(completed, activePlan, stats),
    };
  },

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

    const { currentStreak, bestStreak } = calculateConsistency(completed);

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
      lastWorkoutDate: lastWorkout
        ? getCompletionDate(lastWorkout)
        : null,
    });
  },

  async getDashboardStats() {
    const activePlan = await getActivePlan();
    const stats = await getUserStats();
    const todayWorkout = deriveTodayWorkout(activePlan);
    const nextWorkout = deriveNextScheduled(activePlan);
    const planProgress = computePlanProgress(activePlan);

    return {
      activePlan,
      stats,
      todayWorkout,
      nextWorkout,
      planProgress,
    };
  },

  async getMetricsBySession(): Promise<SessionMetrics[]> {
    const activePlan = await getActivePlan();
    const planWorkouts = activePlan?.workouts ?? [];

    return SESSION_ORDER.map((key) => {
      const ofSession = planWorkouts.filter(
        (w) => getWorkoutSessionKey(w.notes, w.type) === key
      );
      return computeWorkoutMetrics(
        ofSession,
        getSessionTitle(key),
        key
      ) as SessionMetrics;
    });
  },

  async getOverallMetrics(): Promise<OverallMetrics> {
    const activePlan = await getActivePlan();
    const planWorkouts = activePlan?.workouts ?? [];
    return computeWorkoutMetrics(
      planWorkouts,
      "Todos os treinos — A, B e C"
    ) as OverallMetrics;
  },

  async getHeartRateSummary(): Promise<HeartRateSummary> {
    const completed = await getCompletedWorkouts();
    return buildHeartRateSummaryFromCompleted(completed);
  },

  async getChartData() {
    const [completed, weights] = await Promise.all([
      getCompletedWorkouts(),
      getWeightRecords(),
    ]);
    return buildChartDataFromCompleted(completed, weights);
  },

  async generateInsights() {
    const [completed, activePlan, stats] = await Promise.all([
      getCompletedWorkouts(),
      getActivePlan(),
      getUserStats(),
    ]);
    return buildInsightsFromData(completed, activePlan, stats);
  },
};

async function prismaGetAllWorkouts() {
  const { prisma } = await import("@/lib/db");
  return prisma.workout.findMany();
}

function getScheduledDate(workout: {
  date: Date;
  execution: { scheduledDate: Date | null; completedAt: Date } | null;
}): Date {
  return workout.execution?.scheduledDate ?? workout.date;
}

function getCompletionDate(workout: {
  date: Date;
  execution: { completedAt: Date } | null;
}): Date {
  return workout.execution?.completedAt ?? workout.date;
}

/** Treino no prazo = realizado no dia planejado ou antes */
function isWorkoutOnTime(workout: {
  date: Date;
  execution: { scheduledDate: Date | null; completedAt: Date } | null;
}): boolean {
  if (!workout.execution) return false;
  const planned = startOfDay(getScheduledDate(workout));
  const completed = startOfDay(workout.execution.completedAt);
  return completed <= planned;
}

function calculateConsistency(
  completed: {
    date: Date;
    execution: {
      scheduledDate: Date | null;
      completedAt: Date;
    } | null;
  }[]
): { currentStreak: number; bestStreak: number } {
  const sorted = completed
    .filter((w) => w.execution)
    .sort(
      (a, b) =>
        getScheduledDate(a).getTime() - getScheduledDate(b).getTime()
    );

  if (sorted.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const onTime = sorted.map((w) => isWorkoutOnTime(w));

  let bestStreak = 0;
  let run = 0;
  for (const ok of onTime) {
    if (ok) {
      run++;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 0;
    }
  }

  let currentStreak = 0;
  for (let i = onTime.length - 1; i >= 0; i--) {
    if (onTime[i]) currentStreak++;
    else break;
  }

  return { currentStreak, bestStreak };
}

function emptySessionDistances(): Record<WorkoutSessionKey, number> {
  return { A: 0, B: 0, C: 0 };
}

function roundKm(value: number) {
  return Math.round(value * 10) / 10;
}

function aggregateByWeekAndSession(
  workouts: {
    date: Date;
    type: import("@prisma/client").WorkoutType;
    notes: string | null;
    execution: { actualDistance: number; completedAt: Date } | null;
  }[]
): (SessionDistancePoint & { week: string })[] {
  const map = new Map<string, Record<WorkoutSessionKey, number>>();

  for (const w of workouts) {
    if (!w.execution) continue;
    const d = getCompletionDate(w);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    const sessionKey = getWorkoutSessionKey(w.notes, w.type);
    const entry = map.get(key) ?? emptySessionDistances();
    entry[sessionKey] += w.execution.actualDistance;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([week, dist]) => ({
      week,
      A: roundKm(dist.A),
      B: roundKm(dist.B),
      C: roundKm(dist.C),
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function aggregateByMonthAndSession(
  workouts: {
    date: Date;
    type: import("@prisma/client").WorkoutType;
    notes: string | null;
    execution: { actualDistance: number; completedAt: Date } | null;
  }[]
): (SessionDistancePoint & { month: string })[] {
  const map = new Map<string, Record<WorkoutSessionKey, number>>();

  for (const w of workouts) {
    if (!w.execution) continue;
    const key = getCompletionDate(w).toISOString().slice(0, 7);
    const sessionKey = getWorkoutSessionKey(w.notes, w.type);
    const entry = map.get(key) ?? emptySessionDistances();
    entry[sessionKey] += w.execution.actualDistance;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .map(([month, dist]) => ({
      month,
      A: roundKm(dist.A),
      B: roundKm(dist.B),
      C: roundKm(dist.C),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
