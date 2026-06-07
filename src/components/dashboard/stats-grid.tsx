import { Card, CardContent } from "@/components/ui/card";
import { formatDistance, formatPace } from "@/lib/utils";
import {
  Activity,
  Gauge,
  MapPin,
  Timer,
  TrendingUp,
  XCircle,
  CheckCircle,
} from "lucide-react";

interface StatsGridProps {
  stats: {
    totalDistance: number;
    avgPace: number | null;
    bestPace: number | null;
    totalWorkouts: number;
    completedCount: number;
    missedCount: number;
    longestRun: number;
  } | null;
}

const statItems = (
  stats: StatsGridProps["stats"]
): {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}[] => [
  {
    label: "Distância Total",
    value: formatDistance(stats?.totalDistance ?? 0),
    icon: MapPin,
    color: "text-primary",
  },
  {
    label: "Pace Médio",
    value: stats?.avgPace ? formatPace(stats.avgPace) : "—",
    icon: Gauge,
    color: "text-foreground",
  },
  {
    label: "Melhor Pace",
    value: stats?.bestPace ? formatPace(stats.bestPace) : "—",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    label: "Total Treinos",
    value: String(stats?.totalWorkouts ?? 0),
    icon: Activity,
    color: "text-muted-foreground",
  },
  {
    label: "Concluídos",
    value: String(stats?.completedCount ?? 0),
    icon: CheckCircle,
    color: "text-primary",
  },
  {
    label: "Atrasados",
    value: String(stats?.missedCount ?? 0),
    icon: XCircle,
    color: "text-destructive",
  },
  {
    label: "Maior Longão",
    value: formatDistance(stats?.longestRun ?? 0),
    icon: Timer,
    color: "text-foreground",
  },
];

export function StatsGrid({ stats }: StatsGridProps) {
  const items = statItems(stats);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
              <span className="text-xs text-muted-foreground truncate">
                {item.label}
              </span>
            </div>
            <p className="text-xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
