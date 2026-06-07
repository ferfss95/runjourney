"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
}

interface AchievementListProps {
  unlocked: Achievement[];
  locked: Achievement[];
}

export function AchievementList({ unlocked, locked }: AchievementListProps) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold mb-3">Desbloqueadas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unlocked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-3xl">{a.icon}</span>
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                  <Badge variant="success" className="ml-auto">
                    ✓
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Bloqueadas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((a) => (
              <Card key={a.id} className="glass-card opacity-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-3xl grayscale">{a.icon}</span>
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
