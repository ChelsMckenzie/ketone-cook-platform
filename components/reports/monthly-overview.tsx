"use client";

import {
  Activity,
  Smile,
  Droplet,
  Utensils,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface MonthlyOverviewProps {
  totalLogs: number;
  mealLogs: number;
  ketoneReadings: number;
  personalNotes: number;
  avgEnergy: number | null;
  avgMood: number | null;
  avgKetone: number | null;
  monthName: string;
}

export function MonthlyOverview({
  totalLogs,
  mealLogs,
  ketoneReadings,
  personalNotes,
  avgEnergy,
  avgMood,
  avgKetone,
  monthName,
}: MonthlyOverviewProps) {
  const getKetosisStatus = (avgKetone: number | null) => {
    if (!avgKetone) return { status: "No data", color: "text-muted-foreground" };
    if (avgKetone >= 1.5)
      return { status: "Optimal Ketosis", color: "text-green-600" };
    if (avgKetone >= 0.5)
      return { status: "Light Ketosis", color: "text-yellow-600" };
    return { status: "Below Ketosis", color: "text-red-600" };
  };

  const ketosisInfo = getKetosisStatus(avgKetone);

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <h2 className="mb-4 text-xl font-semibold rainbow-text">
        {monthName} Overview
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Entries */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{totalLogs}</p>
            </div>
          </div>
        </div>

        {/* Meal Logs */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Utensils className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meals Logged</p>
              <p className="text-2xl font-bold">{mealLogs}</p>
            </div>
          </div>
        </div>

        {/* Ketone Readings */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Droplet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ketone Readings</p>
              <p className="text-2xl font-bold">{ketoneReadings}</p>
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Journal Entries</p>
              <p className="text-2xl font-bold">{personalNotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Averages Section */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Average Energy */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-orange-500/5 to-orange-500/10 p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Energy Level</p>
              {avgEnergy !== null ? (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{avgEnergy.toFixed(1)}</p>
                  <span className="text-sm text-muted-foreground">/ 9</span>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Average Mood */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 p-4">
          <div className="flex items-center gap-3">
            <Smile className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Mood</p>
              {avgMood !== null ? (
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">{avgMood.toFixed(1)}</p>
                  <span className="text-sm text-muted-foreground">/ 9</span>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Average Ketone */}
        <div className="rounded-lg border border-border bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-4">
          <div className="flex items-center gap-3">
            <Droplet className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Ketones</p>
              {avgKetone !== null ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{avgKetone.toFixed(2)}</p>
                    <span className="text-sm text-muted-foreground">mmol/L</span>
                  </div>
                  <p className={`text-xs font-medium ${ketosisInfo.color}`}>
                    {ketosisInfo.status}
                  </p>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
