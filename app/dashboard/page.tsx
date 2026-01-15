import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your KetoMate dashboard. Track fasting, view recipes, log meals, and monitor your ketogenic progress.",
  robots: { index: false, follow: false }, // Don't index private dashboard
};
import { FastingTimer } from "@/components/dashboard/fasting-timer";
import { ProfileOverview } from "@/components/dashboard/profile-overview";
import { PeriodTracker } from "@/components/dashboard/period-tracker";
import { RecipesSection } from "@/components/dashboard/recipes-section";
import { MealLogger } from "@/components/dashboard/meal-logger";
import { DailyJournal } from "@/components/dashboard/daily-journal";
import {
  calculateCycleDay,
  getCyclePhase,
  isLutealPhase,
} from "@/lib/utils/cycle";
import { isProfileComplete } from "@/lib/utils/profile";
import {
  RECIPES_PAGE_SIZE,
  JOURNAL_ENTRIES_LIMIT,
} from "@/lib/constants";
import type { Profile, Recipe, Log, RecipeFavorite } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile and check completeness
  const { data: profileData } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  // Calculate cycle information for female users
  let cycleInfo = null;
  if (profile?.gender === "Female" && profile?.last_period_end) {
    const lastPeriodDate = new Date(profile.last_period_end);
    const cycleDay = calculateCycleDay(lastPeriodDate);
    const cyclePhase = getCyclePhase(cycleDay);
    const inLuteal = isLutealPhase(cycleDay);

    cycleInfo = {
      cycleDay,
      phase: cyclePhase,
      inLuteal,
    };
  }

  // Fetch data in parallel for better performance
  const [
    { data: journalEntriesData },
    { data: lastMealLogData },
    { data: publicRecipesData },
    { data: userRecipesData },
    { data: favoritesData },
  ] = await Promise.all([
    // Recent journal entries
    supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(JOURNAL_ENTRIES_LIMIT),
    // Most recent meal log
    supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "meal_note")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    // Public recipes
    supabase
      .from("recipes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(RECIPES_PAGE_SIZE),
    // User's recipes
    supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // User's favorite recipes
    supabase
      .from("recipe_favorites")
      .select("*")
      .eq("user_id", user.id),
  ]);

  // Type assertions for better type safety
  const journalEntries = journalEntriesData as Log[] | null;
  const lastMealLog = lastMealLogData as Log | null;
  const publicRecipes = publicRecipesData as Recipe[] | null;
  const userRecipes = userRecipesData as Recipe[] | null;
  const favorites = favoritesData as RecipeFavorite[] | null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || "User"}! 👋
            </p>
          </div>

          {/* Profile Overview */}
          {profile && (
            <ProfileOverview
              profile={{
                full_name: profile.full_name,
                dob: profile.dob || null,
                gender: profile.gender,
                last_period_end: profile.last_period_end || null,
                address: profile.address || null,
                city: profile.city || null,
                fasting_goal: profile.fasting_goal,
              }}
            />
          )}

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Fasting Timer */}
              {profile?.fasting_goal && (
                <FastingTimer fastingGoal={profile.fasting_goal} />
              )}

              {/* Period Tracker (Women only) */}
              {profile?.gender === "Female" && (
                <PeriodTracker
                  lastPeriodEnd={profile.last_period_end}
                  cycleDay={cycleInfo?.cycleDay || null}
                  phase={cycleInfo?.phase || null}
                  inLuteal={cycleInfo?.inLuteal || false}
                />
              )}

              {/* Meal Logger */}
              <MealLogger userId={user.id} lastMeal={lastMealLog || null} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Recipes Section */}
              <RecipesSection
                userId={user.id}
                initialPublicRecipes={publicRecipes || []}
                initialUserRecipes={userRecipes || []}
                initialFavorites={favorites || []}
              />

              {/* Daily Journal */}
              <DailyJournal userId={user.id} entries={journalEntries || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
