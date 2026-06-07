"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPlanAction,
  updatePlanAction,
} from "@/actions/plan.actions";

interface PlanFormProps {
  plan?: {
    id: string;
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    description: string | null;
  };
  onSuccess?: () => void;
}

export function PlanForm({ plan, onSuccess }: PlanFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = !!plan;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = isEdit
      ? await updatePlanAction(plan.id, formData)
      : await createPlanAction(formData);
    if (result?.error) setError(result.error);
    else {
      onSuccess?.();
      router.push(isEdit ? `/plans/${plan!.id}` : "/plans");
      router.refresh();
    }
    setPending(false);
  }

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Plano</Label>
        <Input
          id="name"
          name="name"
          defaultValue={plan?.name}
          placeholder="Meia Maratona 2026"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Objetivo</Label>
        <Input
          id="goal"
          name="goal"
          defaultValue={plan?.goal}
          placeholder="Completar 21.1km"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data Início</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={plan ? formatDate(plan.startDate) : undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data Fim</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={plan ? formatDate(plan.endDate) : undefined}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={plan?.description ?? ""}
          placeholder="Plano de preparação para meia maratona..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : isEdit ? "Atualizar Plano" : "Criar Plano"}
      </Button>
    </form>
  );
}
