"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { WeeklyReportData } from "@/lib/reports/collect-weekly-data";
import { DailyBarChart } from "./DailyBarChart";
import { ProjectDonut } from "./ProjectDonut";
import { CategoryBar } from "./CategoryBar";
import { addDays, subDays, startOfWeek } from "date-fns";
import { formatDate } from "@/lib/date";

interface WeeklyInsight {
  summary: string;
  projectBreakdown: { name: string; emoji: string; note: string }[];
  insights: { emoji: string; text: string }[];
  actions: { text: string; projectName: string | null }[];
}

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

function parseInsight(raw: string | null): WeeklyInsight | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.summary && Array.isArray(parsed.actions)) {
      return parsed as WeeklyInsight;
    }
    return null;
  } catch {
    return { summary: raw, projectBreakdown: [], insights: [], actions: [] };
  }
}

export function ReportDetailClient({ weekStart }: Props) {
  const t = useTranslations("reports");
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState<Map<number, "done" | "dismissed">>(new Map());

  useEffect(() => {
    async function fetch_() {
      setLoading(true);
      setActionStates(new Map());
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

  // Week navigation
  const prevWeek = formatDate(
    startOfWeek(subDays(new Date(weekStart), 1), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const nextWeek = formatDate(
    addDays(new Date(weekStart), 7),
    "yyyy-MM-dd",
  );
  const isFutureWeek = new Date(nextWeek) > new Date();

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
          <span className="text-4xl">{"\uD83D\uDCED"}</span>
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
  const insight = parseInsight(report.aiInsight);

  const startDisplay = formatDate(
    new Date(report.weekStart),
    "M\uC6D4 d\uC77C",
    "ko",
  );
  const endDisplay = formatDate(
    new Date(addDays(new Date(report.weekStart), 6)),
    "M\uC6D4 d\uC77C",
    "ko",
  );

  function handleActionDone(idx: number) {
    setActionStates((prev) => new Map(prev).set(idx, "done"));
  }

  function handleActionDismiss(idx: number) {
    setActionStates((prev) => new Map(prev).set(idx, "dismissed"));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs"
        >
          <Link href="/reports">{"\u2190"} {t("backToList")}</Link>
        </Button>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg">
            <Link href={`/reports/${prevWeek}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          {isFutureWeek ? (
            <Button variant="ghost" size="icon" className="size-8 rounded-lg" disabled>
              <ChevronRight className="size-4 text-muted-foreground/30" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg">
              <Link href={`/reports/${nextWeek}`}>
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* A) Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {"\uD83D\uDCCB"} {startDisplay} ~ {endDisplay} {t("weeklyReport")}
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
              {data.minutesDelta > 0 ? " \uD83D\uDCC8" : " \uD83D\uDCC9"}
            </span>
          )}
        </div>
      </div>

      {/* B) AI Summary */}
      {insight && (
        <section className="rounded-[20px] border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{"\uD83D\uDCA1"}</span>
            <h2 className="text-sm font-bold">{t("aiSummary")}</h2>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {insight.summary}
          </p>
        </section>
      )}

      {/* C) Project Breakdown (from AI) */}
      {insight && insight.projectBreakdown.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"\uD83D\uDCE6"} {t("projectBreakdown")}
          </h2>
          <div className="space-y-1.5">
            {insight.projectBreakdown.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-card px-4 py-2.5"
              >
                <span className="mt-0.5 text-base">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D) AI Insights */}
      {insight && insight.insights.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"\uD83D\uDD0D"} {t("aiInsights")}
          </h2>
          <div className="space-y-2">
            {insight.insights.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl border p-3 ${
                  ins.emoji === "\uD83D\uDEA8"
                    ? "border-destructive/20 bg-destructive/5"
                    : "border-primary/20 bg-primary/5"
                }`}
              >
                <span className="mt-0.5 text-base">{ins.emoji}</span>
                <p className="text-sm leading-relaxed text-foreground/90">{ins.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* E) Recommended Actions */}
      {insight && insight.actions.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"\u2705"} {t("recommendedActions")}
          </h2>
          <div className="space-y-2">
            {insight.actions.map((action, i) => {
              const state = actionStates.get(i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    state === "done"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      : state === "dismissed"
                        ? "border-muted bg-muted/50 opacity-50"
                        : "border-border/50 bg-card"
                  }`}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${state === "done" ? "line-through text-muted-foreground" : ""}`}>
                      {action.text}
                    </p>
                    {action.projectName && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {action.projectName}
                      </p>
                    )}
                  </div>
                  {!state && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900"
                        onClick={() => handleActionDone(i)}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:bg-muted"
                        onClick={() => handleActionDismiss(i)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  )}
                  {state === "done" && (
                    <span className="text-xs font-medium text-green-600">{t("actionDone")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* F) Daily Bar Chart */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {"\uD83D\uDCCA"} {t("dailyChart")}
        </h2>
        <div className="rounded-[20px] border border-border/50 bg-card p-5">
          <DailyBarChart
            dailyBreakdown={data.dailyBreakdown}
            weekStart={report.weekStart}
          />
        </div>
      </section>

      {/* G) Project Donut */}
      {data.byProject.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"\uD83C\uDF69"} {t("projectChart")}
          </h2>
          <div className="rounded-[20px] border border-border/50 bg-card p-5">
            <ProjectDonut projects={data.byProject} />
          </div>
        </section>
      )}

      {/* H) Category Distribution */}
      {data.byCategory.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {"\uD83D\uDCCB"} {t("categoryChart")}
          </h2>
          <div className="rounded-[20px] border border-border/50 bg-card p-5">
            <CategoryBar categories={data.byCategory} />
            {data.revisionPercent >= 30 && (
              <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-xs text-muted-foreground dark:bg-amber-950/30">
                {"\uD83D\uDCA1"}{" "}
                {t("revisionWarning", {
                  percent: String(data.revisionPercent),
                })}
              </p>
            )}
          </div>
        </section>
      )}

      {/* I) Comparison */}
      {data.prevWeekMinutes > 0 && data.minutesDelta !== 0 && (
        <section className="rounded-[20px] border border-border/50 bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            {"\uD83D\uDD04"} {t("comparison")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.minutesDelta > 0
              ? t("deltaUpComment", { hours: String(deltaHours) })
              : t("deltaDownComment", { hours: String(deltaHours) })}
            {data.minutesDelta > 0 ? " \u2615" : " \uD83C\uDF3F"}
          </p>
        </section>
      )}

      {/* Scope Alerts */}
      {data.scopeAlerts.length > 0 && (
        <section className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-destructive">
            {"\u26A0\uFE0F"} {t("scopeAlerts")}
          </h2>
          <ul className="space-y-1">
            {data.scopeAlerts.map((a, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {"\u2192"} {a.projectName} ({a.alertType})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
