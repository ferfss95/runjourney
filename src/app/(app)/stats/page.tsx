import { Suspense } from "react";
import { LazyStatsCharts } from "@/components/charts/lazy-stats-charts";
import { statsService } from "@/services/stats.service";

export const revalidate = 60;

async function StatsContent() {
  const chartData = await statsService.getChartData();
  return <LazyStatsCharts data={chartData} />;
}

function StatsChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-[280px] rounded-xl bg-card/50 animate-pulse" />
      ))}
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p className="text-muted-foreground text-sm">
          Gráficos de evolução e tendências
        </p>
      </div>

      <Suspense fallback={<StatsChartsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
