import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { xpProgressInLevel } from "@/lib/utils";
import { Zap } from "lucide-react";

interface XpCardProps {
  totalXp: number;
  level: number;
}

export function XpCard({ totalXp, level }: XpCardProps) {
  const progress = xpProgressInLevel(totalXp);

  return (
    <Card className="glass-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Nível {level}</h3>
          </div>
          <span className="text-sm text-muted-foreground">{totalXp} XP</span>
        </div>
        <Progress value={progress.percent} className="h-3 mb-2" />
        <p className="text-xs text-muted-foreground text-right">
          {progress.current} / {progress.needed} XP para nível {level + 1}
        </p>
      </CardContent>
    </Card>
  );
}
