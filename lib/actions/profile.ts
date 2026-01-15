"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";

export interface ProfileUpdateData {
  full_name: string;
  dob: string;
  gender: string;
  last_period_end?: string;
  address: string;
  city: string;
  fasting_goal: number;
}

export async function updateProfile(
  data: ProfileUpdateData
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to update your profile.",
    };
  }

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase
    .from("profile") as any)
    .update({
      full_name: data.full_name,
      dob: data.dob || null,
      gender: data.gender || null,
      last_period_end: data.last_period_end || null,
      address: data.address || null,
      city: data.city || null,
      fasting_goal: data.fasting_goal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to update profile.",
    };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
