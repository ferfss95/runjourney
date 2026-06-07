import { notFound } from "next/navigation";
import Link from "next/link";
import { workoutRepository } from "@/repositories/workout.repository";
import { CompleteWorkoutForm } from "@/components/workouts/complete-workout-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompleteWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await workoutRepository.findById(id);
  if (!workout) notFound();
  if (workout.status === "COMPLETED") notFound();

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Concluir Treino</h1>
      </div>
      <CompleteWorkoutForm workout={workout} />
    </div>
  );
}
