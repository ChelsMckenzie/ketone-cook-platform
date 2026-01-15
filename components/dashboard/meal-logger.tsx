"use client";

import { formatDistanceToNow } from "date-fns";
import { Utensils, Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Log, MacroData } from "@/types/database";

interface MealLoggerProps {
  userId: string;
  lastMeal: Log | null;
}

export function MealLogger({ userId, lastMeal }: MealLoggerProps) {
  const getMealName = (content: string) => {
    // Extract the meal name from content (first line)
    const firstLine = content.split("\n")[0];
    return firstLine || "Unknown Meal";
  };

  const macros = lastMeal?.macros as MacroData | null;

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg rainbow-gradient p-2">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold rainbow-text">Last Meal</h2>
        </div>
        <Button asChild size="sm">
          <Link href="/meals/log">
            <Camera className="mr-2 h-4 w-4" />
            Log Meal
          </Link>
        </Button>
      </div>

      {lastMeal ? (
        <Link
          href="/meals/log"
          className="block rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{getMealName(lastMeal.content)}</h3>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lastMeal.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          {macros && (
            <div className="grid grid-cols-4 gap-2 text-xs">
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

          <p className="mt-2 text-xs text-muted-foreground">
            Click to log a new meal or view history
          </p>
        </Link>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-2 text-muted-foreground">No meals logged yet</p>
          <Button asChild size="sm">
            <Link href="/meals/log">
              <Plus className="mr-2 h-4 w-4" />
              Log Your First Meal
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
