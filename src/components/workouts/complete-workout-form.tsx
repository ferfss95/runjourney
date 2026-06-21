"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DurationInput } from "@/components/ui/duration-input";
import { completeWorkoutAction } from "@/actions/workout.actions";
import { WorkoutSessionInfo } from "@/components/workouts/workout-session-info";
import { calculatePace, formatDistance, formatPace } from "@/lib/utils";
import type { WorkoutType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Sparkles } from "lucide-react";

interface CompleteWorkoutFormProps {
  workout: {
    id: string;
    type: WorkoutType;
    plannedDistance: number;
    plannedTime: number | null;
    notes: string | null;
    date: Date;
  };
}

type UnlockedAchievement = {
  type: string;
  title: string;
  description: string;
  icon: string;
};

type CompletionResult = {
  xpEarned: number;
  unlocked: UnlockedAchievement[];
};

/** Converte string com vírgula ou ponto para número */
function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", "."));
}

function CompletionSuccess({
  result,
  distance,
  pace,
}: {
  result: CompletionResult;
  distance: number;
  pace: number | null;
}) {
  return (
    <Card className="glass-card border-primary/30">
      <CardContent className="p-6 sm:p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Treino concluído!</h2>
          <p className="text-muted-foreground">
            Parabéns — mais um passo rumo à sua meia maratona.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Distância</p>
            <p className="font-semibold">{formatDistance(distance)}</p>
          </div>
          {pace != null && (
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Pace</p>
              <p className="font-semibold">{formatPace(pace)}/km</p>
            </div>
          )}
          <div className="rounded-lg bg-muted/40 p-3 col-span-2">
            <p className="text-xs text-muted-foreground">XP ganho</p>
            <p className="font-semibold text-primary">+{result.xpEarned} XP</p>
          </div>
        </div>

        {result.unlocked.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Novas conquistas desbloqueadas
            </p>
            <div className="space-y-2">
              {result.unlocked.map((achievement) => (
                <div
                  key={achievement.type}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-left"
                >
                  <span className="text-2xl shrink-0">{achievement.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Redirecionando para o dashboard...
        </p>
      </CardContent>
    </Card>
  );
}

export function CompleteWorkoutForm({ workout }: CompleteWorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [distanceStr, setDistanceStr] = useState(
    String(workout.plannedDistance).replace(".", ",")
  );
  const [timeSeconds, setTimeSeconds] = useState(workout.plannedTime ?? 0);
  const [completionResult, setCompletionResult] =
    useState<CompletionResult | null>(null);
  const [completedDate, setCompletedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const distance = parseDecimal(distanceStr);

  const pace = useMemo(() => {
    if (!distance || !timeSeconds) return null;
    return calculatePace(distance, timeSeconds);
  }, [distance, timeSeconds]);

  const adherence = useMemo(() => {
    if (!distance || !workout.plannedDistance) return null;
    return Math.min(100, Math.round((distance / workout.plannedDistance) * 100));
  }, [distance, workout.plannedDistance]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("actualDistance", String(distance));
    formData.set("actualTime", String(timeSeconds));
    formData.set("workoutId", workout.id);

    const result = await completeWorkoutAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    setCompletionResult({
      xpEarned: result?.xpEarned ?? 0,
      unlocked: result?.unlocked ?? [],
    });
    setPending(false);
    setTimeout(() => router.push("/"), 3000);
  }

  if (completionResult) {
    return (
      <CompletionSuccess
        result={completionResult}
        distance={distance}
        pace={pace}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <WorkoutSessionInfo type={workout.type} notes={workout.notes} />
          <p className="text-sm">
            <span className="text-muted-foreground">Distância planejada: </span>
            {formatDistance(workout.plannedDistance)}
            {workout.plannedTime &&
              ` • ${Math.floor(workout.plannedTime / 60)} min`}
          </p>
          <p className="text-sm text-muted-foreground">
            Data planejada:{" "}
            {format(new Date(workout.date), "EEEE, d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="completedDate">Data de realização</Label>
          <Input
            id="completedDate"
            name="completedDate"
            type="date"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Informe o dia em que você realmente fez o treino
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actualDistance">Distância realizada (km)</Label>
            <Input
              id="actualDistance"
              name="actualDistance"
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
              name="actualTime"
              defaultSeconds={workout.plannedTime ?? 0}
              onChange={setTimeSeconds}
              required
            />
          </div>
        </div>

        {pace && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Pace calculado</p>
                <p className="text-xl font-bold text-primary">
                  {formatPace(pace)}/km
                </p>
              </CardContent>
            </Card>
            {adherence !== null && (
              <Card className="glass-card">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Aderência</p>
                  <p className="text-xl font-bold text-foreground">
                    {adherence}%
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso atual (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="text"
              inputMode="decimal"
              placeholder="95,0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heartRate">Freq. cardíaca (bpm)</Label>
            <Input
              id="heartRate"
              name="heartRate"
              type="number"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Como foi o treino?"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Salvando..." : "Concluir Treino"}
        </Button>
      </form>
    </div>
  );
}
