import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to KetoMate and continue your ketogenic journey. Access your personalized dashboard, recipes, and fasting tracker.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold rainbow-text">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue your Keto journey ✨
            </p>
          </div>
          {params?.error === "confirmation_failed" && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              Email confirmation failed. Please try clicking the confirmation link again or request a new one.
            </div>
          )}
          {params?.error === "reset_failed" && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              Password reset link is invalid or has expired. Please request a new password reset.
            </div>
          )}
          {params?.error === "reset_session_expired" && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              Your password reset session has expired. Please request a new password reset link.
            </div>
          )}
          {params?.error === "session_expired" && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              Your session has expired. Please try again.
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
