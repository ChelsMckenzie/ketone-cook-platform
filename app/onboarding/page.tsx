import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import type { Profile } from "@/types/database";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if profile is already complete
  const { data: profileData } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (profile?.full_name && profile?.address && profile?.fasting_goal) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <OnboardingWizard />
    </div>
  );
}
