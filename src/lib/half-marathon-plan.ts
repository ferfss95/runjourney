import type { WorkoutType } from "@prisma/client";

export const HALF_MARATHON_PLAN = {
  name: "Meia Maratona 2026",
  goal: "MEIA MARATONA 21,1KM",
  description:
    "Plano de 16 semanas para meia maratona. 3 treinos por semana: Treino A (leve), Treino B (intervalado) e Treino C (longão).",
} as const;

type WeekWorkout = {
  label: "A" | "B" | "C";
  type: WorkoutType;
  plannedDistance: number;
  notes: string;
};

const WEEKS: {
  week: number;
  a: { km: number };
  b: { interval: string; km: number; type: WorkoutType };
  c: { km: number };
}[] = [
  { week: 1, a: { km: 3 }, b: { interval: "4x400m", km: 4, type: "INTERVAL" }, c: { km: 4 } },
  { week: 2, a: { km: 4 }, b: { interval: "5x400m", km: 4.5, type: "INTERVAL" }, c: { km: 5 } },
  { week: 3, a: { km: 4 }, b: { interval: "4x600m", km: 5, type: "INTERVAL" }, c: { km: 6 } },
  { week: 4, a: { km: 5 }, b: { interval: "5x600m", km: 5.5, type: "INTERVAL" }, c: { km: 7 } },
  { week: 5, a: { km: 5 }, b: { interval: "4x800m", km: 6, type: "INTERVAL" }, c: { km: 8 } },
  { week: 6, a: { km: 5 }, b: { interval: "5x800m", km: 6.5, type: "INTERVAL" }, c: { km: 9 } },
  { week: 7, a: { km: 6 }, b: { interval: "4x1km", km: 6, type: "INTERVAL" }, c: { km: 10 } },
  { week: 8, a: { km: 6 }, b: { interval: "5x1km", km: 7, type: "INTERVAL" }, c: { km: 11 } },
  { week: 9, a: { km: 7 }, b: { interval: "6x1km", km: 8, type: "INTERVAL" }, c: { km: 12 } },
  { week: 10, a: { km: 7 }, b: { interval: "5x1200m", km: 8, type: "INTERVAL" }, c: { km: 14 } },
  { week: 11, a: { km: 8 }, b: { interval: "6x1200m", km: 9, type: "INTERVAL" }, c: { km: 15 } },
  { week: 12, a: { km: 8 }, b: { interval: "4x1600m", km: 9, type: "INTERVAL" }, c: { km: 16 } },
  { week: 13, a: { km: 8 }, b: { interval: "5x1600m", km: 10, type: "INTERVAL" }, c: { km: 18 } },
  { week: 14, a: { km: 6 }, b: { interval: "leve", km: 4, type: "EASY_RUN" }, c: { km: 14 } },
  { week: 15, a: { km: 5 }, b: { interval: "leve", km: 4, type: "EASY_RUN" }, c: { km: 10 } },
  { week: 16, a: { km: 4 }, b: { interval: "leve", km: 3, type: "EASY_RUN" }, c: { km: 21.1 } },
];

function estimateTimeMinutes(km: number, type: WorkoutType): number {
  const pace = type === "INTERVAL" ? 5.5 : type === "LONG_RUN" ? 6.5 : 6;
  return Math.round(km * pace);
}

export function generateHalfMarathonWorkouts(planStart: Date): {
  date: Date;
  week: number;
  workout: WeekWorkout;
  plannedTime: number;
}[] {
  const start = new Date(planStart);
  start.setHours(8, 0, 0, 0);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  const results: {
    date: Date;
    week: number;
    workout: WeekWorkout;
    plannedTime: number;
  }[] = [];

  const dayOffsets = { A: 1, B: 3, C: 5 };

  for (const w of WEEKS) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (w.week - 1) * 7);

    const workouts: WeekWorkout[] = [
      {
        label: "A",
        type: "EASY_RUN",
        plannedDistance: w.a.km,
        notes: `Semana ${w.week} • Treino A • Corrida leve ${w.a.km}km`,
      },
      {
        label: "B",
        type: w.b.type,
        plannedDistance: w.b.km,
        notes:
          w.b.interval === "leve"
            ? `Semana ${w.week} • Treino B • Corrida leve`
            : `Semana ${w.week} • Treino B • ${w.b.interval}`,
      },
      {
        label: "C",
        type: "LONG_RUN",
        plannedDistance: w.c.km,
        notes:
          w.week === 16
            ? `Semana ${w.week} • Treino C • 🏁 DIA DA PROVA — Meia Maratona 21,1km`
            : `Semana ${w.week} • Treino C • Longão ${w.c.km}km`,
      },
    ];

    for (const workout of workouts) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayOffsets[workout.label]);
      results.push({
        date,
        week: w.week,
        workout,
        plannedTime: estimateTimeMinutes(
          workout.plannedDistance,
          workout.type
        ) * 60,
      });
    }
  }

  return results;
}

export const TOTAL_PLAN_WORKOUTS = WEEKS.length * 3;
