"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DurationInput } from "@/components/ui/duration-input";
import { completeWorkoutAction } from "@/actions/workout.actions";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { calculatePace, formatDistance, formatPace } from "@/lib/utils";
import type { WorkoutType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

/** Converte string com vírgula ou ponto para número */
function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", "."));
}

export function CompleteWorkoutForm({ workout }: CompleteWorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [distanceStr, setDistanceStr] = useState(
    String(workout.plannedDistance).replace(".", ",")
  );
  const [timeSeconds, setTimeSeconds] = useState(workout.plannedTime ?? 0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
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

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    // Normaliza distância (troca vírgula por ponto para o servidor)
    formData.set("actualDistance", String(distance));
    formData.set("workoutId", workout.id);

    const result = await completeWorkoutAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    if (result?.unlocked?.length) {
      setUnlocked(result.unlocked);
      setTimeout(() => router.push("/"), 2500);
    } else {
      router.push("/");
    }
    setPending(false);
  }

  if (unlocked.length > 0) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-2xl font-bold mb-4">🎉 Treino Concluído!</p>
        <p className="text-muted-foreground mb-4">Novas conquistas:</p>
        {unlocked.map((a) => (
          <p key={a} className="text-lg text-primary">
            {a}
          </p>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Treino planejado</p>
          <p className="font-semibold">{WORKOUT_TYPE_LABELS[workout.type]}</p>
          <p>
            {formatDistance(workout.plannedDistance)}
            {workout.plannedTime &&
              ` • ${Math.floor(workout.plannedTime / 60)}min`}
          </p>
          <p className="text-sm text-muted-foreground">
            Data planejada:{" "}
            {format(new Date(workout.date), "EEEE, d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </CardContent>
      </Card>

      <form action={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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
