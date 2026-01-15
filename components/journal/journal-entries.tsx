"use client";

import { formatDistanceToNow } from "date-fns";
import { BookOpen, Utensils, Droplet, Activity, Smile } from "lucide-react";
import type { Log, MacroData } from "@/types/database";

interface JournalEntriesProps {
  entries: Log[];
}

export function JournalEntries({ entries }: JournalEntriesProps) {
  const getEntryIcon = (type: string) => {
    switch (type) {
      case "meal_note":
        return <Utensils className="h-4 w-4" />;
      case "ketone_reading":
        return <Droplet className="h-4 w-4" />;
      case "personal_note":
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case "meal_note":
        return "Meal Note";
      case "ketone_reading":
        return "Ketone Reading";
      case "personal_note":
        return "Personal Note";
      default:
        return type;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "meal_note":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
      case "ketone_reading":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "personal_note":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold rainbow-text">
          Recent Entries
        </h2>
        <div className="py-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No journal entries yet.</p>
          <p className="text-sm">Start tracking your keto journey!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold rainbow-text">Recent Entries</h2>
      <div className="space-y-4">
        {entries.map((entry) => {
          const macros = entry.macros as MacroData | null;

          return (
            <div
              key={entry.id}
              className="rounded-lg border border-border bg-muted/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getEntryColor(entry.type)}`}
                >
                  {getEntryIcon(entry.type)}
                  {getEntryTypeLabel(entry.type)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <p className="mb-2 whitespace-pre-wrap text-sm">{entry.content}</p>

              {/* Ketone Reading */}
              {entry.type === "ketone_reading" && macros?.ketone_reading && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-500/10 p-2 text-sm">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">
                    {macros.ketone_reading} mmol/L
                  </span>
                </div>
              )}

              {/* Meal Note Macros */}
              {entry.type === "meal_note" && macros && (
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  {macros.carbs !== undefined && (
                    <div className="rounded bg-muted p-2 text-center">
                      <p className="text-muted-foreground">Carbs</p>
                      <p className="font-semibold">{macros.carbs}g</p>
                    </div>
                  )}
                  {macros.protein !== undefined && (
                    <div className="rounded bg-muted p-2 text-center">
                      <p className="text-muted-foreground">Protein</p>
                      <p className="font-semibold">{macros.protein}g</p>
                    </div>
                  )}
                  {macros.fat !== undefined && (
                    <div className="rounded bg-muted p-2 text-center">
                      <p className="text-muted-foreground">Fat</p>
                      <p className="font-semibold">{macros.fat}g</p>
                    </div>
                  )}
                  {macros.calories !== undefined && (
                    <div className="rounded bg-muted p-2 text-center">
                      <p className="text-muted-foreground">Cal</p>
                      <p className="font-semibold">{macros.calories}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Note - Energy & Mood */}
              {entry.type === "personal_note" && macros && (
                <div className="mt-2 flex gap-4 text-sm">
                  {macros.energy_level !== undefined && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span>Energy: {macros.energy_level}/9</span>
                    </div>
                  )}
                  {macros.mood !== undefined && (
                    <div className="flex items-center gap-1">
                      <Smile className="h-4 w-4 text-yellow-500" />
                      <span>Mood: {macros.mood}/9</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
