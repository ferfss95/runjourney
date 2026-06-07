import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakCard({ currentStreak, bestStreak }: StreakCardProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Consistência
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequência Atual</p>
              <p className="text-2xl font-bold">
                {currentStreak}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  dias
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Trophy className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Melhor Sequência</p>
              <p className="text-2xl font-bold">
                {bestStreak}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  dias
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
