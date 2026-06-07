"use server";

export async function createPlanAction(_formData: FormData) {
  return {
    error: "A criação de planos está desabilitada. Use o plano Meia Maratona 2026.",
  };
}

export async function updatePlanAction(_id: string, _formData: FormData) {
  return { error: "O plano Meia Maratona 2026 não pode ser editado." };
}

export async function deletePlanAction(_id: string): Promise<void> {
  return;
}

export async function setActivePlanAction(_id: string): Promise<void> {
  return;
}
