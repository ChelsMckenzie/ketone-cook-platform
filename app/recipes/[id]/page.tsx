import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import type { Recipe } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for public recipes
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, ingredients, macros, is_public")
    .eq("id", id)
    .single();

  if (!recipe || !recipe.is_public) {
    return {
      title: "Recipe",
      robots: { index: false, follow: false },
    };
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.slice(0, 5).join(", ")
    : "";

  return {
    title: recipe.title,
    description: `${recipe.title} - A delicious keto recipe on KetoMate. Made with ${ingredients}. Perfect for your ketogenic diet.`,
    openGraph: {
      title: `${recipe.title} | KetoMate Recipe`,
      description: `A delicious keto recipe. Made with ${ingredients}.`,
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the recipe
  const { data: recipeData, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  const recipe = recipeData as Recipe | null;

  if (error || !recipe) {
    redirect("/dashboard");
  }

  // Check if recipe is public or belongs to current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!recipe.is_public && (!user || recipe.user_id !== user.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <RecipeDetail recipe={recipe} />
        </div>
      </div>
    </div>
  );
}
