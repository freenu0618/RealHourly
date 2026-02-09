"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { WeeklyReportData } from "@/lib/reports/collect-weekly-data";
import { DailyBarChart } from "./DailyBarChart";
import { ProjectDonut } from "./ProjectDonut";
import { CategoryBar } from "./CategoryBar";
import { addDays } from "date-fns";
import { formatDate } from "@/lib/date";

interface ReportRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  data: WeeklyReportData;
  aiInsight: string | null;
}

interface Props {
  weekStart: string;
}

export function ReportDetailClient({ weekStart }: Props) {
  const t = useTranslations("reports");
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(
          `/api/reports/weekly?weekStart=${weekStart}`,
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        setReport(json.data);
      } catch {
        toast.error(t("fetchError"));
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [weekStart, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex flex-col items-center gap-4 rounded-[20px] border border-dashed p-12 text-center">
          <span className="text-4xl">{"📭"}</span>
          <p className="text-sm text-muted-foreground">{t("emptyWeek")}</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/reports">{t("backToList")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const data = report.data;
  const totalHours = Math.round((data.totalMinutes / 60) * 10) / 10;
  const deltaHours =
    Math.round((Math.abs(data.minutesDelta) / 60) * 10) / 10;

  const startDisplay = formatDate(
    new Date(report.weekStart),
    "M月 d日",
    "ko",
  );
  const endDisplay = formatDate(
    new Date(addDays(new Date(report.weekStart), 6)),
    "M月 d日",
    "ko",
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Back */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="rounded-xl text-xs"
      >
        <Link href="/reports">{"<"} {t("backToList")}</Link>
      </Button>

      {/* A) Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {"📋"} {startDisplay} ~ {endDisplay} {t("weeklyReport")}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-lg font-bold text-primary">
            {t("totalHours", { hours: String(totalHours) })}
          </span>
          {data.minutesDelta !== 0 && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                data.minutesDelta > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {data.minutesDelta > 0
                ? t("deltaUp", { hours: String(deltaHours) })
                : t("deltaDown", { hours: String(deltaHours) })}
              {data.minutesDelta > 0 ? " 📈" : " 📉"}
            </span>
          )}
        </div>
      </div>

      {/* B) AI Insight */}
      {report.aiInsight && (
        <section className="rounded-[20px] border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{"💡"}</span>
            <h2 className="text-sm font-bold">{t("aiInsight")}</h2>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {report.aiInsight}
          </p>
        </section>
      )}

      {/* C) Daily Bar Chart */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {"📊"} {t("dailyChart")}
        </h2>
        <div className="rounded-[20px] border border-border/50 bg-card p-5">
          <DailyBarChart
            dailyBreakdown={data.dailyBreakdown}
            weekStart={report.weekStart}
          />
        </div>
      </section>

      {/* D) Project Donut */}
      {data.byProject.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"🍩"} {t("projectChart")}
          </h2>
          <div className="rounded-[20px] border border-border/50 bg-card p-5">
            <ProjectDonut projects={data.byProject} />
          </div>
        </section>
      )}

      {/* E) Category Distribution */}
      {data.byCategory.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"📋"} {t("categoryChart")}
          </h2>
          <div className="rounded-[20px] border border-border/50 bg-card p-5">
            <CategoryBar categories={data.byCategory} />
            {data.revisionPercent >= 30 && (
              <p className="mt-3 rounded-xl bg-warning-soft/10 px-4 py-2 text-xs text-muted-foreground">
                {"💡"}{" "}
                {t("revisionWarning", {
                  percent: String(data.revisionPercent),
                })}
              </p>
            )}
          </div>
        </section>
      )}

      {/* F) Comparison */}
      {data.prevWeekMinutes > 0 && data.minutesDelta !== 0 && (
        <section className="rounded-[20px] border border-border/50 bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            {"🔄"} {t("comparison")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.minutesDelta > 0
              ? t("deltaUpComment", { hours: String(deltaHours) })
              : t("deltaDownComment", { hours: String(deltaHours) })}
            {data.minutesDelta > 0 ? " ☕" : " 🌿"}
          </p>
        </section>
      )}

      {/* Scope Alerts */}
      {data.scopeAlerts.length > 0 && (
        <section className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-destructive">
            {"⚠️"} {t("scopeAlerts")}
          </h2>
          <ul className="space-y-1">
            {data.scopeAlerts.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {"→"} {a.projectName} ({a.alertType})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
