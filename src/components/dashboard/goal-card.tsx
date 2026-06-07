import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistance } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Target } from "lucide-react";

interface GoalCardProps {
  planName: string;
  goal: string;
  progress: number;
  completed: number;
  total: number;
  longestRun: number;
  nextWorkout?: {
    date: Date;
    plannedDistance: number;
  } | null;
}

export function GoalCard({
  planName,
  goal,
  progress,
  completed,
  total,
  longestRun,
  nextWorkout,
}: GoalCardProps) {
  const blocks = 16;
  const filled = Math.round((progress / 100) * blocks);

  return (
    <Card className="glass-card stat-glow overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-white/5 pointer-events-none" />
      <CardContent className="p-4 sm:p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Objetivo Atual
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 gradient-text truncate">
              {goal}
            </h2>
            <p className="text-muted-foreground text-sm mt-1 truncate">
              {planName}
            </p>
          </div>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold text-2xl text-primary">{progress}%</span>
          </div>

          <div className="font-mono text-base sm:text-lg tracking-wider overflow-hidden">
            {"█".repeat(filled)}
            <span className="text-muted-foreground/30">
              {"░".repeat(blocks - filled)}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <p className="text-sm text-muted-foreground">
            {completed} de {total} treinos concluídos
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-6 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Maior longão</p>
            <p className="text-lg sm:text-xl font-bold">
              {formatDistance(longestRun)}
            </p>
          </div>
          {nextWorkout && (
            <div>
              <p className="text-xs text-muted-foreground">Próximo treino</p>
              <p className="text-lg sm:text-xl font-bold">
                {formatDistance(nextWorkout.plannedDistance)}
              </p>
              <p className="text-xs text-primary">
                {format(new Date(nextWorkout.date), "EEEE, d MMM", {
                  locale: ptBR,
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
