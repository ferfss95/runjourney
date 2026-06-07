import { notFound } from "next/navigation";
import Link from "next/link";
import { workoutRepository } from "@/repositories/workout.repository";
import { EditWorkoutForm } from "@/components/workouts/edit-workout-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await workoutRepository.findById(id);
  if (!workout) notFound();

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/plans/${workout.planId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Treino</h1>
      </div>
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
