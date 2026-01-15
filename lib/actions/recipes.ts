"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";
import type { Json, RecipeInsert, RecipeFavoriteInsert } from "@/types/database";

export interface RecipeData {
  title: string;
  ingredients: Json;
  instructions: string;
  macros: Json;
  cooking_time: number;
  difficulty: string;
  category: string;
  is_public: boolean;
}

export async function createRecipe(
  data: RecipeData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  // Validate input
  if (!data) {
    return {
      success: false,
      error: "No recipe data provided.",
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to create recipes.",
    };
  }

  // Validate required fields
  if (!data.title || !data.ingredients || !data.instructions) {
    return {
      success: false,
      error:
        "Missing required fields: title, ingredients, and instructions are required.",
    };
  }

  const recipeData: RecipeInsert = {
    user_id: user.id,
    title: data.title,
    ingredients: data.ingredients,
    instructions: data.instructions,
    macros: data.macros || null,
    cooking_time: data.cooking_time || null,
    difficulty: data.difficulty || null,
    category: data.category || null,
    is_public: data.is_public ?? false,
  };

  // Type assertion needed due to Supabase type inference limitations
  const { data: insertedData, error } = await (supabase
    .from("recipes") as any)
    .insert(recipeData)
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to create recipe.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true,
    data: { id: insertedData.id },
  };
}

export async function toggleRecipeFavorite(
  formData: FormData
): Promise<ActionResult<{ favorited: boolean }>> {
  const recipeId = formData.get("recipeId") as string;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to favourite recipes.",
    };
  }

  // Check if favorite exists
  // Type assertion needed due to Supabase type inference limitations
  const { data: existing } = await (supabase
    .from("recipe_favorites") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .single();

  if (existing) {
    // Remove favorite
    // Type assertion needed due to Supabase type inference limitations
    const { error } = await (supabase
      .from("recipe_favorites") as any)
      .delete()
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { favorited: false } };
  } else {
    // Add favorite
    const favoriteData: RecipeFavoriteInsert = {
      user_id: user.id,
      recipe_id: recipeId,
    };

    // Type assertion needed due to Supabase type inference limitations
    const { error } = await (supabase
      .from("recipe_favorites") as any)
      .insert(favoriteData);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { favorited: true } };
  }
}

export async function deleteRecipe(
  recipeId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to delete recipes.",
    };
  }

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase
    .from("recipes") as any)
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}

export async function toggleRecipeVisibility(
  recipeId: string,
  isPublic: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to update recipes.",
    };
  }

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase
    .from("recipes") as any)
    .update({ is_public: isPublic })
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}
