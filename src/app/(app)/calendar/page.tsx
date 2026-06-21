import { Suspense } from "react";
import { WorkoutCalendar } from "@/components/calendar/workout-calendar";
import { getCalendarWorkouts } from "@/lib/cached-data";

export const revalidate = 60;

async function CalendarContent() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const workouts = await getCalendarWorkouts(
    start.toISOString(),
    end.toISOString()
  );

  return <WorkoutCalendar workouts={workouts} />;
}

function CalendarSkeleton() {
  return <div className="h-[480px] rounded-xl bg-card/50 animate-pulse" />;
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-muted-foreground text-sm">
          Visualize e gerencie seus treinos
        </p>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent />
      </Suspense>
    </div>
  );
}
