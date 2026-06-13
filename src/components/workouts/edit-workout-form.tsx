"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DurationInput } from "@/components/ui/duration-input";
import {
  updateCompletedWorkoutAction,
  uncompleteWorkoutAction,
} from "@/actions/workout.actions";
import { RescheduleWorkoutButton } from "@/components/workouts/reschedule-workout-button";
import { WorkoutSessionInfo } from "@/components/workouts/workout-session-info";
import { calculatePace, formatDistance, formatPace } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WorkoutType, WorkoutStatus } from "@prisma/client";

interface EditWorkoutFormProps {
  workout: {
    id: string;
    planId: string;
    type: WorkoutType;
    status: WorkoutStatus;
    plannedDistance: number;
    plannedTime: number | null;
    notes: string | null;
    date: Date;
    execution: {
      actualDistance: number;
      actualTime: number;
      weight: number | null;
      heartRate: number | null;
      notes: string | null;
    } | null;
  };
}

/** Converte string com vírgula ou ponto para número */
function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", "."));
}

function numToDistStr(n: number) {
  return String(n).replace(".", ",");
}

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
  const router = useRouter();
  const isCompleted = workout.status === "COMPLETED" && workout.execution;

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uncompleting, setUncompleting] = useState(false);

  const [completedDate, setCompletedDate] = useState(
    workout.date.toISOString().split("T")[0]
  );
  const [distanceStr, setDistanceStr] = useState(
    numToDistStr(workout.execution?.actualDistance ?? workout.plannedDistance)
  );
  const [timeSeconds, setTimeSeconds] = useState(
    workout.execution?.actualTime ?? workout.plannedTime ?? 0
  );
  const [weight, setWeight] = useState(
    workout.execution?.weight ? numToDistStr(workout.execution.weight) : ""
  );
  const [heartRate, setHeartRate] = useState(
    workout.execution?.heartRate ? String(workout.execution.heartRate) : ""
  );
  const [notes, setNotes] = useState(workout.execution?.notes ?? "");

  const distance = parseDecimal(distanceStr);

  const pace = useMemo(() => {
    if (!distance || !timeSeconds) return null;
    return calculatePace(distance, timeSeconds);
  }, [distance, timeSeconds]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isCompleted) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("workoutId", workout.id);
    formData.set("completedDate", completedDate);
    formData.set("actualDistance", String(distance));
    formData.set("actualTime", String(timeSeconds));
    const parsedWeight = parseDecimal(weight);
    if (weight && !isNaN(parsedWeight)) formData.set("weight", String(parsedWeight));
    if (heartRate) formData.set("heartRate", heartRate);
    formData.set("notes", notes);

    const result = await updateCompletedWorkoutAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(`/plans/${workout.planId}`);
    router.refresh();
    setPending(false);
  }

  async function handleUncomplete() {
    if (
      !confirm(
        "Marcar este treino como não concluído? Os dados registrados serão removidos."
      )
    )
      return;

    setUncompleting(true);
    setError(null);

    const result = await uncompleteWorkoutAction(workout.id);
    if (result?.error) {
      setError(result.error);
      setUncompleting(false);
      return;
    }

    router.push(`/plans/${workout.planId}`);
    router.refresh();
    setUncompleting(false);
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <WorkoutSessionInfo type={workout.type} notes={workout.notes} />
          <p className="text-sm">
            <span className="text-muted-foreground">Distância planejada: </span>
            {formatDistance(workout.plannedDistance)}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(workout.date), "EEEE, d 'de' MMMM yyyy", {
              locale: ptBR,
            })}
          </p>
        </CardContent>
      </Card>

      {isCompleted ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="completedDate">Data de realização</Label>
            <Input
              id="completedDate"
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actualDistance">Distância realizada (km)</Label>
              <Input
                id="actualDistance"
                type="text"
                inputMode="decimal"
                placeholder="3,01"
                value={distanceStr}
                onChange={(e) => setDistanceStr(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Ex: 3,01 ou 10,5</p>
            </div>
            <div className="space-y-2">
              <Label>Tempo realizado</Label>
              <DurationInput
                name="actualTime-display"
                defaultSeconds={
                  workout.execution?.actualTime ?? workout.plannedTime ?? 0
                }
                onChange={setTimeSeconds}
                required
              />
            </div>
          </div>

          {pace && (
            <Card className="glass-card">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Pace</p>
                <p className="text-xl font-bold text-primary">
                  {formatPace(pace)}/km
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso atual (kg)</Label>
              <Input
                id="weight"
                type="text"
                inputMode="decimal"
                placeholder="95,0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heartRate">Freq. cardíaca (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o treino?"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={uncompleting}
            onClick={handleUncomplete}
          >
            {uncompleting ? "Processando..." : "Marcar como não concluído"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Reagende o treino ou conclua-o quando realizar.
          </p>
          <div className="flex flex-wrap gap-2">
            <RescheduleWorkoutButton
              workoutId={workout.id}
              currentDate={workout.date}
              size="default"
            />
            <Link href={`/workouts/${workout.id}/complete`}>
              <Button>Concluir treino</Button>
            </Link>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
