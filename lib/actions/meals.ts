"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";
import type { MacroData } from "@/types/database";

export interface MealLogData {
  name: string;
  description?: string;
  image_url?: string;
  macros: MacroData;
  vegetables?: number;
  proteins?: number;
  carb_warning?: string;
}

export async function logMeal(
  data: MealLogData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to log meals.",
    };
  }

  // Build the content string
  let content = data.name;
  if (data.description) {
    content += `\n${data.description}`;
  }
  if (data.carb_warning) {
    content += `\n⚠️ ${data.carb_warning}`;
  }

  // Prepare macros data with all meal-specific fields
  const macrosData: MacroData = {
    ...data.macros,
    vegetables: data.vegetables,
    proteins: data.proteins,
    carb_warning: data.carb_warning,
  };

  const { data: insertedData, error } = await supabase
    .from("logs")
    .insert({
      user_id: user.id,
      type: "meal_note" as const,
      content: content,
      image_url: data.image_url || null,
      macros: macrosData,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to log meal.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/meals/log");

  return {
    success: true,
    data: { id: insertedData.id },
  };
}
