"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Link } from "@/i18n/navigation";
import { startOfWeek, subWeeks, addDays } from "date-fns";
import { formatDate } from "@/lib/date";
import { ChevronDown } from "lucide-react";

const INITIAL_WEEKS = 8;
const MAX_WEEKS = 20;

interface ReportRow {
  id: string;
  weekStart: string;
  weekEnd: string;
  data: { totalMinutes: number; entryCount: number };
}

export function ReportsListClient() {
  const t = useTranslations("reports");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [dataOnlyFilter, setDataOnlyFilter] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/reports/weekly");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setReports(json.data ?? []);
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(weekStart: string) {
    setGenerating(weekStart);
    try {
      const res = await fetch("/api/reports/weekly/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart }),
      });
      if (!res.ok) throw new Error();
      await fetchReports();
    } catch {
      toast.error(t("generateError"));
    } finally {
      setGenerating(null);
    }
  }

  async function handleBatchGenerate() {
    const reportMap = new Map(reports.map((r) => [r.weekStart, r]));
    const weeksToGenerate = weeks.filter((week) => {
      const report = reportMap.get(week.weekStart);
      const hasData = report && (report.data?.entryCount ?? 0) > 0;
      return hasData && !reportMap.has(week.weekStart);
    });

    if (weeksToGenerate.length === 0) return;

    setBatchProgress({ current: 0, total: weeksToGenerate.length });

    for (let i = 0; i < weeksToGenerate.length; i++) {
      try {
        const res = await fetch("/api/reports/weekly/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekStart: weeksToGenerate[i].weekStart }),
        });
        if (!res.ok) throw new Error();
        setBatchProgress({ current: i + 1, total: weeksToGenerate.length });
      } catch {
        toast.error(t("generateError"));
        break;
      }
    }

    await fetchReports();
    setBatchProgress(null);
    toast.success(t("batchComplete", { count: String(weeksToGenerate.length) }));
  }

  const weeks = Array.from({ length: MAX_WEEKS }, (_, i) => {
    const monday = startOfWeek(subWeeks(new Date(), i + 1), {
      weekStartsOn: 1,
    });
    const sunday = addDays(monday, 6);
    return {
      weekStart: formatDate(monday, "yyyy-MM-dd"),
      weekEnd: formatDate(sunday, "yyyy-MM-dd"),
      mondayDisplay: formatDate(monday, "M/d"),
      sundayDisplay: formatDate(sunday, "M/d"),
    };
  });

  const reportMap = new Map(reports.map((r) => [r.weekStart, r]));

  const filteredWeeks = dataOnlyFilter
    ? weeks.filter((week) => {
        const report = reportMap.get(week.weekStart);
        return report && (report.data?.entryCount ?? 0) > 0;
      })
    : weeks;

  const visibleWeeks = showAll ? filteredWeeks : filteredWeeks.slice(0, INITIAL_WEEKS);

  const weeksNeedingGeneration = weeks.filter((week) => {
    const report = reportMap.get(week.weekStart);
    const hasData = report && (report.data?.entryCount ?? 0) > 0;
    return hasData && !report.id;
  }).length;

  const totalReportsGenerated = reports.filter((r) => r.id).length;
  const totalHoursAll = Math.round(
    reports.reduce((sum, r) => sum + (r.data?.totalMinutes ?? 0), 0) / 60 * 10
  ) / 10;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("totalReports")}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            <NumberTicker value={totalReportsGenerated} />
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t("totalHoursAll")}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            <NumberTicker value={totalHoursAll} />
            <span className="ml-1 text-sm font-normal text-muted-foreground">{t("hours")}</span>
          </p>
        </div>
      </div>

      {/* Filter and Batch Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant={dataOnlyFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setDataOnlyFilter(!dataOnlyFilter)}
          className="rounded-xl text-xs"
        >
          {t("dataOnlyFilter")}
        </Button>
        {weeksNeedingGeneration > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchGenerate}
            disabled={batchProgress !== null}
            className="rounded-xl text-xs"
          >
            {t("batchGenerate", { count: String(weeksNeedingGeneration) })}
          </Button>
        )}
      </div>

      {/* Batch Progress Bar */}
      {batchProgress && (
        <div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {t("batchProgress", {
                current: String(batchProgress.current),
                total: String(batchProgress.total),
              })}
            </span>
          </div>
          <Progress value={(batchProgress.current / batchProgress.total) * 100} />
        </div>
      )}

      <div className="space-y-3">
        {visibleWeeks.map((week) => {
          const report = reportMap.get(week.weekStart);
          const isGenerating = generating === week.weekStart;
          const hasData = report && (report.data?.entryCount ?? 0) > 0;

          return (
            <div
              key={week.weekStart}
              className={`flex items-center justify-between rounded-[16px] border px-5 py-4 ${
                hasData
                  ? "border-border/50 bg-card"
                  : "border-border/30 bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{hasData ? "\uD83D\uDCCB" : "\uD83D\uDCC4"}</span>
                <div>
                  <p className={`text-sm font-medium ${!hasData ? "text-muted-foreground" : ""}`}>
                    {week.mondayDisplay} ~ {week.sundayDisplay}
                  </p>
                  {hasData ? (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        ((report.data?.totalMinutes ?? 0) / 60) * 10,
                      ) / 10}
                      {t("hours")} | {t("entries", { count: String(report.data?.entryCount ?? 0) })}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">
                      {t("noEntries")}
                    </p>
                  )}
                </div>
              </div>

              {report ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs"
                >
                  <Link href={`/reports/${week.weekStart}`}>
                    {t("viewReport")}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                  onClick={() => handleGenerate(week.weekStart)}
                  disabled={isGenerating}
                >
                  {isGenerating ? t("generating") : t("generate")}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {!showAll && filteredWeeks.length > INITIAL_WEEKS && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 rounded-xl text-xs text-muted-foreground"
            onClick={() => setShowAll(true)}
          >
            <ChevronDown className="size-3.5" />
            {t("showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
