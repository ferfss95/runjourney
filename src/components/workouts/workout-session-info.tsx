import { getWorkoutSessionInfo } from "@/lib/workout-session";
import type { WorkoutType } from "@prisma/client";

interface WorkoutSessionInfoProps {
  type: WorkoutType;
  notes: string | null;
  compact?: boolean;
}

export function WorkoutSessionInfo({
  type,
  notes,
  compact = false,
}: WorkoutSessionInfoProps) {
  const info = getWorkoutSessionInfo(notes, type);

  if (compact) {
    return (
      <div className="space-y-1">
        <p className="font-medium text-sm">{info.title}</p>
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground/80">Objetivo:</span> {info.objective}
        </p>
        <p className="text-xs text-muted-foreground">{info.guidance}</p>
        {info.specifics && (
          <p className="text-xs text-primary font-medium">{info.specifics}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-muted/40 p-3">
      <p className="font-semibold text-sm sm:text-base">{info.title}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground/90">Objetivo:</span>{" "}
        {info.objective}
      </p>
      <p className="text-sm text-muted-foreground">{info.guidance}</p>
      {info.specifics && (
        <p className="text-sm text-primary font-medium">{info.specifics}</p>
      )}
      {info.structure && info.structure.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground/90 mb-1">Exemplo:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {info.structure.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
