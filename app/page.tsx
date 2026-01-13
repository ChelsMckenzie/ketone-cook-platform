import { Clock, ChefHat, Camera, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
            Your Ketogenic Lifestyle Assistant
          </h2>
          <p className="text-lg text-muted-foreground">
            Simplify your Keto journey with automated meal planning, AI-powered meal analysis, and cycle-aware fasting schedules.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Fasting Dashboard Card */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Fasting Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your intermittent fasting schedule with cycle-aware insights for hormonal health.
            </p>
          </div>

          {/* Smart Kitchen Card */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Smart Kitchen
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate Keto recipes from ingredients you have on hand using AI-powered recipe generation.
            </p>
          </div>

          {/* Visual Meal Logger Card */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Visual Meal Logger
            </h3>
            <p className="text-sm text-muted-foreground">
              Snap a photo of your meal and get instant Keto score, macro breakdown, and ingredient analysis.
            </p>
          </div>

          {/* Daily Journal Card */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Daily Journal
            </h3>
            <p className="text-sm text-muted-foreground">
              Log meals, fasting windows, ketone readings, and notes in your personal timeline.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-md mx-auto rounded-lg border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-2xl font-semibold text-card-foreground">
            Get Started
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in to begin your personalized Keto journey
          </p>
          <a
            href="/login"
            className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </a>
        </div>
      </section>
    </div>
  );
}
