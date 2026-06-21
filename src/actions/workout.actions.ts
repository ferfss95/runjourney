"use server";

import { workoutService } from "@/services/workout.service";
import { revalidatePath } from "next/cache";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/constants";
import type { AchievementType } from "@prisma/client";
import { z } from "zod";

const completeSchema = z.object({
  workoutId: z.string(),
  completedDate: z.string().optional(),
  actualDistance: z.coerce.number().positive(),
  actualTime: z.coerce.number().positive(),
  weight: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  date: z.string().min(1, "Data obrigatória"),
});

export async function createWorkoutAction(_formData: FormData) {
  return { error: "Treinos são definidos pelo plano Meia Maratona 2026." };
}

export async function updateWorkoutAction(_id: string, _formData: FormData) {
  return { error: "Treinos são definidos pelo plano Meia Maratona 2026." };
}

const updateCompletedSchema = completeSchema;

export async function updateCompletedWorkoutAction(formData: FormData) {
  const parsed = updateCompletedSchema.safeParse({
    workoutId: formData.get("workoutId"),
    completedDate: formData.get("completedDate") || undefined,
    actualDistance: formData.get("actualDistance"),
    actualTime: formData.get("actualTime"),
    weight: formData.get("weight") || undefined,
    heartRate: formData.get("heartRate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  if (!parsed.data.completedDate) {
    return { error: "Data de realização obrigatória" };
  }

  try {
    await workoutService.updateCompletedWorkout(parsed.data.workoutId, {
      completedDate: parsed.data.completedDate,
      actualDistance: parsed.data.actualDistance,
      actualTime: parsed.data.actualTime,
      weight: parsed.data.weight,
      heartRate: parsed.data.heartRate,
      notes: parsed.data.notes,
    });
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/stats");
    revalidatePath("/achievements");
    revalidatePath("/plans");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao atualizar treino",
    };
  }
}

export async function uncompleteWorkoutAction(workoutId: string) {
  try {
    await workoutService.uncompleteWorkout(workoutId);
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/stats");
    revalidatePath("/achievements");
    revalidatePath("/plans");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao desfazer conclusão",
    };
  }
}

export async function rescheduleWorkoutAction(
  workoutId: string,
  formData: FormData
) {
  const parsed = rescheduleSchema.safeParse({
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    await workoutService.rescheduleWorkout(workoutId, parsed.data.date);
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/plans");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao alterar data",
    };
  }
}

export async function deleteWorkoutAction(_id: string): Promise<void> {
  return;
}

export async function completeWorkoutAction(formData: FormData) {
  const parsed = completeSchema.safeParse({
    workoutId: formData.get("workoutId"),
    completedDate: formData.get("completedDate") || undefined,
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
    revalidatePath("/plans");
    return {
      success: true,
      xpEarned: result.execution.xpEarned,
      unlocked: result.unlocked.map((type: AchievementType) => ({
        type,
        title: ACHIEVEMENT_DEFINITIONS[type].title,
        description: ACHIEVEMENT_DEFINITIONS[type].description,
        icon: ACHIEVEMENT_DEFINITIONS[type].icon,
      })),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao concluir treino" };
  }
}
