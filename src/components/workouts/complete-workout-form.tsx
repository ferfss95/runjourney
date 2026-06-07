"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { completeWorkoutAction } from "@/actions/workout.actions";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { calculatePace, formatDistance, formatPace } from "@/lib/utils";
import type { WorkoutType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

export function CompleteWorkoutForm({ workout }: CompleteWorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [distance, setDistance] = useState(String(workout.plannedDistance));
  const [time, setTime] = useState(
    workout.plannedTime ? String(workout.plannedTime) : ""
  );
  const [unlocked, setUnlocked] = useState<string[]>([]);

  const pace = useMemo(() => {
    const d = parseFloat(distance);
    const t = parseInt(time);
    if (!d || !t) return null;
    return calculatePace(d, t);
  }, [distance, time]);

  const adherence = useMemo(() => {
    const d = parseFloat(distance);
    if (!d || !workout.plannedDistance) return null;
    return Math.min(100, Math.round((d / workout.plannedDistance) * 100));
  }, [distance, workout.plannedDistance]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
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
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Treino planejado</p>
          <p className="font-semibold">{WORKOUT_TYPE_LABELS[workout.type]}</p>
          <p>
            {formatDistance(workout.plannedDistance)}
            {workout.plannedTime &&
              ` • ${Math.floor(workout.plannedTime / 60)}min`}
          </p>
        </CardContent>
      </Card>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actualDistance">Distância realizada (km)</Label>
            <Input
              id="actualDistance"
              name="actualDistance"
              type="number"
              step="0.1"
              min="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actualTime">Tempo realizado (segundos)</Label>
            <Input
              id="actualTime"
              name="actualTime"
              type="number"
              min="1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ex: 1800 = 30min"
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
                  <p className="text-xl font-bold text-accent">{adherence}%</p>
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
              type="number"
              step="0.1"
              placeholder="95"
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
