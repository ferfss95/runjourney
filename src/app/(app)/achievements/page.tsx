import { XpCard } from "@/components/dashboard/xp-card";
import { gamificationService } from "@/services/gamification.service";
import { AchievementList } from "@/components/achievements/achievement-list";

export default async function AchievementsPage() {
  const data = await gamificationService.getGamificationData();
  const unlocked = data.achievements.filter((a) => a.unlockedAt);
  const locked = data.achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground text-sm">
          {unlocked.length} de {data.achievements.length} desbloqueadas
        </p>
      </div>

      {data.stats && (
        <XpCard totalXp={data.stats.totalXp} level={data.stats.level} />
      )}

      <AchievementList unlocked={unlocked} locked={locked} />
    </div>
  );
}
