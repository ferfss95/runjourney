"use server";

import { workoutRepository } from "@/repositories/workout.repository";
import { workoutService } from "@/services/workout.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { WorkoutType } from "@prisma/client";

const workoutSchema = z.object({
  planId: z.string(),
  date: z.string(),
  type: z.enum(["EASY_RUN", "INTERVAL", "LONG_RUN", "SPRINTS", "RECOVERY"]),
  plannedDistance: z.coerce.number().positive(),
  plannedTime: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const completeSchema = z.object({
  workoutId: z.string(),
  actualDistance: z.coerce.number().positive(),
  actualTime: z.coerce.number().positive(),
  weight: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export async function createWorkoutAction(_formData: FormData) {
  return { error: "Treinos são definidos pelo plano Meia Maratona 2026." };
}

export async function updateWorkoutAction(_id: string, _formData: FormData) {
  return { error: "Treinos do plano não podem ser editados manualmente." };
}

export async function deleteWorkoutAction(_id: string): Promise<void> {
  return;
}

export async function completeWorkoutAction(formData: FormData) {
  const parsed = completeSchema.safeParse({
    workoutId: formData.get("workoutId"),
    actualDistance: formData.get("actualDistance"),
    actualTime: formData.get("actualTime"),
    weight: formData.get("weight") || undefined,
    heartRate: formData.get("heartRate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    const result = await workoutService.completeWorkout(
      parsed.data.workoutId,
      parsed.data
    );
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/stats");
    revalidatePath("/achievements");
    return { success: true, unlocked: result.unlocked };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao concluir treino" };
  }
}
