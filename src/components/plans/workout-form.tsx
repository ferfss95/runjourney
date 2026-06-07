"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import {
  createWorkoutAction,
  updateWorkoutAction,
} from "@/actions/workout.actions";
import type { WorkoutType } from "@prisma/client";

interface WorkoutFormProps {
  planId: string;
  workout?: {
    id: string;
    date: Date;
    type: WorkoutType;
    plannedDistance: number;
    plannedTime: number | null;
    notes: string | null;
  };
}

export function WorkoutForm({ planId, workout }: WorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<WorkoutType>(workout?.type ?? "EASY_RUN");
  const isEdit = !!workout;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("type", type);
    if (!isEdit) formData.set("planId", planId);

    const result = isEdit
      ? await updateWorkoutAction(workout.id, formData)
      : await createWorkoutAction(formData);

    if (result?.error) setError(result.error);
    else {
      router.push(`/plans/${planId}`);
      router.refresh();
    }
    setPending(false);
  }

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={workout ? formatDate(workout.date) : undefined}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as WorkoutType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WORKOUT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plannedDistance">Distância (km)</Label>
          <Input
            id="plannedDistance"
            name="plannedDistance"
            type="number"
            step="0.1"
            min="0.1"
            defaultValue={workout?.plannedDistance}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plannedTime">Tempo previsto (seg)</Label>
          <Input
            id="plannedTime"
            name="plannedTime"
            type="number"
            min="0"
            defaultValue={workout?.plannedTime ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={workout?.notes ?? ""}
          placeholder="Aquecimento, ritmo alvo..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Salvando..."
          : isEdit
            ? "Atualizar Treino"
            : "Adicionar Treino"}
      </Button>
    </form>
  );
}
