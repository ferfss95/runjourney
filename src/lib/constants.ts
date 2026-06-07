import { AchievementType, WorkoutType } from "@prisma/client";

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  EASY_RUN: "Corrida leve",
  INTERVAL: "Intervalado",
  LONG_RUN: "Longão",
  SPRINTS: "Tiros",
  RECOVERY: "Recuperação",
};

export const WORKOUT_TYPE_XP: Record<WorkoutType, number> = {
  EASY_RUN: 10,
  INTERVAL: 20,
  LONG_RUN: 30,
  SPRINTS: 25,
  RECOVERY: 5,
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  EASY_RUN: "hsl(142, 76%, 45%)",
  INTERVAL: "hsl(25, 95%, 53%)",
  LONG_RUN: "hsl(217, 91%, 60%)",
  SPRINTS: "hsl(0, 84%, 60%)",
  RECOVERY: "hsl(262, 83%, 58%)",
};

export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  { title: string; description: string; icon: string }
> = {
  FIRST_RUN: {
    title: "Primeira Corrida",
    description: "Complete seu primeiro treino",
    icon: "🏃",
  },
  FIVE_WORKOUTS: {
    title: "5 Treinos",
    description: "Complete 5 treinos",
    icon: "⭐",
  },
  TEN_WORKOUTS: {
    title: "10 Treinos",
    description: "Complete 10 treinos",
    icon: "🌟",
  },
  TWENTY_FIVE_WORKOUTS: {
    title: "25 Treinos",
    description: "Complete 25 treinos",
    icon: "💪",
  },
  FIFTY_KM: {
    title: "50km Acumulados",
    description: "Corra 50km no total",
    icon: "🎯",
  },
  HUNDRED_KM: {
    title: "100km Acumulados",
    description: "Corra 100km no total",
    icon: "🏆",
  },
  FIRST_LONG_RUN: {
    title: "Primeiro Longão",
    description: "Complete seu primeiro longão",
    icon: "🛤️",
  },
  FIRST_10K: {
    title: "Primeiro 10km",
    description: "Corra 10km em um treino",
    icon: "🔟",
  },
  FIRST_HALF_MARATHON: {
    title: "Primeira Meia",
    description: "Corra 21.1km em um treino",
    icon: "🥇",
  },
};

export const JWT_COOKIE_NAME = "runjourney_session";
export const SESSION_DURATION_DAYS = 30;
