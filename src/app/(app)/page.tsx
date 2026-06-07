import Link from "next/link";
import { GoalCard } from "@/components/dashboard/goal-card";
import { NextWorkoutCard } from "@/components/dashboard/next-workout-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { XpCard } from "@/components/dashboard/xp-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { DistanceChart } from "@/components/charts/distance-chart";
import { statsService } from "@/services/stats.service";
import { gamificationService } from "@/services/gamification.service";
import { workoutService } from "@/services/workout.service";

export default async function DashboardPage() {
  await workoutService.markMissedWorkouts();

  const [dashboard, chartData, insights, gamification] = await Promise.all([
    statsService.getDashboardStats(),
    statsService.getChartData(),
    statsService.generateInsights(),
    gamificationService.getGamificationData(),
  ]);

  const { activePlan, stats, todayWorkout, nextWorkout, planProgress } =
    dashboard;

  const displayWorkout = todayWorkout ?? nextWorkout;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe sua evolução e próximos treinos
        </p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                }
              : null
          }
        />
        <StreakCard
          currentStreak={stats?.currentStreak ?? 0}
          bestStreak={stats?.bestStreak ?? 0}
        />
        <XpCard
          totalXp={gamification.stats?.totalXp ?? 0}
          level={gamification.stats?.level ?? 1}
        />
      </div>

      <StatsGrid stats={stats} />

      <InsightsCard insights={insights} />

      <DistanceChart
        weekly={chartData.weeklyDistance}
        monthly={chartData.monthlyDistance}
      />
    </div>
  );
}
