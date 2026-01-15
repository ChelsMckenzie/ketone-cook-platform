"use client";

import { formatDistanceToNow } from "date-fns";
import { BookOpen, Plus, Utensils, Droplet, Activity, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Log, MacroData } from "@/types/database";

interface DailyJournalProps {
  userId: string;
  entries: Log[];
}

export function DailyJournal({ userId, entries }: DailyJournalProps) {
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
        return "Meal";
      case "ketone_reading":
        return "Ketone";
      case "personal_note":
        return "Note";
      default:
        return type;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "meal_note":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "ketone_reading":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "personal_note":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg rainbow-gradient p-2">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold rainbow-text">Daily Journal</h2>
        </div>
        <Button asChild size="sm">
          <Link href="/journal">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No journal entries yet.</p>
          <p className="text-sm">Start tracking your journey!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 5).map((entry) => {
            const macros = entry.macros as MacroData | null;

            return (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getEntryColor(entry.type)}`}
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
                <p className="line-clamp-2 text-sm">{entry.content}</p>

                {/* Show ketone reading for ketone entries */}
                {entry.type === "ketone_reading" && macros?.ketone_reading && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <Droplet className="h-3 w-3" />
                    <span className="font-semibold">
                      {macros.ketone_reading} mmol/L
                    </span>
                  </div>
                )}

                {/* Show energy/mood for personal notes */}
                {entry.type === "personal_note" && macros && (
                  <div className="mt-1 flex gap-3 text-xs">
                    {macros.energy_level !== undefined && (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Activity className="h-3 w-3" />
                        <span>{macros.energy_level}/9</span>
                      </div>
                    )}
                    {macros.mood !== undefined && (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <Smile className="h-3 w-3" />
                        <span>{macros.mood}/9</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {entries.length > 5 && (
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/journal">View All Entries</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
