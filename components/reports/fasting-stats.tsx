"use client";

import { useMemo } from "react";
import {
  differenceInHours,
  differenceInDays,
  isSameDay,
  format,
  eachDayOfInterval,
} from "date-fns";
import { Timer, Calendar, Target, TrendingUp } from "lucide-react";
import type { Log } from "@/types/database";

interface FastingStatsProps {
  fastingGoal: number;
  mealLogs: Log[];
  monthStart: Date;
  monthEnd: Date;
}

export function FastingStats({
  fastingGoal,
  mealLogs,
  monthStart,
  monthEnd,
}: FastingStatsProps) {
  const stats = useMemo(() => {
    if (mealLogs.length < 2) {
      return {
        daysWithFasting: 0,
        totalDaysInMonth: differenceInDays(monthEnd, monthStart) + 1,
        averageFastingWindow: null,
        longestFast: null,
        fastingWindowsMetGoal: 0,
        fastingWindows: [] as { date: string; hours: number }[],
      };
    }

    // Sort meals by date
    const sortedMeals = [...mealLogs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Calculate fasting windows between meals
    const fastingWindows: { date: string; hours: number }[] = [];

    for (let i = 1; i < sortedMeals.length; i++) {
      const prevMeal = new Date(sortedMeals[i - 1].created_at);
      const currentMeal = new Date(sortedMeals[i].created_at);
      const hoursBetween = differenceInHours(currentMeal, prevMeal);

      // Only count as fasting if more than 12 hours between meals
      if (hoursBetween >= 12) {
        fastingWindows.push({
          date: format(currentMeal, "MMM d"),
          hours: hoursBetween,
        });
      }
    }

    // Get unique days with meals
    const daysWithMeals = new Set<string>();
    mealLogs.forEach((log) => {
      daysWithMeals.add(format(new Date(log.created_at), "yyyy-MM-dd"));
    });

    // Count days with fasting (days where a fast was broken)
    const daysWithFasting = fastingWindows.length;

    // Calculate average fasting window
    const totalFastingHours = fastingWindows.reduce(
      (sum, fw) => sum + fw.hours,
      0
    );
    const averageFastingWindow =
      fastingWindows.length > 0
        ? totalFastingHours / fastingWindows.length
        : null;

    // Find longest fast
    const longestFast =
      fastingWindows.length > 0
        ? Math.max(...fastingWindows.map((fw) => fw.hours))
        : null;

    // Count how many times goal was met
    const fastingWindowsMetGoal = fastingWindows.filter(
      (fw) => fw.hours >= fastingGoal
    ).length;

    const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const today = new Date();
    const effectiveDays =
      monthEnd > today
        ? differenceInDays(today, monthStart) + 1
        : totalDaysInMonth;

    return {
      daysWithFasting,
      totalDaysInMonth: effectiveDays,
      averageFastingWindow,
      longestFast,
      fastingWindowsMetGoal,
      fastingWindows,
    };
  }, [mealLogs, monthStart, monthEnd, fastingGoal]);

  const completionRate =
    stats.daysWithFasting > 0
      ? Math.round((stats.fastingWindowsMetGoal / stats.daysWithFasting) * 100)
      : 0;

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Timer className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Fasting Statistics</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Days Fasted */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Days Fasted</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{stats.daysWithFasting}</p>
                <span className="text-sm text-muted-foreground">
                  / {stats.totalDaysInMonth} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Fasting Window */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-green-500/5 to-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <Timer className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Fast Window</p>
              {stats.averageFastingWindow !== null ? (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">
                    {stats.averageFastingWindow.toFixed(1)}
                  </p>
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No data</p>
              )}
              {stats.averageFastingWindow !== null && (
                <p className="text-xs text-muted-foreground">
                  Goal: {fastingGoal} hours
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Longest Fast */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Longest Fast</p>
              {stats.longestFast !== null ? (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{stats.longestFast}</p>
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Goal Completion */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-purple-500/5 to-purple-500/10 p-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Goal Met</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">
                  {stats.fastingWindowsMetGoal}
                </p>
                <span className="text-sm text-muted-foreground">
                  / {stats.daysWithFasting} fasts
                </span>
              </div>
              {stats.daysWithFasting > 0 && (
                <p
                  className={`text-xs font-medium ${
                    completionRate >= 80
                      ? "text-green-600"
                      : completionRate >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {completionRate}% success rate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fasting History */}
      {stats.fastingWindows.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Recent Fasting Windows
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.fastingWindows.slice(-10).map((fw, idx) => (
              <div
                key={idx}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  fw.hours >= fastingGoal
                    ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className="font-medium">{fw.date}</span>
                <span className="ml-2">{fw.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.daysWithFasting === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Timer className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No fasting data for this month yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Log your meals to track fasting windows automatically.
          </p>
        </div>
      )}
    </div>
  );
}
