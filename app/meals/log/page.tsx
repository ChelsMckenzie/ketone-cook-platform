import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { MealLoggerForm } from "@/components/meals/meal-logger-form";
import { MealLogsHistory } from "@/components/meals/meal-logs-history";

export const metadata: Metadata = {
  title: "Meal Logger",
  description: "Log your meals with AI-powered photo analysis. Get instant macro breakdowns and keto scores for your food.",
  robots: { index: false, follow: false },
};

export default async function LogMealPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch meal logs (meal_note entries)
  const { data: mealLogs } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "meal_note")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Log Your Meal</h1>
            <p className="text-muted-foreground">
              Upload a photo of your meal and let AI analyze it for you!
            </p>
          </div>
          
          <MealLoggerForm />
          
          {mealLogs && mealLogs.length > 0 && (
            <div className="mt-12">
              <MealLogsHistory meals={mealLogs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
