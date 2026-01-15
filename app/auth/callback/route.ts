import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/utils/profile";
import type { Profile } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const supabase = await createClient();

  // Handle email confirmation
  if (code && type === "signup") {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=confirmation_failed", request.url)
      );
    }

    // Ensure profile exists
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Create profile if it doesn't exist
      const { data: existingProfile } = await supabase
        .from("profile")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        await supabase
          .from("profile")
          .insert({ id: user.id, email: user.email || "" } as any);
      }
    }
  }

  // Handle OAuth callback
  if (code && !type) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("OAuth exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL("/login?error=oauth_failed", request.url)
      );
    }

    // Ensure profile exists for OAuth users
    const {
      data: { user: oauthUser },
    } = await supabase.auth.getUser();

    if (oauthUser) {
      const { data: existingProfile } = await supabase
        .from("profile")
        .select("id")
        .eq("id", oauthUser.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("profile")
          .insert({
            id: oauthUser.id,
            email: oauthUser.email || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);

        if (profileError) {
          console.error("Error creating OAuth profile:", profileError);
        }
      }
    }
  }

  // Check if user has completed onboarding
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError) {
    console.error("Error getting user:", getUserError);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  if (user) {
    // Check if profile is complete
    const { data: profileData } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;

    if (!isProfileComplete(profile)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}
