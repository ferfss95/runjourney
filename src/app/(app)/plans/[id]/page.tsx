import { notFound } from "next/navigation";
import Link from "next/link";
import { planRepository } from "@/repositories/plan.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { RescheduleWorkoutButton } from "@/components/workouts/reschedule-workout-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <Badge variant="success">Ativo</Badge>
          </div>
          <p className="text-muted-foreground">{plan.goal}</p>
        </div>
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
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {format(workout.date, "EEE, d MMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {workout.notes}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {WORKOUT_TYPE_LABELS[workout.type]} •{" "}
                        {formatDistance(workout.plannedDistance)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          workout.status === "COMPLETED"
                            ? "success"
                            : workout.status === "MISSED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {workout.status === "COMPLETED"
                          ? "Concluído"
                          : workout.status === "MISSED"
                            ? "Perdido"
                            : "Agendado"}
                      </Badge>
                      {workout.status !== "COMPLETED" && (
                        <>
                          <RescheduleWorkoutButton
                            workoutId={workout.id}
                            currentDate={workout.date}
                          />
                          <Link href={`/workouts/${workout.id}/complete`}>
                            <Button size="sm">Concluir</Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
