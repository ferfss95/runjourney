import { XpCard } from "@/components/dashboard/xp-card";
import { gamificationService } from "@/services/gamification.service";
import { AchievementList } from "@/components/achievements/achievement-list";
import { Suspense } from "react";

export const revalidate = 60;

async function AchievementsContent() {
  const data = await gamificationService.getGamificationData();
  const unlocked = data.achievements.filter((a) => a.unlockedAt);
  const locked = data.achievements.filter((a) => !a.unlockedAt);

  return (
    <>
      <p className="text-sm text-muted-foreground -mt-4">
        {unlocked.length} de {data.achievements.length} desbloqueadas
      </p>

      {data.stats && (
        <XpCard totalXp={data.stats.totalXp} level={data.stats.level} />
      )}

      <AchievementList unlocked={unlocked} locked={locked} />
    </>
  );
}

function AchievementsSkeleton() {
  return (
    <>
      <div className="h-36 rounded-xl bg-card/50 animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
    </>
  );
}

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground text-sm">
          Desbloqueie metas conforme evolui nos treinos
        </p>
      </div>
      <Suspense fallback={<AchievementsSkeleton />}>
        <AchievementsContent />
      </Suspense>
    </div>
  );
}
