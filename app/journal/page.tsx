import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { JournalForm } from "@/components/journal/journal-form";
import { JournalEntries } from "@/components/journal/journal-entries";

export const metadata: Metadata = {
  title: "Daily Journal",
  description: "Track your keto journey with daily entries. Log meals, ketone readings, energy levels, and personal notes.",
  robots: { index: false, follow: false },
};

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load journal entries
  const { data: entries } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Daily Journal</h1>
            <p className="text-muted-foreground">
              Track your meals, energy, mood, and fasting experience
            </p>
          </div>
          <div className="space-y-6">
            <JournalForm />
            <JournalEntries entries={entries || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
