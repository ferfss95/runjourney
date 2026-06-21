"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SESSION_CHART_COLORS,
  SESSION_ORDER,
} from "@/lib/workout-session";

type SessionDistancePoint = {
  A: number;
  B: number;
  C: number;
};

interface DistanceChartProps {
  weekly: (SessionDistancePoint & { week: string })[];
  monthly: (SessionDistancePoint & { month: string })[];
}

const SESSION_LABELS = {
  A: "Treino A",
  B: "Treino B",
  C: "Treino C",
} as const;

function SessionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="rounded-lg border border-border bg-background p-3 text-sm shadow-md">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full mr-2"
            style={{ backgroundColor: item.color }}
          />
          {SESSION_LABELS[item.name as keyof typeof SESSION_LABELS]}:{" "}
          <span className="text-foreground font-medium">{item.value} km</span>
        </p>
      ))}
      <p className="mt-2 pt-2 border-t border-border font-medium">
        Total: {total.toFixed(1)} km
      </p>
    </div>
  );
}

function SessionBarChart({
  data,
  xKey,
  tickFormatter,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  tickFormatter?: (value: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          tickFormatter={tickFormatter}
        />
        <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }} unit="km" />
        <Tooltip content={<SessionTooltip />} />
        <Legend
          formatter={(value) =>
            SESSION_LABELS[value as keyof typeof SESSION_LABELS]
          }
        />
        {SESSION_ORDER.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="distance"
            fill={SESSION_CHART_COLORS[key]}
            radius={key === "C" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistanceChart({ weekly, monthly }: DistanceChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de Distância por Treino</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distância acumulada separada por Treino A, B e C
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <SessionBarChart
              data={weekly}
              xKey="week"
              tickFormatter={(v) => v.slice(5)}
            />
          </TabsContent>
          <TabsContent value="monthly">
            <SessionBarChart data={monthly} xKey="month" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
