"use client";

import {
  LineChart,
  Line,
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
  getSessionTitle,
  type WorkoutSessionKey,
} from "@/lib/workout-session";
import type { HeartRatePoint } from "@/services/stats.service";

interface HeartRateChartProps {
  data: HeartRatePoint[];
}

const SESSION_SHORT = {
  A: "Treino A",
  B: "Treino B",
  C: "Treino C",
} as const;

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function HeartRateLineChart({
  data,
  color = "hsl(11 82% 58%)",
}: {
  data: HeartRatePoint[];
  color?: string;
}) {
  if (data.length === 0) {
    return <EmptyState message="Nenhum registro de BPM nesta categoria" />;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          unit=" bpm"
          domain={["dataMin - 5", "dataMax + 5"]}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(0 0% 10%)",
            border: "1px solid hsl(0 0% 22%)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value} bpm`, "Freq. cardíaca"]}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="bpm"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** BPM médio ponderado por distância quando há mais de um treino no mesmo dia */
function buildOverallSeries(
  data: HeartRatePoint[]
): { date: string; bpm: number }[] {
  const byDate = new Map<string, { bpmDistSum: number; distSum: number }>();

  for (const point of data) {
    const entry = byDate.get(point.date) ?? { bpmDistSum: 0, distSum: 0 };
    entry.bpmDistSum += point.bpm * point.distance;
    entry.distSum += point.distance;
    byDate.set(point.date, entry);
  }

  return Array.from(byDate.entries())
    .map(([date, { bpmDistSum, distSum }]) => ({
      date,
      bpm: distSum > 0 ? Math.round(bpmDistSum / distSum) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function OverallHeartRateChart({ data }: { data: HeartRatePoint[] }) {
  const series = buildOverallSeries(data);

  if (series.length === 0) {
    return <EmptyState message="Nenhum registro de BPM ainda" />;
  }

  return (
    <HeartRateLineChart
      data={series.map((p) => ({
        ...p,
        distance: 0,
        session: "A" as WorkoutSessionKey,
      }))}
      color="hsl(11 82% 58%)"
    />
  );
}

function buildCombinedSeries(data: HeartRatePoint[]) {
  const byDate = new Map<string, Partial<Record<WorkoutSessionKey, number>>>();

  for (const point of data) {
    const entry = byDate.get(point.date) ?? {};
    entry[point.session] = point.bpm;
    byDate.set(point.date, entry);
  }

  return Array.from(byDate.entries())
    .map(([date, bpms]) => ({ date, ...bpms }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function CombinedHeartRateChart({ data }: { data: HeartRatePoint[] }) {
  const series = buildCombinedSeries(data);

  if (series.length === 0) {
    return <EmptyState message="Nenhum registro de BPM ainda" />;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
          unit=" bpm"
          domain={["dataMin - 5", "dataMax + 5"]}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(0 0% 10%)",
            border: "1px solid hsl(0 0% 22%)",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            `${value} bpm`,
            SESSION_SHORT[name as WorkoutSessionKey] ?? name,
          ]}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Legend
          formatter={(value) =>
            SESSION_SHORT[value as WorkoutSessionKey] ?? value
          }
        />
        {SESSION_ORDER.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={SESSION_CHART_COLORS[key]}
            strokeWidth={2}
            dot={{ fill: SESSION_CHART_COLORS[key], r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function HeartRateChart({ data }: HeartRateChartProps) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Evolução de BPM</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Registre a freq. cardíaca ao concluir treinos" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de BPM</CardTitle>
        <p className="text-sm text-muted-foreground">
          Frequência cardíaca por treino — acompanhe a evolução ao longo do plano
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
            <TabsTrigger value="general">BPM geral</TabsTrigger>
            <TabsTrigger value="all">Por tipo</TabsTrigger>
            {SESSION_ORDER.map((key) => (
              <TabsTrigger key={key} value={key}>
                {SESSION_SHORT[key]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general">
            <p className="text-xs text-muted-foreground mb-3">
              Média ponderada por distância — todos os treinos (A, B e C) em uma
              linha
            </p>
            <OverallHeartRateChart data={sorted} />
          </TabsContent>

          <TabsContent value="all">
            <p className="text-xs text-muted-foreground mb-3">
              Uma linha por tipo de treino para comparar a evolução
            </p>
            <CombinedHeartRateChart data={sorted} />
          </TabsContent>

          {SESSION_ORDER.map((key) => {
            const filtered = sorted.filter((p) => p.session === key);
            return (
              <TabsContent key={key} value={key}>
                <p className="text-xs text-muted-foreground mb-3">
                  {getSessionTitle(key)}
                </p>
                <HeartRateLineChart
                  data={filtered}
                  color={SESSION_CHART_COLORS[key]}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
