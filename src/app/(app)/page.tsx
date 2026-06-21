import { Suspense } from "react";
import { GoalCard } from "@/components/dashboard/goal-card";
import { NextWorkoutCard } from "@/components/dashboard/next-workout-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { StatsBySession } from "@/components/dashboard/stats-by-session";
import { XpCard } from "@/components/dashboard/xp-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { HeartRateCard } from "@/components/dashboard/heart-rate-card";
import { LazyDistanceChart } from "@/components/charts/lazy-distance-chart";
import { statsService } from "@/services/stats.service";

export const revalidate = 60;

async function DashboardContent() {
  const data = await statsService.getDashboardPageData();

  const {
    activePlan,
    stats,
    todayWorkout,
    nextWorkout,
    planProgress,
    chartData,
    sessionMetrics,
    overallMetrics,
    heartRateSummary,
    insights,
  } = data;

  const displayWorkout = todayWorkout ?? nextWorkout;

  return (
    <>
      {activePlan ? (
        <GoalCard
          planName={activePlan.name}
          goal={activePlan.goal}
          progress={planProgress.percent}
          completed={planProgress.completed}
          total={planProgress.total}
          longestRun={planProgress.longestInPlan}
          nextWorkout={
            nextWorkout
              ? {
                  date: nextWorkout.date,
                  plannedDistance: nextWorkout.plannedDistance,
                }
              : null
          }
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Plano não encontrado. Execute o seed do banco de dados.
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <NextWorkoutCard
          workout={
            displayWorkout
              ? {
                  id: displayWorkout.id,
                  date: displayWorkout.date,
                  type: displayWorkout.type,
                  plannedDistance: displayWorkout.plannedDistance,
                  plannedTime: displayWorkout.plannedTime,
                  notes: displayWorkout.notes,
                  status: displayWorkout.status,
                  execution: displayWorkout.execution
                    ? {
                        actualDistance: displayWorkout.execution.actualDistance,
                        actualTime: displayWorkout.execution.actualTime,
                        completedAt: displayWorkout.execution.completedAt,
                      }
                    : null,
                }
              : null
          }
        />
        <StreakCard
          currentStreak={stats?.currentStreak ?? 0}
          bestStreak={stats?.bestStreak ?? 0}
        />
        <XpCard
          totalXp={stats?.totalXp ?? 0}
          level={stats?.level ?? 1}
        />
      </div>

      <StatsBySession
        metrics={sessionMetrics}
        overallMetrics={overallMetrics}
      />

      <HeartRateCard
        summary={heartRateSummary}
        sessionMetrics={sessionMetrics}
      />

      <InsightsCard insights={insights} />

      <LazyDistanceChart
        weekly={chartData.weeklyDistance}
        monthly={chartData.monthlyDistance}
      />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-44 rounded-xl bg-card/50 animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe sua evolução e próximos treinos
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
