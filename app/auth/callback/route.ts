import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/utils/profile";
import type { Profile } from "@/types/database";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  
  // Log for debugging (remove in production if needed)
  console.log("Auth callback - code:", code ? "present" : "missing", "type:", type || "none");
  
  // Create Supabase client with proper cookie handling for route handlers
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Handle password reset callback - MUST be checked first before OAuth
  // Password reset emails should include type=recovery
  // This is the PRIMARY handler for password reset - do not add profile checks here
  if (code && type === "recovery") {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Password reset exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL("/login?error=reset_failed", request.url)
      );
    }

    // Verify user is authenticated after exchange
    const {
      data: { user: resetUser },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !resetUser) {
      console.error("Error getting user after password reset exchange:", getUserError);
      return NextResponse.redirect(
        new URL("/login?error=session_expired", request.url)
      );
    }

    // IMPORTANT: Redirect directly to reset password page with a flag
    // Do NOT check profile completion - password reset should work regardless
    // Add a query parameter to indicate this is a password reset flow
    const resetUrl = new URL("/auth/reset-password", request.url);
    resetUrl.searchParams.set("reset", "true");
    return NextResponse.redirect(resetUrl);
  }

  // Handle OAuth callback (only if type is not recovery and not signup)
  if (code && !type) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("OAuth exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL("/login?error=oauth_failed", request.url)
      );
    }

    // Get user after session exchange
    const {
      data: { user: oauthUser },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !oauthUser) {
      console.error("Error getting OAuth user:", getUserError);
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", request.url)
      );
    }

    // Ensure profile exists for OAuth users
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

    // Check if profile is complete and redirect accordingly
    const { data: profileData } = await supabase
      .from("profile")
      .select("*")
      .eq("id", oauthUser.id)
      .single();

    const profile = profileData as Profile | null;

    if (!isProfileComplete(profile)) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle email confirmation flow (if not OAuth and not recovery)
  if (code && type === "signup") {
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
  }

  // Default redirect if no code or unrecognized type
  return NextResponse.redirect(new URL("/", request.url));
}
