import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { formatDistance, formatDuration } from "@/lib/utils";
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
            {isOverdue
              ? "Treino Atrasado"
              : isToday
                ? "Treino de Hoje"
                : "Próximo Treino"}
          </CardTitle>
          {isOverdue ? (
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

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="font-semibold text-sm">{WORKOUT_TYPE_LABELS[workout.type]}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-xs text-muted-foreground">Distância</p>
            <p className="font-semibold text-sm text-primary">
              {formatDistance(workout.plannedDistance)}
            </p>
          </div>
          {workout.plannedTime && (
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-xs text-muted-foreground">Tempo previsto</p>
              <p className="font-semibold text-sm">
                {formatDuration(workout.plannedTime)}
              </p>
            </div>
          )}
        </div>

        {workout.notes && (
          <p className="text-sm text-muted-foreground italic line-clamp-2">
            {workout.notes}
          </p>
        )}

        {workout.status !== "COMPLETED" && (
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
