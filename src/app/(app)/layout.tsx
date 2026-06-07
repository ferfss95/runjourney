import { AppShell } from "@/components/layout/app-shell";
import { workoutService } from "@/services/workout.service";
import { unstable_cache } from "next/cache";
import { after } from "next/server";

// Executa markOverdue no máximo 1x a cada 10 minutos
const markOverdueCached = unstable_cache(
  () => workoutService.markOverdueWorkouts(),
  ["mark-overdue-workouts"],
  { revalidate: 600 }
);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // after() roda DEPOIS que a resposta já foi enviada ao cliente
  // Zero impacto na latência percebida pelo usuário
  after(() => {
    markOverdueCached().catch(console.error);
  });

  return <AppShell>{children}</AppShell>;
}
