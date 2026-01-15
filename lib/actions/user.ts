"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";
import type { ProfileInsert } from "@/types/database";

export interface OnboardingFormData {
  full_name: string;
  dob: string;
  gender: string;
  last_period_end?: string;
  address: string;
  fasting_goal: number;
}

export async function updateUserProfile(
  data: OnboardingFormData
): Promise<ActionResult | never> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to complete onboarding.",
    };
  }

  const profileData: ProfileInsert = {
    id: user.id,
    full_name: data.full_name,
    email: user.email || "",
    dob: data.dob || null,
    gender: data.gender || null,
    last_period_end: data.last_period_end || null,
    address: data.address,
    fasting_goal: data.fasting_goal,
    updated_at: new Date().toISOString(),
  };

  // Type assertion needed due to Supabase type inference limitations
  const { error } = await (supabase.from("profile") as any).upsert(profileData);

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to update profile.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
