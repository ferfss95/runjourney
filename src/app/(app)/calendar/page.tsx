import { WorkoutCalendar } from "@/components/calendar/workout-calendar";
import { workoutRepository } from "@/repositories/workout.repository";

export default async function CalendarPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const workouts = await workoutRepository.findByDateRange(start, end);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-muted-foreground text-sm">
          Visualize e gerencie seus treinos
        </p>
      </div>
      <WorkoutCalendar workouts={workouts} />
    </div>
  );
}
