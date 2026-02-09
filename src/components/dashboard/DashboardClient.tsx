"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/money/currency";
import { useCountUp } from "@/lib/hooks/use-count-up";

/* ── Types ── */

interface ProjectSummary {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  progressPercent: number;
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  totalMinutes: number;
  fixedCosts: number;
}

interface RecentEntry {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  minutes: number;
  category: string;
  taskDescription: string;
}

interface ActiveAlert {
  id: string;
  projectId: string;
  projectName: string;
  alertType: string;
  metadata: Record<string, unknown>;
}

interface DashboardData {
  projects: ProjectSummary[];
  recentEntries: RecentEntry[];
  activeAlerts: ActiveAlert[];
  weeklyMinutes: { date: string; minutes: number }[];
}

/* ── Category emoji map ── */
const CATEGORY_EMOJI: Record<string, string> = {
  planning: "\uD83D\uDCCB",
  design: "\uD83C\uDFA8",
  development: "\uD83D\uDCBB",
  meeting: "\uD83D\uDDE3\uFE0F",
  revision: "\uD83D\uDD04",
  admin: "\uD83D\uDCC2",
  email: "\uD83D\uDCE7",
  research: "\uD83D\uDD0D",
  other: "\uD83D\uDCCC",
};

/* ── Greeting helper ── */
function getGreeting(t: (key: string) => string): { emoji: string; text: string } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { emoji: "\u2600\uFE0F", text: t("greetingMorning") };
  if (hour >= 12 && hour < 18) return { emoji: "\uD83D\uDCAA", text: t("greetingAfternoon") };
  if (hour >= 18 && hour < 24) return { emoji: "\uD83C\uDF19", text: t("greetingEvening") };
  return { emoji: "\u2728", text: t("greetingNight") };
}

/* ── Compute derived metrics ── */
function computeMetrics(projects: ProjectSummary[]) {
  let totalRevenue = 0;
  let totalNet = 0;
  let totalCost = 0;
  let totalMinutes = 0;
  let weightedRealRate = 0;
  let rateCount = 0;

  for (const p of projects) {
    const gross = p.expectedFee;
    const platformFee = gross * p.platformFeeRate;
    const tax = gross * p.taxRate;
    const directCost = p.fixedCosts + platformFee + tax;
    const net = gross - directCost;
    const hours = p.totalMinutes / 60;
    const realHourly = hours > 0 ? net / hours : null;

    totalRevenue += gross;
    totalNet += net;
    totalCost += directCost;
    totalMinutes += p.totalMinutes;

    if (realHourly !== null) {
      weightedRealRate += realHourly;
      rateCount++;
    }
  }

  return {
    totalRevenue,
    totalNet,
    totalCost,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    avgRealRate: rateCount > 0 ? Math.round((weightedRealRate / rateCount) * 100) / 100 : null,
    currency: projects[0]?.currency ?? "USD",
  };
}

/* ── Main Component ── */

export function DashboardClient() {
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");
  const tTimeLog = useTranslations("timeLog");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  // Section G: Empty state
  if (!data || data.projects.length === 0) {
    return <EmptyState t={t} tProjects={tProjects} />;
  }

  const metrics = computeMetrics(data.projects);
  const greeting = getGreeting(t);

  return (
    <div className="space-y-8">
      {/* Section A: Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {greeting.emoji} {greeting.text}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.projects.length} {t("activeProjects")}
        </p>
      </div>

      {/* Section B: KPI Cards */}
      <KPISection metrics={metrics} t={t} />

      {/* Section D: Weekly Summary */}
      <WeeklySummary weeklyMinutes={data.weeklyMinutes} t={t} />

      {/* Section E: Recent Entries */}
      <RecentEntriesSection entries={data.recentEntries} t={t} tTimeLog={tTimeLog} />

      {/* Section F: Alert Banner */}
      {data.activeAlerts.length > 0 && (
        <AlertBanner alerts={data.activeAlerts} t={t} />
      )}
    </div>
  );
}

/* ── Section B: KPI Cards ── */

