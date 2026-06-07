import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface InsightsCardProps {
  insights: string[];
}

export function InsightsCard({ insights }: InsightsCardProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {insights.map((insight, i) => (
          <p
            key={i}
            className="text-sm text-muted-foreground border-l-2 border-primary/50 pl-3"
          >
            {insight}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
