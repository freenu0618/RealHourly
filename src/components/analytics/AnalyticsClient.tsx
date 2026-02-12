"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComparisonData } from "@/db/queries/analytics";
import { getDominantCurrency } from "@/lib/money/currency";
import { ClientSummaryCards } from "./ClientSummaryCards";
import { InsightCards } from "./InsightCards";
import { subDays, formatISO } from "date-fns";

const ChartSkeleton = () => <Skeleton className="h-[260px] w-full rounded-xl" />;
const HourlyRankingChart = dynamic(
  () => import("./HourlyRankingChart").then((m) => ({ default: m.HourlyRankingChart })),
  { ssr: false, loading: ChartSkeleton },
);
const RevenueTimeScatter = dynamic(
  () => import("./RevenueTimeScatter").then((m) => ({ default: m.RevenueTimeScatter })),
  { ssr: false, loading: ChartSkeleton },
);
const CategoryStackedBar = dynamic(
  () => import("./CategoryStackedBar").then((m) => ({ default: m.CategoryStackedBar })),
  { ssr: false, loading: ChartSkeleton },
);

type DateRangePreset = "7D" | "30D" | "3M" | "6M" | "All";

export function AnalyticsClient() {
  const t = useTranslations("analytics");
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();

        // Calculate date range based on preset
        if (selectedPreset !== "All") {
          const today = new Date();
          const daysMap: Record<Exclude<DateRangePreset, "All">, number> = {
            "7D": 7,
            "30D": 30,
            "3M": 90,
            "6M": 180,
          };
          const from = subDays(today, daysMap[selectedPreset]);
          params.set("from", formatISO(from, { representation: "date" }));
          params.set("to", formatISO(today, { representation: "date" }));
        }

        const url = `/api/analytics/comparison${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        setData(json.data);
      } catch {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t, selectedPreset]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl bg-muted" />
          <div className="h-4 w-72 rounded-lg bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!data || data.projects.length < 2) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed border-border p-12 text-center">
          <span className="text-5xl">{"📊"}</span>
          <h2 className="text-lg font-bold">{t("emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <Button asChild className="mt-2 rounded-xl">
            <Link href="/projects">{t("goToProjects")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const presets: DateRangePreset[] = ["7D", "30D", "3M", "6M", "All"];

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            size="sm"
            variant={selectedPreset === preset ? "default" : "outline"}
            onClick={() => {
              setSelectedPreset(preset);
              setLoading(true);
            }}
            className="rounded-xl"
          >
            {preset}
          </Button>
        ))}
      </div>

      {/* Insight Cards */}
      {data.insights.length > 0 && (
        <InsightCards
          insights={data.insights}
          avgRealHourly={data.avgRealHourly}
          totalRevenue={data.totalRevenue}
          totalHours={data.totalHours}
          currency={getDominantCurrency(data.projects)}
        />
      )}

      {/* Hourly Rate Ranking */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {"🏆"} {t("hourlyRanking")}
        </h2>
        <div className="rounded-[20px] border border-border/50 bg-card p-5">
          <HourlyRankingChart projects={data.projects} />
        </div>
      </section>

      {/* Revenue vs Time */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {"💰"} {t("revenueVsTime")}
        </h2>
        <div className="rounded-[20px] border border-border/50 bg-card p-5">
          <RevenueTimeScatter projects={data.projects} />
        </div>
      </section>

      {/* Category Distribution */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {"📋"} {t("categoryDistribution")}
        </h2>
        <div className="rounded-[20px] border border-border/50 bg-card p-5">
          <CategoryStackedBar projects={data.projects} />
        </div>
      </section>

      {/* Client Summary */}
      {data.byClient.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"👥"} {t("clientSummary")}
          </h2>
          <ClientSummaryCards
            clients={data.byClient}
            currency={getDominantCurrency(data.projects)}
          />
        </section>
      )}
    </div>
  );
}
