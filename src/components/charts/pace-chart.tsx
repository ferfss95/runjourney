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

interface PaceChartProps {
  data: { date: string; pace: number; distance: number }[];
}

export function PaceChart({ data }: PaceChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de Pace</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              tickFormatter={(v) => formatPace(v)}
              reversed
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222 47% 9%)",
                border: "1px solid hsl(217 33% 18%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [formatPace(value), "Pace"]}
            />
            <Line
              type="monotone"
              dataKey="pace"
              stroke="hsl(25 95% 53%)"
              strokeWidth={2}
              dot={{ fill: "hsl(25 95% 53%)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
