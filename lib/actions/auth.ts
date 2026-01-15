"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/utils/profile";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (data.user) {
    // Create profile entry
    await supabase.from("profile").upsert({
      id: data.user.id,
      email: data.user.email || email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Check if email confirmation is required
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // User is authenticated, check if profile is complete
      const { data: profile } = await supabase
        .from("profile")
        .select("full_name, address, fasting_goal")
        .eq("id", data.user.id)
        .single();

      if (!isProfileComplete(profile)) {
        revalidatePath("/", "layout");
        redirect("/onboarding");
      } else {
        revalidatePath("/", "layout");
        redirect("/dashboard");
      }
    } else {
      // Email confirmation required
      revalidatePath("/", "layout");
      redirect("/auth/confirm-email");
    }
  }

  return {
    error: "Failed to create account",
  };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // Check if profile is complete
  if (data.user) {
    const { data: profile } = await supabase
      .from("profile")
      .select("full_name, address, fasting_goal")
      .eq("id", data.user.id)
      .single();

    if (!isProfileComplete(profile)) {
      revalidatePath("/", "layout");
      redirect("/onboarding");
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (data.url) {
    redirect(data.url);
  }
}
