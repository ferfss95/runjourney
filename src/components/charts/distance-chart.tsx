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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
                  unit="km"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 10%)",
                    border: "1px solid hsl(0 0% 22%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} km`, "Distância"]}
                />
                <Bar
                  dataKey="distance"
                  fill="hsl(11 82% 58%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 11 }}
                  unit="km"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 10%)",
                    border: "1px solid hsl(0 0% 22%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} km`, "Distância"]}
                />
                <Bar
                  dataKey="distance"
                  fill="hsl(0 0% 70%)"
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
