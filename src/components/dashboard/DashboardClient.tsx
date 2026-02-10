"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useDashboardData } from "./use-dashboard-data";
import { computeMetrics } from "./types";
import { DashboardKPICards } from "./DashboardKPICards";
import { DashboardWeeklyChart } from "./DashboardWeeklyChart";
import { DashboardRecentEntries } from "./DashboardRecentEntries";
import { DashboardAlertBanner } from "./DashboardAlertBanner";

function getGreeting(t: (key: string) => string): { emoji: string; text: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { emoji: "\u2600\uFE0F", text: t("greetingMorning") };
  if (hour >= 12 && hour < 18) return { emoji: "\uD83D\uDCAA", text: t("greetingAfternoon") };
  if (hour >= 18 && hour < 24) return { emoji: "\uD83C\uDF19", text: t("greetingEvening") };
  return { emoji: "\u2728", text: t("greetingNight") };
}

export function DashboardClient() {
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");
  const tTimeLog = useTranslations("timeLog");
  const { data, loading } = useDashboardData();

  if (loading) return <DashboardSkeleton />;

  if (!data || data.projects.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-7xl">{"\u2615"}</span>
          <h1 className="text-2xl font-bold md:text-3xl">{t("emptyTitle")}</h1>
          <p className="max-w-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
        <Button asChild className="rounded-xl bg-primary px-6 py-3 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:bg-[#6CA395] active:scale-[0.98]">
          <Link href="/projects">
            <Plus className="mr-2 size-5" />
            {t("createProject")}
          </Link>
        </Button>
      </div>
    );
  }

  const metrics = computeMetrics(data.projects);
  const greeting = getGreeting(t);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {greeting.emoji} {greeting.text}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.projects.length} {t("activeProjects")}
        </p>
      </div>

      <DashboardKPICards metrics={metrics} t={t} />
      <DashboardWeeklyChart weeklyMinutes={data.weeklyMinutes} t={t} />
      <DashboardRecentEntries entries={data.recentEntries} t={t} tTimeLog={tTimeLog} />

      {data.activeAlerts.length > 0 && (
        <DashboardAlertBanner alerts={data.activeAlerts} t={t} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-32 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[20px]" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-[20px]" />
      <Skeleton className="h-[200px] rounded-[20px]" />
    </div>
  );
}
