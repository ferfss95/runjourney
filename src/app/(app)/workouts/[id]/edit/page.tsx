import { notFound, redirect } from "next/navigation";
import { workoutRepository } from "@/repositories/workout.repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await workoutRepository.findById(id);
  if (!workout) notFound();
  redirect(`/plans/${workout.planId}`);
}
