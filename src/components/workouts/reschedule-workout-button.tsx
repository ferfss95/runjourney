"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rescheduleWorkoutAction } from "@/actions/workout.actions";
import { CalendarClock } from "lucide-react";

interface RescheduleWorkoutButtonProps {
  workoutId: string;
  currentDate: Date;
  size?: "sm" | "default";
}

function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function RescheduleWorkoutButton({
  workoutId,
  currentDate,
  size = "sm",
}: RescheduleWorkoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(toInputDate(currentDate));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("date", date);
    const result = await rescheduleWorkoutAction(workoutId, formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    setOpen(false);
    router.refresh();
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant="outline">
          <CalendarClock className="h-4 w-4" />
          Alterar data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar data do treino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`date-${workoutId}`}>Nova data</Label>
            <Input
              id={`date-${workoutId}`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
