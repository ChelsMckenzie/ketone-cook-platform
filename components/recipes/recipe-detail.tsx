"use client";

import { ChefHat, Clock, TrendingUp, Users } from "lucide-react";
import type { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === "object" && recipe.ingredients !== null
      ? Object.values(recipe.ingredients)
      : [];

  type MacrosType = {
    carbs?: number;
    protein?: number;
    fat?: number;
    calories?: number;
  };

  const macros: MacrosType | null =
    recipe.macros && typeof recipe.macros === "object" && !Array.isArray(recipe.macros)
      ? (recipe.macros as MacrosType)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-4xl font-bold rainbow-text">{recipe.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {recipe.category && (
            <span className="capitalize rounded-full bg-primary/10 px-3 py-1 text-primary">
              {recipe.category}
            </span>
          )}
          {recipe.cooking_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cooking_time} minutes</span>
            </div>
          )}
          {recipe.difficulty && (
            <span className="capitalize">Difficulty: {recipe.difficulty}</span>
          )}
        </div>
      </div>

      {/* Macros Card */}
      {macros && (
        <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Nutritional Information (per serving)
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-2xl font-bold">
                {macros.carbs !== undefined ? `${macros.carbs}g` : "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold">
                {macros.protein !== undefined ? `${macros.protein}g` : "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="text-2xl font-bold">
                {macros.fat !== undefined ? `${macros.fat}g` : "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold">
                {macros.calories !== undefined ? `${macros.calories}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <ChefHat className="h-5 w-5 text-primary" />
          Ingredients
        </h2>
        <ul className="space-y-2">
          {ingredients.map((ingredient: any, index: number) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                {typeof ingredient === "object" && ingredient.name ? (
                  <>
                    <p className="font-medium">{ingredient.name}</p>
                    {ingredient.amount && (
                      <p className="text-sm text-muted-foreground">
                        {ingredient.amount}
                      </p>
                    )}
                  </>
                ) : (
                  <p>{String(ingredient)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Instructions</h2>
        <div className="prose prose-sm max-w-none">
          {recipe.instructions?.split("\n").map((step: string, index: number) => {
            const trimmedStep = step.trim();
            if (!trimmedStep) return null;
            return (
              <div
                key={index}
                className="mb-4 flex gap-4 rounded-lg border border-border bg-muted/30 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="flex-1 leading-relaxed">{trimmedStep}</p>
              </div>
            );
          }) || <p className="text-muted-foreground">No instructions provided.</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <p>Enjoy your keto-friendly meal! 🥑</p>
      </div>
    </div>
  );
}