function KPISection({
  metrics,
  t,
}: {
  metrics: ReturnType<typeof computeMetrics>;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const animatedRevenue = useCountUp(metrics.totalRevenue, 1000);
  const animatedNet = useCountUp(metrics.totalNet, 1000);
  const animatedRate = useCountUp(metrics.avgRealRate, 1000);

  const cards = [
    {
      emoji: "\uD83D\uDCB0",
      label: t("totalRevenue"),
      value: formatCurrency(Math.round(animatedRevenue), metrics.currency),
    },
    {
      emoji: "\uD83D\uDCCA",
      label: t("kpiNetRevenue"),
      value: formatCurrency(Math.round(animatedNet), metrics.currency),
      highlight: metrics.totalNet < 0,
    },
    {
      emoji: "\u23F0",
      label: t("totalHours"),
      value: `${metrics.totalHours}h`,
    },
    {
      emoji: "\uD83D\uDCB8",
      label: t("avgHourlyRate"),
      value: metrics.avgRealRate !== null
        ? formatCurrency(Math.round(animatedRate * 100) / 100, metrics.currency)
        : "\u2014",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="rounded-[20px] border-warm-border transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <span className="text-3xl">{card.emoji}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{card.label}</p>
              <p
                className={`text-xl font-bold ${card.highlight ? "text-destructive" : ""}`}
                aria-live="polite"
              >
                {card.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Section D: Weekly Summary Bar Chart ── */

function WeeklySummary({
  weeklyMinutes,
  t,
}: {
  weeklyMinutes: { date: string; minutes: number }[];
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const totalWeeklyMinutes = weeklyMinutes.reduce((s, d) => s + d.minutes, 0);
  const hours = Math.floor(totalWeeklyMinutes / 60);
  const minutes = totalWeeklyMinutes % 60;

  // Format dates for display (day of week)
  const chartData = weeklyMinutes.map((d) => {
    const date = new Date(d.date + "T00:00:00");
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    return {
      name: dayName,
      hours: Math.round((d.minutes / 60) * 10) / 10,
    };
  });

  return (
    <Card className="rounded-[20px] border-warm-border">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{"\uD83D\uDCC5"} {t("weeklySummary")}</h2>
          {totalWeeklyMinutes > 0 && (
            <Badge variant="secondary" className="rounded-full text-xs font-medium">
              {t("weeklyTotal", { hours: String(hours), minutes: String(minutes) })}
            </Badge>
          )}
        </div>
        {chartData.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
            {t("noWeeklyData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DDD3" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8C7A6B" }} />
              <YAxis hide />
              <Tooltip
                formatter={(value) => [`${value}h`, ""]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E6DDD3",
                  backgroundColor: "#FFF8EE",
                }}
              />
              <Bar dataKey="hours" fill="#7EB5A6" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Section E: Recent Entries ── */

function RecentEntriesSection({
  entries,
  t,
  tTimeLog,
}: {
  entries: RecentEntry[];
  t: (key: string) => string;
  tTimeLog: (key: string) => string;
}) {
  if (entries.length === 0) {
    return (
      <Card className="rounded-[20px] border-warm-border">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="text-4xl">{"\u270D\uFE0F"}</span>
          <p className="text-sm text-muted-foreground">{t("noRecentEntries")}</p>
          <Link
            href="/time-log"
            className="text-sm font-medium text-primary underline"
          >
            {tTimeLog("title")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[20px] border-warm-border">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{"\uD83D\uDCDD"} {t("recentEntries")}</h2>
          <Link href="/time-log" className="text-xs font-medium text-primary hover:underline">
            {tTimeLog("title")} {"\u2192"}
          </Link>
        </div>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60"
            >
              <span className="text-lg">{CATEGORY_EMOJI[entry.category] ?? "\uD83D\uDCCC"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.taskDescription || entry.projectName}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.projectName} · {entry.date}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                {entry.minutes}{t("minutesShort")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Section F: Alert Banner ── */

function AlertBanner({
  alerts,
  t,
}: {
  alerts: ActiveAlert[];
  t: (key: string) => string;
}) {
  return (
    <Card className="rounded-[20px] border-amber-300/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-950/30">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">{t("alertBanner")}</h2>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/projects/${alert.projectId}`}
              className="flex items-center justify-between rounded-xl bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{"\uD83D\uDCA1"}</span>
                <span className="text-sm font-medium">{alert.projectName}</span>
              </div>
              <Badge className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs">
                {alert.alertType.replace("scope_", "Rule ")}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Section G: Empty State ── */

function EmptyState({
  t,
  tProjects,
}: {
  t: (key: string) => string;
  tProjects: (key: string) => string;
}) {
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

/* ── Loading Skeleton ── */

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
