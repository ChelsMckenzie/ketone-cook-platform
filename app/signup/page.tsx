import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join KetoMate for free. Start your ketogenic journey with AI-powered recipes, fasting tracker, and personalized meal planning.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Create Account</h1>
            <p className="text-muted-foreground">
              Start your personalized Keto journey today 🌈
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
