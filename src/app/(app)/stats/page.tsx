import { DistanceChart } from "@/components/charts/distance-chart";
import { PaceChart } from "@/components/charts/pace-chart";
import { WeightChart } from "@/components/charts/weight-chart";
import { LongRunChart } from "@/components/charts/long-run-chart";
import { statsService } from "@/services/stats.service";

export default async function StatsPage() {
  const chartData = await statsService.getChartData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p className="text-muted-foreground text-sm">
          Gráficos de evolução e tendências
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DistanceChart
          weekly={chartData.weeklyDistance}
          monthly={chartData.monthlyDistance}
        />
        <PaceChart data={chartData.paceEvolution} />
        <WeightChart data={chartData.weightEvolution} />
        <LongRunChart data={chartData.longRuns} />
      </div>
    </div>
  );
}
