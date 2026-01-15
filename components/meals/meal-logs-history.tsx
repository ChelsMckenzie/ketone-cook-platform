"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Utensils,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Log, MacroData } from "@/types/database";

interface MealLogsHistoryProps {
  meals: Log[];
}

export function MealLogsHistory({ meals }: MealLogsHistoryProps) {
  const [selectedMeal, setSelectedMeal] = useState<Log | null>(null);

  const getMealName = (content: string) => {
    const firstLine = content.split("\n")[0];
    return firstLine || "Unknown Meal";
  };

  const getMealDescription = (content: string) => {
    const lines = content.split("\n");
    return lines.slice(1).join("\n").trim();
  };

  const getCarbStatus = (macros: MacroData | null) => {
    if (!macros?.carbs) return null;
    const carbs = macros.carbs;

    if (carbs <= 10) {
      return {
        label: "Good",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500/10",
        icon: CheckCircle,
      };
    } else if (carbs <= 20) {
      return {
        label: "Average",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-500/10",
        icon: MinusCircle,
      };
    } else {
      return {
        label: "High",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        icon: AlertTriangle,
      };
    }
  };

  if (meals.length === 0) {
    return (
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Meal History</h2>
        <div className="py-8 text-center text-muted-foreground">
          <Utensils className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No meals logged yet.</p>
          <p className="text-sm">Upload a photo above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Meal History</h2>
        <div className="space-y-3">
          {meals.map((meal) => {
            const macros = meal.macros as MacroData | null;
            const carbStatus = getCarbStatus(macros);
            const mealName = getMealName(meal.content);
            const description = getMealDescription(meal.content);

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="cursor-pointer rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {meal.image_url ? (
                      <img
                        src={meal.image_url}
                        alt={mealName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Utensils className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="truncate font-semibold">{mealName}</h3>
                      <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(meal.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {description && (
                      <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}

                    {/* Carb Status Badge */}
                    {carbStatus && (
                      <div
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${carbStatus.bgColor} ${carbStatus.color}`}
                      >
                        <carbStatus.icon className="h-3 w-3" />
                        {carbStatus.label} ({macros?.carbs}g carbs)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Detail Modal */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedMeal && getMealName(selectedMeal.content)}
            </DialogTitle>
          </DialogHeader>

          {selectedMeal && (
            <div className="space-y-4">
              {/* Image */}
              {selectedMeal.image_url && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={selectedMeal.image_url}
                    alt={getMealName(selectedMeal.content)}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Timestamp */}
              <p className="text-sm text-muted-foreground">
                Logged{" "}
                {formatDistanceToNow(new Date(selectedMeal.created_at), {
                  addSuffix: true,
                })}
              </p>

              {/* Description */}
              {getMealDescription(selectedMeal.content) && (
                <div>
                  <h4 className="mb-1 font-semibold">Description</h4>
                  <p className="whitespace-pre-wrap text-sm">
                    {getMealDescription(selectedMeal.content)}
                  </p>
                </div>
              )}

              {/* Carb Status */}
              {(() => {
                const macros = selectedMeal.macros as MacroData | null;
                const carbStatus = getCarbStatus(macros);
                if (!carbStatus) return null;

                return (
                  <div
                    className={`flex items-center gap-2 rounded-lg p-3 ${carbStatus.bgColor}`}
                  >
                    <carbStatus.icon className={`h-5 w-5 ${carbStatus.color}`} />
                    <span className={`font-medium ${carbStatus.color}`}>
                      Carb Status: {carbStatus.label}
                    </span>
                  </div>
                );
              })()}

              {/* Macros */}
              {(() => {
                const macros = selectedMeal.macros as MacroData | null;
                if (!macros) return null;

                return (
                  <div>
                    <h4 className="mb-2 font-semibold">Macros</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {macros.carbs !== undefined && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="text-lg font-semibold">{macros.carbs}g</p>
                        </div>
                      )}
                      {macros.protein !== undefined && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            Protein
                          </p>
                          <p className="text-lg font-semibold">
                            {macros.protein}g
                          </p>
                        </div>
                      )}
                      {macros.fat !== undefined && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-xs text-muted-foreground">Fat</p>
                          <p className="text-lg font-semibold">{macros.fat}g</p>
                        </div>
                      )}
                      {macros.calories !== undefined && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            Calories
                          </p>
                          <p className="text-lg font-semibold">
                            {macros.calories}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Additional Info */}
              {(() => {
                const macros = selectedMeal.macros as MacroData | null;
                if (!macros) return null;

                const hasVegOrProtein =
                  macros.vegetables !== undefined ||
                  macros.proteins !== undefined;

                if (!hasVegOrProtein) return null;

                return (
                  <div className="grid grid-cols-2 gap-4">
                    {macros.vegetables !== undefined && (
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm text-muted-foreground">
                          Vegetables
                        </p>
                        <p className="text-2xl font-bold">{macros.vegetables}</p>
                      </div>
                    )}
                    {macros.proteins !== undefined && (
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm text-muted-foreground">
                          Protein Sources
                        </p>
                        <p className="text-2xl font-bold">{macros.proteins}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Carb Warning */}
              {(() => {
                const macros = selectedMeal.macros as MacroData | null;
                if (!macros?.carb_warning) return null;

                return (
                  <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-900 dark:text-amber-100">
                        Carb Warning
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      {macros.carb_warning}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
