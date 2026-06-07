"use client";

import { motion } from "framer-motion";
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
    color: "text-accent",
  },
  {
    label: "Melhor Pace",
    value: stats?.bestPace ? formatPace(stats.bestPace) : "—",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    label: "Total Treinos",
    value: String(stats?.totalWorkouts ?? 0),
    icon: Activity,
    color: "text-orange-400",
  },
  {
    label: "Concluídos",
    value: String(stats?.completedCount ?? 0),
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  {
    label: "Perdidos",
    value: String(stats?.missedCount ?? 0),
    icon: XCircle,
    color: "text-red-400",
  },
  {
    label: "Maior Longão",
    value: formatDistance(stats?.longestRun ?? 0),
    icon: Timer,
    color: "text-blue-400",
  },
];

export function StatsGrid({ stats }: StatsGridProps) {
  const items = statItems(stats);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 * i }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
              <p className="text-xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
