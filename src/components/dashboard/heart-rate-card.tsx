import { Card, CardContent } from "@/components/ui/card";
import {
  SESSION_CHART_COLORS,
  SESSION_ORDER,
} from "@/lib/workout-session";
import type { HeartRateSummary, SessionMetrics } from "@/services/stats.service";
import { Activity, Heart, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeartRateCardProps {
  summary: HeartRateSummary;
  sessionMetrics: SessionMetrics[];
}

export function HeartRateCard({ summary, sessionMetrics }: HeartRateCardProps) {
  if (summary.count === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="text-sm text-muted-foreground uppercase tracking-wider">
              Frequência Cardíaca
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Registre o BPM ao concluir treinos para acompanhar sua evolução
          </p>
        </CardContent>
      </Card>
    );
  }

  const metricsByKey = Object.fromEntries(
    sessionMetrics.map((m) => [m.key, m])
  );

  return (
    <Card className="glass-card">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-sm text-muted-foreground uppercase tracking-wider">
            Frequência Cardíaca
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Média geral</p>
            <p className="text-2xl font-bold">{summary.avgBpm}</p>
            <p className="text-xs text-muted-foreground">bpm</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Último registro</p>
            <p className="text-2xl font-bold">{summary.lastBpm}</p>
            <p className="text-xs text-muted-foreground">bpm</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              Mínimo
            </div>
            <p className="text-2xl font-bold">{summary.minBpm}</p>
            <p className="text-xs text-muted-foreground">bpm</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Máximo
            </div>
            <p className="text-2xl font-bold">{summary.maxBpm}</p>
            <p className="text-xs text-muted-foreground">bpm</p>
          </div>
        </div>

        {summary.lastDate && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Último registro em{" "}
            {format(new Date(summary.lastDate + "T12:00:00"), "d 'de' MMMM", {
              locale: ptBR,
            })}{" "}
            · {summary.count} treinos com BPM
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50">
          {SESSION_ORDER.map((key) => {
            const session = metricsByKey[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SESSION_CHART_COLORS[key] }}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    Treino {key}
                  </span>
                </div>
                <span className="text-sm font-semibold shrink-0 ml-2">
                  {session?.avgHeartRate != null
                    ? `${session.avgHeartRate} bpm`
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
