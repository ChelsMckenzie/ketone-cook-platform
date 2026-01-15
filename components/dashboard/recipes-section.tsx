"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Plus, Eye, EyeOff, Trash2, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleRecipeFavorite,
  deleteRecipe,
  toggleRecipeVisibility,
} from "@/lib/actions/recipes";
import Link from "next/link";
import type { Recipe, RecipeFavorite } from "@/types/database";

interface RecipesSectionProps {
  userId: string;
  initialPublicRecipes: Recipe[];
  initialUserRecipes: Recipe[];
  initialFavorites: RecipeFavorite[];
}

export function RecipesSection({
  userId,
  initialPublicRecipes,
  initialUserRecipes,
  initialFavorites,
}: RecipesSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"public" | "mine" | "favorites">(
    "public"
  );

  const favoriteRecipeIds = new Set(initialFavorites.map((f) => f.recipe_id));

  // Deduplicate recipes for favorites (a user's public recipe appears in both lists)
  const allRecipesMap = new Map<string, Recipe>();
  [...initialPublicRecipes, ...initialUserRecipes].forEach((recipe) => {
    allRecipesMap.set(recipe.id, recipe);
  });
  const favoriteRecipes = Array.from(allRecipesMap.values()).filter((recipe) =>
    favoriteRecipeIds.has(recipe.id)
  );

  const handleToggleFavorite = async (recipeId: string) => {
    const formData = new FormData();
    formData.append("recipeId", recipeId);

    startTransition(async () => {
      const result = await toggleRecipeFavorite(formData);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleToggleVisibility = async (
    recipeId: string,
    currentVisibility: boolean
  ) => {
    startTransition(async () => {
      const result = await toggleRecipeVisibility(recipeId, !currentVisibility);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    startTransition(async () => {
      const result = await deleteRecipe(recipeId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const renderRecipeList = (
    recipes: Recipe[],
    showActions: boolean = false
  ) => {
    if (recipes.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          {activeTab === "public" && "No public recipes yet. Be the first to share!"}
          {activeTab === "mine" && (
            <div>
              <p className="mb-2">You haven&apos;t created any recipes yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/recipes/new">Create Your First Recipe</Link>
              </Button>
            </div>
          )}
          {activeTab === "favorites" &&
            "No favourite recipes yet. Start favouriting recipes you love!"}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Link
                href={`/recipes/${recipe.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 transition-colors hover:text-primary"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{recipe.title}</h3>
                  {showActions &&
                    (recipe.is_public ? (
                      <Eye className="h-4 w-4 text-primary" aria-label="Public" />
                    ) : (
                      <EyeOff
                        className="h-4 w-4 text-muted-foreground"
                        aria-label="Private"
                      />
                    ))}
                  {favoriteRecipeIds.has(recipe.id) && (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  )}
                </div>
                {recipe.category && (
                  <p className="text-sm text-muted-foreground">
                    {recipe.category}
                  </p>
                )}
                {recipe.cooking_time && (
                  <p className="text-xs text-muted-foreground">
                    {recipe.cooking_time} min
                  </p>
                )}
              </Link>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(recipe.id)}
                  disabled={isPending}
                  title={
                    favoriteRecipeIds.has(recipe.id)
                      ? "Remove from favourites"
                      : "Add to favourites"
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favoriteRecipeIds.has(recipe.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
                {showActions && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleVisibility(recipe.id, recipe.is_public)
                      }
                      disabled={isPending}
                      title={recipe.is_public ? "Make Private" : "Make Public"}
                    >
                      {recipe.is_public ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg rainbow-gradient p-2">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold rainbow-text">Recipes</h2>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <Button asChild size="sm">
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("public")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "public"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Public Recipes ({initialPublicRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Recipes ({initialUserRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "favorites"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Favourites ({favoriteRecipes.length})
        </button>
      </div>

      {/* Recipe List */}
      {activeTab === "public" && renderRecipeList(initialPublicRecipes)}
      {activeTab === "mine" && renderRecipeList(initialUserRecipes, true)}
      {activeTab === "favorites" && renderRecipeList(favoriteRecipes)}
    </div>
  );
}
