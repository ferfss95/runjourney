"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPace } from "@/lib/utils";

interface LongRunChartProps {
  data: { date: string; distance: number; pace: number }[];
}

function formatAxisKm(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}

function getYDomain(distances: number[]): [number, number] {
  const min = Math.min(...distances);
  const max = Math.max(...distances);
  const padding = Math.max(0.5, (max - min) * 0.15 || 0.5);
  return [
    Math.max(0, Math.floor((min - padding) * 10) / 10),
    Math.ceil((max + padding) * 10) / 10,
  ];
}

export function LongRunChart({ data }: LongRunChartProps) {
  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Evolução dos Longões</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
          Nenhum longão registrado ainda
        </CardContent>
      </Card>
    );
  }

  const yDomain = getYDomain(data.map((d) => d.distance));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução dos Longões</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distância dos longões (Treino C) ao longo do plano
        </p>
      </CardHeader>
      <CardContent>
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
              domain={yDomain}
              tickCount={5}
              allowDecimals
              tickFormatter={formatAxisKm}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 10%)",
                border: "1px solid hsl(0 0% 22%)",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "distance") return [`${value} km`, "Distância"];
                return [formatPace(value), "Pace"];
              }}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="distance"
              name="distance"
              stroke="hsl(11 60% 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(11 60% 45%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
