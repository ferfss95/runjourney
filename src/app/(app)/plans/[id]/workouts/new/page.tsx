import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/plans/${id}`);
}
