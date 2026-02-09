"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { ComparisonData } from "@/db/queries/analytics";
import { HourlyRankingChart } from "./HourlyRankingChart";
import { RevenueTimeScatter } from "./RevenueTimeScatter";
import { CategoryStackedBar } from "./CategoryStackedBar";
import { ClientSummaryCards } from "./ClientSummaryCards";
import { InsightCards } from "./InsightCards";

export function AnalyticsClient() {
  const t = useTranslations("analytics");
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/comparison");
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
  }, [t]);

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

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Insight Cards */}
      {data.insights.length > 0 && (
        <InsightCards
          insights={data.insights}
          avgRealHourly={data.avgRealHourly}
          totalRevenue={data.totalRevenue}
          totalHours={data.totalHours}
          currency={data.projects[0].currency}
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
            currency={data.projects[0].currency}
          />
        </section>
      )}
    </div>
  );
}
