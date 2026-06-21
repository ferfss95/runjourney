"use client";

import dynamic from "next/dynamic";

function ChartSkeleton() {
  return <div className="h-[250px] rounded-xl bg-card/50 animate-pulse" />;
}

const DistanceChart = dynamic(
  () =>
    import("@/components/charts/distance-chart").then((m) => m.DistanceChart),
  { loading: () => <ChartSkeleton /> }
);

const PaceChart = dynamic(
  () => import("@/components/charts/pace-chart").then((m) => m.PaceChart),
  { loading: () => <ChartSkeleton /> }
);

const HeartRateChart = dynamic(
  () =>
    import("@/components/charts/heart-rate-chart").then(
      (m) => m.HeartRateChart
    ),
  { loading: () => <ChartSkeleton /> }
);

const WeightChart = dynamic(
  () => import("@/components/charts/weight-chart").then((m) => m.WeightChart),
  { loading: () => <ChartSkeleton /> }
);

const LongRunChart = dynamic(
  () => import("@/components/charts/long-run-chart").then((m) => m.LongRunChart),
  { loading: () => <ChartSkeleton /> }
);

export type StatsChartData = Awaited<
  ReturnType<
    typeof import("@/services/stats.service").statsService.getChartData
  >
>;

export function LazyStatsCharts({ data }: { data: StatsChartData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DistanceChart
        weekly={data.weeklyDistance}
        monthly={data.monthlyDistance}
      />
      <PaceChart data={data.paceEvolution} />
      <HeartRateChart data={data.heartRateEvolution} />
      <WeightChart data={data.weightEvolution} />
      <LongRunChart data={data.longRuns} />
    </div>
  );
}
