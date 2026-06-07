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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DistanceChartProps {
  weekly: { week: string; distance: number }[];
  monthly: { month: string; distance: number }[];
}

export function DistanceChart({ weekly, monthly }: DistanceChartProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de Distância</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
                <XAxis
                  dataKey="week"
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
                  fill="hsl(142 76% 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
