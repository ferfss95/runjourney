import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { planRepository } from "@/repositories/plan.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORKOUT_STATUS_LABELS } from "@/lib/workout-status";
import { WorkoutSessionInfo } from "@/components/workouts/workout-session-info";
import { formatDistance } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { RescheduleWorkoutButton } from "@/components/workouts/reschedule-workout-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function PlanContent({ id }: { id: string }) {
  const plan = await planRepository.findById(id);
  if (!plan) notFound();

  const completed = plan.workouts.filter((w) => w.status === "COMPLETED").length;

  const workoutsByWeek = plan.workouts.reduce(
    (acc, workout) => {
      const weekMatch = workout.notes?.match(/Semana (\d+)/);
      const week = weekMatch ? parseInt(weekMatch[1], 10) : 0;
      if (!acc[week]) acc[week] = [];
      acc[week].push(workout);
      return acc;
    },
    {} as Record<number, typeof plan.workouts>
  );

  const weeks = Object.keys(workoutsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{plan.name}</h1>
        <Badge variant="success">Ativo</Badge>
      </div>
      {plan.description && (
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">16</p>
            <p className="text-xs text-muted-foreground">Semanas</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">48</p>
            <p className="text-xs text-muted-foreground">Treinos</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {completed}/{plan.workouts.length}
            </p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {weeks.map((week) => (
          <div key={week}>
            <h2 className="text-lg font-semibold mb-3 text-primary">
              Semana {week}
            </h2>
            <div className="space-y-2">
              {workoutsByWeek[week].map((workout) => (
                <Card key={workout.id} className="glass-card">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="font-medium text-sm sm:text-base">
                          {format(workout.date, "EEE, d MMM", { locale: ptBR })}{" "}
                          • {formatDistance(workout.plannedDistance)}
                        </p>
                        <WorkoutSessionInfo
                          type={workout.type}
                          notes={workout.notes}
                          compact
                        />
                      </div>
                      <Badge
                        variant={
                          workout.status === "COMPLETED"
                            ? "success"
                            : workout.status === "OVERDUE" ||
                                workout.status === "MISSED"
                              ? "warning"
                              : "secondary"
                        }
                        className="shrink-0"
                      >
                        {WORKOUT_STATUS_LABELS[workout.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <RescheduleWorkoutButton
                        workoutId={workout.id}
                        currentDate={workout.date}
                      />
                      <Link href={`/workouts/${workout.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </Link>
                      {workout.status !== "COMPLETED" && (
                        <Link href={`/workouts/${workout.id}/complete`}>
                          <Button size="sm">Concluir</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-card/70" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 w-24 rounded bg-card/70" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="h-20 rounded-xl bg-card/70" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="space-y-6">
                <PlanSkeleton />
              </div>
            }
          >
            <PlanContent id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
