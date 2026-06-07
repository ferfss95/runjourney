import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatDuration } from "@/lib/utils";
import { WorkoutSessionInfo } from "@/components/workouts/workout-session-info";
import type { WorkoutStatus, WorkoutType } from "@prisma/client";
import { Calendar, CheckCircle2 } from "lucide-react";

interface NextWorkoutCardProps {
  workout: {
    id: string;
    date: Date;
    type: WorkoutType;
    plannedDistance: number;
    plannedTime: number | null;
    notes: string | null;
    status: WorkoutStatus;
    execution?: {
      actualDistance: number;
      actualTime: number;
    } | null;
  } | null;
}

export function NextWorkoutCard({ workout }: NextWorkoutCardProps) {
  if (!workout) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum treino agendado</p>
        </CardContent>
      </Card>
    );
  }

  const isToday =
    new Date(workout.date).toDateString() === new Date().toDateString();
  const isOverdue =
    workout.status === "OVERDUE" || workout.status === "MISSED";
  const isCompleted = workout.status === "COMPLETED";

  const displayDistance = isCompleted && workout.execution
    ? workout.execution.actualDistance
    : workout.plannedDistance;

  const displayTime = isCompleted && workout.execution
    ? workout.execution.actualTime
    : workout.plannedTime;

  const timeLabel = isCompleted ? "Tempo realizado" : "Tempo previsto";
  const distanceLabel = isCompleted ? "Distância real" : "Distância";
  return (
    <Card
      className={`glass-card ${
        isToday
          ? "ring-2 ring-primary/60"
          : isOverdue
            ? "ring-2 ring-primary/40"
            : ""
      }`}
    >
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">
            {isCompleted
              ? "Último Treino"
              : isOverdue
                ? "Treino Atrasado"
                : isToday
                  ? "Treino de Hoje"
                  : "Próximo Treino"}
          </CardTitle>
          {isCompleted ? (
            <Badge variant="success">Concluído</Badge>
          ) : isOverdue ? (
            <Badge variant="warning">Atrasado</Badge>
          ) : isToday ? (
            <Badge variant="warning">Hoje</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {format(new Date(workout.date), "EEEE, d 'de' MMMM", {
              locale: ptBR,
            })}
          </span>
        </div>

        <WorkoutSessionInfo type={workout.type} notes={workout.notes} />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-xs text-muted-foreground">{distanceLabel}</p>
            <p className="font-semibold text-sm text-primary">
              {formatDistance(displayDistance)}
            </p>
          </div>
          {displayTime != null && (
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-xs text-muted-foreground">{timeLabel}</p>
              <p className="font-semibold text-sm">
                {formatDuration(displayTime)}
              </p>
            </div>
          )}
        </div>

        {!isCompleted && (
          <Link href={`/workouts/${workout.id}/complete`}>
            <Button className="w-full mt-1" size="default">
              <CheckCircle2 className="h-4 w-4" />
              Concluir treino
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
