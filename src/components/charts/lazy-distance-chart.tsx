"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const DistanceChart = dynamic(
  () =>
    import("@/components/charts/distance-chart").then((m) => m.DistanceChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] rounded-xl bg-card/50 animate-pulse" />
    ),
  }
);

type LazyDistanceChartProps = ComponentProps<typeof DistanceChart>;

export function LazyDistanceChart(props: LazyDistanceChartProps) {
  return <DistanceChart {...props} />;
}
