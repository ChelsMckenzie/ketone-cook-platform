"use client";

import { Calendar, Droplet } from "lucide-react";
import { calculateCycleDay, getCyclePhase, isLutealPhase } from "@/lib/utils/cycle";

interface PeriodTrackerProps {
  lastPeriodEnd: string | null;
  cycleDay: number | null;
  phase: ReturnType<typeof getCyclePhase> | null;
  inLuteal: boolean;
}

export function PeriodTracker({
  lastPeriodEnd,
  cycleDay,
  phase,
  inLuteal,
}: PeriodTrackerProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg rainbow-gradient p-2">
          <Droplet className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold rainbow-text">Period Tracker</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Last Period End
            </p>
          </div>
          <p className="text-lg font-semibold">{formatDate(lastPeriodEnd)}</p>
        </div>

        {cycleDay && phase && (
          <>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-1 text-sm text-muted-foreground">Cycle Day</p>
              <p className="text-2xl font-bold">Day {cycleDay}</p>
              <p className="mt-1 text-sm text-muted-foreground">of 28</p>
            </div>

            <div
              className={`rounded-lg border-2 p-4 ${
                inLuteal
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Current Phase
              </p>
              <p className="text-xl font-bold">{phase.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {phase.description}
              </p>
            </div>

            {inLuteal && (
              <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ Luteal Phase Active
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                  Fasting may be more challenging during this phase. Consider
                  shorter windows or nutrient-dense meals.
                </p>
              </div>
            )}
          </>
        )}

        {!lastPeriodEnd && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Update your profile to track your cycle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
