import { AppShell } from "@/components/layout/app-shell";
import { workoutService } from "@/services/workout.service";
import { unstable_cache } from "next/cache";

// Executa markOverdue no máximo 1x a cada 10 minutos — evita bloquear cada request
const markOverdueCached = unstable_cache(
  () => workoutService.markOverdueWorkouts(),
  ["mark-overdue-workouts"],
  { revalidate: 600 }
);

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Não bloqueia o render — dispara em paralelo
  markOverdueCached().catch(console.error);

  return <AppShell>{children}</AppShell>;
}
