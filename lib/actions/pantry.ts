"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";
import type { PantryInsert } from "@/types/database";

export async function getPantry(): Promise<ActionResult<{ ingredients: string[] }>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to view your pantry.",
    };
  }

  // Type assertion needed due to Supabase type inference limitations
  const { data: pantryItems, error } = await (supabase
    .from("pantry") as any)
    .select("ingredient_name")
    .eq("user_id", user.id)
    .order("ingredient_name", { ascending: true });

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch pantry items.",
    };
  }

  const ingredients = pantryItems?.map((item: { ingredient_name: string }) => item.ingredient_name) || [];

  return {
    success: true,
    data: { ingredients },
  };
}

export async function addPantryItem(
  ingredientName: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to add pantry items.",
    };
  }

  if (!ingredientName || ingredientName.trim().length === 0) {
    return {
      success: false,
      error: "Ingredient name is required.",
    };
  }

  const pantryData: PantryInsert = {
    user_id: user.id,
    ingredient_name: ingredientName.trim(),
  };

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase.from("pantry") as any).insert(pantryData);

  if (error) {
    // If it's a duplicate, that's okay - just return success
    if (error.code === "23505") {
      revalidatePath("/recipes/new");
      return { success: true };
    }
    return {
      success: false,
      error: error.message || "Failed to add pantry item.",
    };
  }

  revalidatePath("/recipes/new");
  return { success: true };
}

export async function removePantryItem(
  ingredientName: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to remove pantry items.",
    };
  }

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase
    .from("pantry") as any)
    .delete()
    .eq("user_id", user.id)
    .eq("ingredient_name", ingredientName);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to remove pantry item.",
    };
  }

  revalidatePath("/recipes/new");
  return { success: true };
}

export async function updatePantryItems(
  ingredients: string[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to update pantry items.",
    };
  }

  // Delete all existing items
  // Type assertion needed due to Supabase type inference limitations
  const { error: deleteError } = await (supabase
    .from("pantry") as any)
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message || "Failed to clear pantry.",
    };
  }

  // Insert new items
  if (ingredients.length > 0) {
    const pantryData: PantryInsert[] = ingredients
      .filter((ing) => ing.trim().length > 0)
      .map((ingredient) => ({
        user_id: user.id,
        ingredient_name: ingredient.trim(),
      }));

    // Type assertion needed due to Supabase type inference limitations
    const { error: insertError } = await (supabase.from("pantry") as any).insert(pantryData);

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Failed to add pantry items.",
      };
    }
  }

  revalidatePath("/recipes/new");
  return { success: true };
}
