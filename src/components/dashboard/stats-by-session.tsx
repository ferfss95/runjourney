import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SESSION_CHART_COLORS,
  SESSION_ORDER,
} from "@/lib/workout-session";
import { formatDistance, formatPace } from "@/lib/utils";
import type { OverallMetrics, SessionMetrics } from "@/services/stats.service";
import { CheckCircle, Gauge, Heart, MapPin, TrendingUp, XCircle } from "lucide-react";

interface StatsBySessionProps {
  metrics: SessionMetrics[];
  overallMetrics: OverallMetrics;
}

type MetricsGridData = Pick<
  SessionMetrics,
  | "totalDistance"
  | "avgPace"
  | "bestPace"
  | "avgHeartRate"
  | "lastHeartRate"
  | "completedCount"
  | "totalCount"
  | "overdueCount"
  | "longestDistance"
> & {
  longestLabel?: string;
};

function MetricsGrid({ data }: { data: MetricsGridData }) {
  const items = [
    {
      label: "Distância",
      value: formatDistance(data.totalDistance),
      icon: MapPin,
    },
    {
      label: "Pace médio",
      value: data.avgPace ? formatPace(data.avgPace) : "—",
      icon: Gauge,
    },
    {
      label: "Melhor pace",
      value: data.bestPace ? formatPace(data.bestPace) : "—",
      icon: TrendingUp,
    },
    {
      label: "BPM médio",
      value:
        data.avgHeartRate != null ? `${data.avgHeartRate} bpm` : "—",
      icon: Heart,
    },
    {
      label: "Último BPM",
      value:
        data.lastHeartRate != null ? `${data.lastHeartRate} bpm` : "—",
      icon: Heart,
    },
    {
      label: "Concluídos",
      value: `${data.completedCount}/${data.totalCount}`,
      icon: CheckCircle,
    },
    {
      label: "Atrasados",
      value: String(data.overdueCount),
      icon: XCircle,
    },
    {
      label: data.longestLabel ?? "Maior distância",
      value: formatDistance(data.longestDistance),
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg bg-muted/40 p-2.5 sm:p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {item.label}
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function StatsBySession({ metrics, overallMetrics }: StatsBySessionProps) {
  const metricsByKey = Object.fromEntries(metrics.map((m) => [m.key, m]));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Métricas de treino</h2>
        <p className="text-sm text-muted-foreground">
          Visão geral e análise por Treino A, B e C
        </p>
      </div>

      <Card className="glass-card overflow-hidden ring-1 ring-primary/20">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-base">{overallMetrics.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Soma e médias de todos os tipos de treino
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <MetricsGrid
            data={{
              ...overallMetrics,
              longestLabel: "Maior longão",
            }}
          />
        </CardContent>
      </Card>

      <div>
        <h3 className="text-base font-semibold mb-3">Por tipo de treino</h3>
        <div className="space-y-3">
          {SESSION_ORDER.map((key) => {
            const session = metricsByKey[key];
            if (!session) return null;

            return (
              <Card key={key} className="glass-card overflow-hidden">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: SESSION_CHART_COLORS[key] }}
                    />
                    <CardTitle className="text-base">{session.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <MetricsGrid
                    data={{
                      ...session,
                      longestLabel:
                        key === "C" ? "Maior longão" : "Maior distância",
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
