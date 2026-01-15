import { Clock, ChefHat, Camera, BookOpen, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { FeaturedRecipes } from "@/components/featured-recipes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();

  // Load featured public recipes (no auth required)
  const { data: featuredRecipes } = await supabase
    .from("recipes")
    .select("id, title, category, cooking_time, difficulty, macros")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Keto Assistant</span>
          </div>
          <h2 className="text-4xl font-bold rainbow-text sm:text-5xl md:text-6xl">
            Automate Your Keto Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Smart keto, simplified. Generate recipes with AI, track your fasting windows, 
            analyze meals with photo recognition, and monitor your ketone levels — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="rainbow-gradient text-white">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold rainbow-text mb-4">
            Everything You Need for Keto Success
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            KetoMate combines AI technology with practical tools to make your ketogenic lifestyle effortless.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Fasting Dashboard Card */}
          <div className="group relative rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg rainbow-gradient">
              <Clock className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Fasting Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your intermittent fasting schedule with cycle-aware insights for hormonal health.
            </p>
          </div>

          {/* Smart Kitchen Card */}
          <div className="group relative rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg rainbow-gradient">
              <ChefHat className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              AI Recipe Generator
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate delicious keto recipes from ingredients you have on hand using AI-powered technology.
            </p>
          </div>

          {/* Visual Meal Logger Card */}
          <div className="group relative rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg rainbow-gradient">
              <Camera className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Visual Meal Logger
            </h3>
            <p className="text-sm text-muted-foreground">
              Snap a photo of your meal and get instant macro breakdown, keto score, and ingredient analysis.
            </p>
          </div>

          {/* Daily Journal Card */}
          <div className="group relative rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg rainbow-gradient">
              <BookOpen className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Daily Journal
            </h3>
            <p className="text-sm text-muted-foreground">
              Log meals, fasting windows, ketone readings, and notes in your personal health timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      {featuredRecipes && featuredRecipes.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold rainbow-text">
              Community Recipes
            </h2>
            <p className="text-muted-foreground">
              Delicious keto recipes shared by our KetoMate community
            </p>
          </div>
          <FeaturedRecipes recipes={featuredRecipes} />
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto rounded-xl border-2 border-border bg-card p-8 md:p-12 text-center shadow-lg rainbow-accent">
          <h3 className="mb-4 text-3xl font-bold rainbow-text">
            Ready to Simplify Your Keto?
          </h3>
          <p className="mb-8 text-muted-foreground">
            Join KetoMate today and let AI automate the hard parts of your ketogenic journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rainbow-gradient text-white">
              <Link href="/signup">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KetoMate. Smart keto, simplified.
          </p>
        </div>
      </footer>
    </div>
  );
}
