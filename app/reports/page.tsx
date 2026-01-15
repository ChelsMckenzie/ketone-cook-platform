import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Monthly Reports",
  description: "View your monthly keto progress reports. Track fasting statistics, ketone levels, and health trends over time.",
  robots: { index: false, follow: false },
};
import { MonthlyOverview } from "@/components/reports/monthly-overview";
import { FastingStats } from "@/components/reports/fasting-stats";
import { KetoneChart } from "@/components/reports/ketone-chart";
import { startOfMonth, endOfMonth, format, subMonths, addMonths } from "date-fns";
import type { Log } from "@/types/database";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the month from query params or default to current month
  const params = await searchParams;
  const monthParam = params.month;
  const currentDate = monthParam ? new Date(monthParam + "-01") : new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Calculate previous and next month for navigation
  const prevMonth = format(subMonths(currentDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(currentDate, 1), "yyyy-MM");
  const isCurrentMonth =
    format(currentDate, "yyyy-MM") === format(new Date(), "yyyy-MM");

  // Fetch all logs for the month
  const { data: logsData } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", monthStart.toISOString())
    .lte("created_at", monthEnd.toISOString())
    .order("created_at", { ascending: true });

  const logs = (logsData as Log[]) || [];

  // Get user profile for fasting goal
  const { data: profileData } = await supabase
    .from("profile")
    .select("fasting_goal")
    .eq("id", user.id)
    .single();

  const fastingGoal = profileData?.fasting_goal || 16;

  // Process data for reports
  const ketoneReadings = logs
    .filter((log) => log.type === "ketone_reading" && log.macros?.ketone_reading)
    .map((log) => ({
      date: format(new Date(log.created_at), "MMM d"),
      fullDate: log.created_at,
      value: (log.macros as { ketone_reading?: number })?.ketone_reading || 0,
    }));

  const mealLogs = logs.filter((log) => log.type === "meal_note");
  const personalNotes = logs.filter((log) => log.type === "personal_note");

  // Calculate energy and mood averages from personal notes
  const energyReadings = personalNotes
    .filter((log) => log.macros?.energy_level)
    .map((log) => ({
      date: format(new Date(log.created_at), "MMM d"),
      value: (log.macros as { energy_level?: number })?.energy_level || 0,
    }));

  const moodReadings = personalNotes
    .filter((log) => log.macros?.mood)
    .map((log) => ({
      date: format(new Date(log.created_at), "MMM d"),
      value: (log.macros as { mood?: number })?.mood || 0,
    }));

  // Calculate averages
  const avgEnergy =
    energyReadings.length > 0
      ? energyReadings.reduce((sum, r) => sum + r.value, 0) / energyReadings.length
      : null;

  const avgMood =
    moodReadings.length > 0
      ? moodReadings.reduce((sum, r) => sum + r.value, 0) / moodReadings.length
      : null;

  const avgKetone =
    ketoneReadings.length > 0
      ? ketoneReadings.reduce((sum, r) => sum + r.value, 0) / ketoneReadings.length
      : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header with month navigation */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg rainbow-gradient p-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold rainbow-text">Monthly Reports</h1>
                <p className="text-muted-foreground">
                  Track your keto journey progress
                </p>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="icon">
                <Link href={`/reports?month=${prevMonth}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="min-w-[140px] text-center">
                <span className="text-lg font-semibold">
                  {format(currentDate, "MMMM yyyy")}
                </span>
              </div>
              <Button
                asChild
                variant="outline"
                size="icon"
                disabled={isCurrentMonth}
              >
                <Link
                  href={isCurrentMonth ? "#" : `/reports?month=${nextMonth}`}
                  className={isCurrentMonth ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Monthly Overview */}
          <MonthlyOverview
            totalLogs={logs.length}
            mealLogs={mealLogs.length}
            ketoneReadings={ketoneReadings.length}
            personalNotes={personalNotes.length}
            avgEnergy={avgEnergy}
            avgMood={avgMood}
            avgKetone={avgKetone}
            monthName={format(currentDate, "MMMM")}
          />

          {/* Fasting Stats */}
          <FastingStats
            fastingGoal={fastingGoal}
            mealLogs={mealLogs}
            monthStart={monthStart}
            monthEnd={monthEnd}
          />

          {/* Ketone Chart */}
          <KetoneChart
            readings={ketoneReadings}
            monthName={format(currentDate, "MMMM")}
          />
        </div>
      </div>
    </div>
  );
}
