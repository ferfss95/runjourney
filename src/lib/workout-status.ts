import type { WorkoutStatus } from "@prisma/client";

export const WORKOUT_STATUS_LABELS: Record<WorkoutStatus, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  OVERDUE: "Atrasado",
  MISSED: "Atrasado",
};

export const PENDING_STATUSES: WorkoutStatus[] = [
  "SCHEDULED",
  "OVERDUE",
  "MISSED",
];

export function isPendingWorkout(status: WorkoutStatus): boolean {
  return PENDING_STATUSES.includes(status);
}
