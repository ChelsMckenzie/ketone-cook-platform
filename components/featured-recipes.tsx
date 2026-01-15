"use client";

import { ChefHat, Clock } from "lucide-react";
import Link from "next/link";

interface FeaturedRecipe {
  id: string;
  title: string;
  category?: string;
  cooking_time?: number;
  difficulty?: string;
  macros?: any;
}

interface FeaturedRecipesProps {
  recipes: FeaturedRecipe[];
}

export function FeaturedRecipes({ recipes }: FeaturedRecipesProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipes/${recipe.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg rainbow-gradient">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-card-foreground">
            {recipe.title}
          </h3>
          {recipe.category && (
            <p className="mb-2 text-sm capitalize text-muted-foreground">
              {recipe.category}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {recipe.cooking_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.cooking_time} min
              </div>
            )}
            {recipe.difficulty && (
              <span className="capitalize">{recipe.difficulty}</span>
            )}
          </div>
          {recipe.macros && (
            <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
              <span>{recipe.macros.carbs}g carbs</span>
              <span>{recipe.macros.protein}g protein</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
