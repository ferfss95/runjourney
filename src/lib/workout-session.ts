import type { WorkoutType } from "@prisma/client";

export type WorkoutSessionKey = "A" | "B" | "C";

export const SESSION_ORDER: WorkoutSessionKey[] = ["A", "B", "C"];

export const SESSION_CHART_COLORS: Record<WorkoutSessionKey, string> = {
  A: "hsl(0, 0%, 70%)",
  B: "hsl(11, 82%, 58%)",
  C: "hsl(11, 60%, 45%)",
};

export function getSessionTitle(key: WorkoutSessionKey): string {
  return SESSION_BASE[key].title;
}

export interface WorkoutSessionInfo {
  key: WorkoutSessionKey;
  title: string;
  objective: string;
  guidance: string;
  structure?: string[];
  specifics?: string;
}

const SESSION_BASE: Record<
  WorkoutSessionKey,
  Pick<WorkoutSessionInfo, "title" | "objective" | "guidance" | "structure">
> = {
  A: {
    title: "Treino A — Corrida leve",
    objective: "Construir base aeróbica.",
    guidance: "Ritmo confortável, conseguindo conversar.",
  },
  B: {
    title: "Treino B — Ritmo mais forte",
    objective: "Ganhar condicionamento.",
    guidance: "Treino com ritmo mais forte e recuperações entre as séries.",
    structure: [
      "1 km aquecimento",
      "4 x 400 m mais forte",
      "400 m caminhando ou trotando entre as séries",
      "1 km desaquecimento",
    ],
  },
  C: {
    title: "Treino C — Longão",
    objective: "Aumentar a distância.",
    guidance: "Ritmo bem confortável.",
  },
};

export function getWorkoutSessionKey(
  notes: string | null,
  type: WorkoutType
): WorkoutSessionKey {
  if (notes?.includes("Treino A")) return "A";
  if (notes?.includes("Treino B")) return "B";
  if (notes?.includes("Treino C")) return "C";
  if (type === "LONG_RUN") return "C";
  if (type === "INTERVAL") return "B";
  return "A";
}

function extractSpecifics(notes: string): string | undefined {
  const parts = notes.split("•").map((part) => part.trim());
  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart.startsWith("Semana")) return undefined;
  return lastPart;
}

export function getWorkoutSessionInfo(
  notes: string | null,
  type: WorkoutType
): WorkoutSessionInfo {
  const key = getWorkoutSessionKey(notes, type);
  const base = SESSION_BASE[key];
  const specifics = notes ? extractSpecifics(notes) : undefined;

  if (key === "B" && type === "EASY_RUN") {
    return {
      key,
      title: "Treino B — Corrida leve",
      objective: "Manter o condicionamento sem sobrecarga.",
      guidance: "Semana de polimento. Ritmo confortável, sem forçar.",
      specifics,
    };
  }

  if (key === "C" && notes?.includes("DIA DA PROVA")) {
    return {
      key,
      title: "Treino C — Longão",
      objective: "Prova — Meia Maratona.",
      guidance: "Ritmo de prova. Você treinou para este dia!",
      specifics: "🏁 Dia da prova — 21,1 km",
    };
  }

  if (key === "B" && type === "INTERVAL") {
    return {
      key,
      ...base,
      specifics: specifics ? `Prescrição desta semana: ${specifics}` : undefined,
    };
  }

  return {
    key,
    ...base,
    specifics,
  };
}
