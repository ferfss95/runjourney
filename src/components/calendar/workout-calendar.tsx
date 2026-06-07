"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKOUT_TYPE_LABELS } from "@/lib/constants";
import { formatDistance } from "@/lib/utils";
import Link from "next/link";
import type { WorkoutStatus, WorkoutType } from "@prisma/client";
import { RescheduleWorkoutButton } from "@/components/workouts/reschedule-workout-button";

interface CalendarWorkout {
  id: string;
  date: Date;
  type: WorkoutType;
  plannedDistance: number;
  status: WorkoutStatus;
  notes: string | null;
}

interface WorkoutCalendarProps {
  workouts: CalendarWorkout[];
  initialMonth?: Date;
}

function getDayColor(
  workout: CalendarWorkout | undefined,
  isToday: boolean
): string {
  if (!workout) return "bg-muted/30";
  if (isToday && workout.status === "SCHEDULED")
    return "bg-primary/30 ring-2 ring-primary";
  switch (workout.status) {
    case "COMPLETED":
      return "bg-primary/25";
    case "MISSED":
      return "bg-destructive/25";
    case "SCHEDULED":
      return "bg-muted/60";
    default:
      return "bg-muted/30";
  }
}

export function WorkoutCalendar({
  workouts,
  initialMonth = new Date(),
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const getWorkoutForDay = (day: Date) =>
    workouts.find((w) => isSameDay(new Date(w.date), day));

  const selectedWorkout = selectedDay
    ? getWorkoutForDay(selectedDay)
    : undefined;

  const today = new Date();

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div
                key={d}
                className="text-center text-xs text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const workout = getWorkoutForDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <motion.button
                  key={day.toISOString()}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                    transition-all ${getDayColor(workout, isToday)}
                    ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}
                    ${isSelected ? "ring-2 ring-primary" : ""}
                    hover:opacity-80
                  `}
                >
                  <span
                    className={
                      isToday ? "font-bold text-primary" : "text-foreground"
                    }
                  >
                    {format(day, "d")}
                  </span>
                  {workout && (
                    <span className="text-[10px] text-muted-foreground">
                      {workout.plannedDistance}k
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary/30" /> Concluído
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-destructive/30" /> Perdido
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary/30 ring-1 ring-primary" />{" "}
              Hoje
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-muted/50" /> Futuro
            </span>
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="font-semibold mb-2">
                {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              {selectedWorkout ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo: </span>
                      {WORKOUT_TYPE_LABELS[selectedWorkout.type]}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distância: </span>
                      {formatDistance(selectedWorkout.plannedDistance)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      {selectedWorkout.status === "COMPLETED"
                        ? "Concluído"
                        : selectedWorkout.status === "MISSED"
                          ? "Perdido"
                          : "Agendado"}
                    </div>
                  </div>
                  {selectedWorkout.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {selectedWorkout.notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkout.status !== "COMPLETED" && (
                      <>
                        <RescheduleWorkoutButton
                          workoutId={selectedWorkout.id}
                          currentDate={selectedWorkout.date}
                        />
                        <Link href={`/workouts/${selectedWorkout.id}/complete`}>
                          <Button size="sm">Concluir</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum treino neste dia
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
