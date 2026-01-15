import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { RecipeGenerator } from "@/components/recipes/recipe-generator";

export const metadata: Metadata = {
  title: "Create Recipe",
  description: "Generate AI-powered keto recipes from your available ingredients. KetoMate's smart recipe generator creates delicious low-carb meals.",
  robots: { index: false, follow: false },
};

export default async function NewRecipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Create New Recipe</h1>
            <p className="text-muted-foreground">
              Enter your available ingredients and let AI generate a delicious keto recipe for you!
            </p>
          </div>
          <RecipeGenerator />
        </div>
      </div>
    </div>
  );
}
