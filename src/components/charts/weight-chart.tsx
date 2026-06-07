"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Peso</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
          Nenhum registro de peso ainda
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de Peso</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 0% 70%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0 0% 70%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
              unit="kg"
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 10%)",
                border: "1px solid hsl(0 0% 22%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value} kg`, "Peso"]}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(0 0% 70%)"
              fill="url(#weightGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
