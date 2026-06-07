"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LongRunChartProps {
  data: { date: string; distance: number; pace: number }[];
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

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução dos Longões</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              unit="km"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222 47% 9%)",
                border: "1px solid hsl(217 33% 18%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value} km`, "Distância"]}
            />
            <Bar
              dataKey="distance"
              fill="hsl(217 91% 60%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
