import { AppShell } from "@/components/layout/app-shell";
import { workoutService } from "@/services/workout.service";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await workoutService.markOverdueWorkouts();
  return <AppShell>{children}</AppShell>;
}
