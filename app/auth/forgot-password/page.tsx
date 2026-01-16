import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your KetoMate password. Enter your email address to receive a password reset link.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold rainbow-text">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          {params?.error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {params.error}
            </div>
          )}

          {params?.success && (
            <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              {params.success}
            </div>
          )}

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
